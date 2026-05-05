const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (err) {
    console.log('Email not sent:', err.message);
  }
}

router.post('/', authMiddleware, async (req, res) => {
  const { slot_id, thesis_title } = req.body;
  try {
    const [slot] = await db.query('SELECT * FROM slots WHERE id = ?', [slot_id]);
    if (slot.length === 0) return res.status(404).json({ error: 'Slot not found.' });
    if (slot[0].current_bookings >= slot[0].max_bookings) return res.status(400).json({ error: 'Slot is fully booked.' });
    const [existing] = await db.query('SELECT * FROM bookings WHERE student_id = ? AND slot_id = ?', [req.user.id, slot_id]);
    if (existing.length > 0) return res.status(400).json({ error: 'You already booked this slot.' });
    await db.query('INSERT INTO bookings (student_id, slot_id, thesis_title) VALUES (?, ?, ?)', [req.user.id, slot_id, thesis_title]);
    await db.query('UPDATE slots SET current_bookings = current_bookings + 1, status = CASE WHEN current_bookings + 1 >= max_bookings THEN "booked" ELSE "open" END WHERE id = ?', [slot_id]);
    res.json({ message: 'Slot booked successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT bookings.*, slots.date, slots.start_time, slots.end_time, slots.room,
             supervisors.name AS supervisor_name
      FROM bookings
      JOIN slots ON bookings.slot_id = slots.id
      LEFT JOIN supervisors ON slots.supervisor_id = supervisors.id
      WHERE bookings.student_id = ?
    `, [req.user.id]);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [booking] = await db.query('SELECT * FROM bookings WHERE id = ? AND student_id = ?', [req.params.id, req.user.id]);
    if (booking.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    const slotId = booking[0].slot_id;
    await db.query('UPDATE slots SET status = "open" WHERE id = ?', [slotId]);
    await db.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    const [nextInLine] = await db.query('SELECT * FROM waitlist WHERE slot_id = ? ORDER BY created_at ASC LIMIT 1', [slotId]);
    if (nextInLine.length > 0) {
      console.log(`Slot ${slotId} is now available. Next in waitlist: student ${nextInLine[0].student_id}`);
    }
    res.json({ message: 'Booking cancelled. Waitlist notified if applicable.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT bookings.*, slots.date, slots.start_time, slots.end_time, slots.room,
             users.name AS student_name, users.student_id AS student_code,
             supervisors.name AS supervisor_name
      FROM bookings
      JOIN slots ON bookings.slot_id = slots.id
      JOIN users ON bookings.student_id = users.id
      LEFT JOIN supervisors ON slots.supervisor_id = supervisors.id
      ORDER BY slots.date, slots.start_time
    `);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;