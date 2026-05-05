const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

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

router.post('/register', async (req, res) => {
  const { name, student_id, email, password, department } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, student_id, email, password, department) VALUES (?, ?, ?, ?, ?)',
      [name, student_id, email, hashed, department]
    );
    res.json({ message: 'Registered successfully!' });
  } catch (err) {
    res.status(400).json({ error: 'Email or Student ID already exists.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found.' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password.' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, student_id: user.student_id, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  try {
    const [[{ total_students }]] = await db.query('SELECT COUNT(*) as total_students FROM users WHERE role = "student"');
    const [[{ total_slots }]] = await db.query('SELECT COUNT(*) as total_slots FROM slots');
    const [[{ booked_slots }]] = await db.query('SELECT COUNT(*) as booked_slots FROM slots WHERE status = "booked"');
    const [[{ open_slots }]] = await db.query('SELECT COUNT(*) as open_slots FROM slots WHERE status = "open"');
    const [[{ total_bookings }]] = await db.query('SELECT COUNT(*) as total_bookings FROM bookings');
    const [supervisor_stats] = await db.query(`
      SELECT supervisors.name, COUNT(bookings.id) as total_bookings
      FROM supervisors
      LEFT JOIN slots ON supervisors.id = slots.supervisor_id
      LEFT JOIN bookings ON slots.id = bookings.slot_id
      GROUP BY supervisors.id, supervisors.name
      ORDER BY total_bookings DESC
    `);
    const [department_stats] = await db.query(`
      SELECT department, COUNT(*) as total
      FROM users
      WHERE role = 'student'
      GROUP BY department
      ORDER BY total DESC
    `);
    const [recent_bookings] = await db.query(`
      SELECT bookings.*, users.name as student_name, users.student_id as student_code,
             users.department, slots.date, slots.start_time, slots.end_time, slots.room,
             supervisors.name as supervisor_name
      FROM bookings
      JOIN users ON bookings.student_id = users.id
      JOIN slots ON bookings.slot_id = slots.id
      LEFT JOIN supervisors ON slots.supervisor_id = supervisors.id
      ORDER BY bookings.created_at DESC
      LIMIT 10
    `);
    res.json({ total_students, total_slots, booked_slots, open_slots, total_bookings, supervisor_stats, department_stats, recent_bookings });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;