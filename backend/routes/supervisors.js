const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [supervisors] = await db.query('SELECT * FROM supervisors');
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;