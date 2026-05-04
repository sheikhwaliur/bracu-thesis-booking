const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

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

router.get('/', async (req, res) => {
  try {
    const [slots] = await db.query(`
      SELECT slots.*, supervisors.name AS supervisor_name
      FROM slots
      LEFT JOIN supervisors ON slots.supervisor_id = supervisors.id
      ORDER BY slots.date, slots.start_time
    `);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  const { date, start_time, end_time, room, supervisor_id } = req.body;
  try {
    await db.query(
      'INSERT INTO slots (date, start_time, end_time, room, supervisor_id) VALUES (?, ?, ?, ?, ?)',
      [date, start_time, end_time, room, supervisor_id]
    );
    res.json({ message: 'Slot created!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  try {
    await db.query('DELETE FROM slots WHERE id = ?', [req.params.id]);
    res.json({ message: 'Slot deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;