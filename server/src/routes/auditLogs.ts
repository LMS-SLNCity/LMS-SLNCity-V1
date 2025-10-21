import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, timestamp, username, action, details FROM audit_logs ORDER BY timestamp DESC LIMIT 1000'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, action, details } = req.body;
    const result = await pool.query(
      'INSERT INTO audit_logs (username, action, details) VALUES ($1, $2, $3) RETURNING id, timestamp, username, action, details',
      [username, action, details]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

