import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all active approvers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM approvers WHERE is_active = true ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approvers:', error);
    res.status(500).json({ error: 'Failed to fetch approvers' });
  }
});

// Get approver by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM approvers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approver not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching approver:', error);
    res.status(500).json({ error: 'Failed to fetch approver' });
  }
});

export default router;

