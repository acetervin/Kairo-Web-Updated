const { Router } = require('express');
const { pool } = require('../db');

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const rows = await pool.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [id]);
    if (rows.rows.length === 0) return res.status(404).json({ error: 'not found' });
    res.json(rows.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'failed to load booking' });
  }
});

module.exports = router;


