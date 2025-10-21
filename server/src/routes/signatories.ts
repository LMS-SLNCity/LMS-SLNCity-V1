import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all active approvers (signatories)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role FROM users WHERE role = $1 AND is_active = true ORDER BY username',
      ['APPROVER']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching signatories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific approver (signatory)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role FROM users WHERE id = $1 AND role = $2 AND is_active = true',
      [req.params.id, 'APPROVER']
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Approver not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching signatory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

