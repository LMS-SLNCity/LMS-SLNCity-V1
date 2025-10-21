import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, type, balance FROM clients ORDER BY id');
    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: parseFloat(row.balance),
    })));
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, type, balance FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: parseFloat(row.balance),
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (name, type, balance) VALUES ($1, $2, $3) RETURNING id, name, type, balance',
      [name, type, 0]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: parseFloat(row.balance),
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { name, type, balance } = req.body;
    const result = await pool.query(
      'UPDATE clients SET name = COALESCE($1, name), type = COALESCE($2, type), balance = COALESCE($3, balance), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, type, balance',
      [name, type, balance, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: parseFloat(row.balance),
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client prices
router.get('/:id/prices', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, client_id, test_template_id, price FROM client_prices WHERE client_id = $1',
      [req.params.id]
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      testTemplateId: row.test_template_id,
      price: parseFloat(row.price),
    })));
  } catch (error) {
    console.error('Error fetching client prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client prices
router.post('/:id/prices', async (req: Request, res: Response) => {
  try {
    const { clientId, prices } = req.body;
    const client = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (client.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    // Delete existing prices
    await pool.query('DELETE FROM client_prices WHERE client_id = $1', [clientId]);

    // Insert new prices
    for (const price of prices) {
      await pool.query(
        'INSERT INTO client_prices (client_id, test_template_id, price) VALUES ($1, $2, $3)',
        [clientId, price.testTemplateId, price.price]
      );
    }

    res.json({ message: 'Client prices updated' });
  } catch (error) {
    console.error('Error updating client prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

