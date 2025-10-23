import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name FROM referral_doctors ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching referral doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name FROM referral_doctors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Referral doctor not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching referral doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO referral_doctors (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating referral doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE referral_doctors SET name = COALESCE($1, name), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name',
      [name, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Referral doctor not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating referral doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM referral_doctors WHERE id = $1 RETURNING id, name',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Referral doctor not found' });
    res.json({ message: 'Referral doctor deleted successfully', doctor: result.rows[0] });
  } catch (error) {
    console.error('Error deleting referral doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

