import express, { Request, Response } from 'express';
import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';

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

// Add client payment (ledger entry)
router.post('/:id/payment', async (req: Request, res: Response) => {
  try {
    const { amount, description } = req.body;
    const clientId = req.params.id;

    // Verify client exists
    const client = await pool.query('SELECT id, balance FROM clients WHERE id = $1', [clientId]);
    if (client.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    // Create ledger entry for payment (CREDIT)
    const ledgerResult = await pool.query(
      'INSERT INTO ledger_entries (client_id, type, amount, description) VALUES ($1, $2, $3, $4) RETURNING id, client_id, type, amount, description, created_at',
      [clientId, 'CREDIT', amount, description]
    );

    // Update client balance
    const newBalance = parseFloat(client.rows[0].balance) - amount;
    await pool.query(
      'UPDATE clients SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, clientId]
    );

    res.json({
      ledgerEntry: ledgerResult.rows[0],
      newBalance: newBalance,
    });
  } catch (error) {
    console.error('Error adding client payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete client
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;

    // Verify client exists
    const client = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (client.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    // Delete client
    await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settle client balance (set to 0)
router.post('/:id/settle', async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;

    // Verify client exists
    const client = await pool.query('SELECT id, balance FROM clients WHERE id = $1', [clientId]);
    if (client.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    const previousBalance = parseFloat(client.rows[0].balance);

    // Create ledger entry for settlement
    if (previousBalance !== 0) {
      await pool.query(
        'INSERT INTO ledger_entries (client_id, type, amount, description) VALUES ($1, $2, $3, $4)',
        [clientId, 'CREDIT', Math.abs(previousBalance), `Settlement of balance: ₹${previousBalance}`]
      );
    }

    // Set balance to 0
    await pool.query(
      'UPDATE clients SET balance = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [clientId]
    );

    res.json({
      message: 'Client balance settled',
      previousBalance: previousBalance,
      newBalance: 0
    });
  } catch (error) {
    console.error('Error settling client balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set up client login credentials
router.post('/:id/setup-login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const clientId = req.params.id;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Verify client exists
    const client = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (client.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert or update login credentials
    const result = await pool.query(
      `INSERT INTO b2b_client_logins (client_id, password_hash, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (client_id) DO UPDATE SET password_hash = $2, is_active = true
       RETURNING client_id, is_active`,
      [clientId, hashedPassword]
    );

    res.json({
      message: 'Client login credentials set up successfully',
      clientId: result.rows[0].client_id,
      isActive: result.rows[0].is_active,
    });
  } catch (error) {
    console.error('Error setting up client login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client login status
router.get('/:id/login-status', async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;

    const result = await pool.query(
      `SELECT bcl.client_id, bcl.is_active, bcl.last_login, c.name, c.type
       FROM b2b_client_logins bcl
       JOIN clients c ON bcl.client_id = c.id
       WHERE bcl.client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.json({
        clientId: clientId,
        hasLogin: false,
        isActive: false,
      });
    }

    const row = result.rows[0];
    res.json({
      clientId: row.client_id,
      name: row.name,
      type: row.type,
      hasLogin: true,
      isActive: row.is_active,
      lastLogin: row.last_login,
    });
  } catch (error) {
    console.error('Error fetching client login status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable client login
router.post('/:id/disable-login', async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;

    const result = await pool.query(
      'UPDATE b2b_client_logins SET is_active = false WHERE client_id = $1 RETURNING client_id, is_active',
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client login not found' });
    }

    res.json({
      message: 'Client login disabled',
      clientId: result.rows[0].client_id,
      isActive: result.rows[0].is_active,
    });
  } catch (error) {
    console.error('Error disabling client login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single client (must be after all specific routes)
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

// Update client (must be after all specific routes)
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

export default router;

