import express, { Request, Response } from 'express';
import pool from '../db/connection.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// Role permissions mapping
const rolePermissions: Record<string, string[]> = {
  SUDO: [
    'VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT',
    'VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE',
    'VIEW_LAB', 'ENTER_RESULTS',
    'VIEW_APPROVER', 'APPROVE_RESULTS',
    'VIEW_ADMIN_PANEL', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_TESTS', 'MANAGE_PRICES', 'MANAGE_B2B', 'MANAGE_ANTIBIOTICS',
    'EDIT_APPROVED_REPORT', 'VIEW_AUDIT_LOG'
  ],
  ADMIN: [
    'VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT',
    'VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE',
    'VIEW_LAB', 'ENTER_RESULTS',
    'VIEW_APPROVER', 'APPROVE_RESULTS',
    'VIEW_ADMIN_PANEL', 'MANAGE_TESTS', 'MANAGE_PRICES', 'MANAGE_B2B', 'MANAGE_ANTIBIOTICS'
  ],
  RECEPTION: ['VIEW_RECEPTION', 'CREATE_VISIT', 'COLLECT_DUE_PAYMENT'],
  PHLEBOTOMY: ['VIEW_PHLEBOTOMY', 'COLLECT_SAMPLE'],
  LAB: ['VIEW_LAB', 'ENTER_RESULTS'],
  APPROVER: ['VIEW_APPROVER', 'APPROVE_RESULTS'],
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('Querying database for user:', username);
    const result = await pool.query(
      'SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1',
      [username]
    );
    console.log('Query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    console.log('Comparing passwords...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const permissions = rolePermissions[user.role] || [];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log('Login successful for user:', username);
    // Store token in localStorage on client side
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        permissions,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint - checks if token is valid AND user is still active
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };

    // Check if user is still active in database
    const userResult = await pool.query(
      'SELECT id, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Client login endpoint
router.post('/client-login', async (req: Request, res: Response) => {
  try {
    console.log('Client login attempt:', req.body);
    const { clientId, password } = req.body;

    if (!clientId || !password) {
      return res.status(400).json({ error: 'Client ID and password are required' });
    }

    // Get client and login credentials
    const result = await pool.query(
      `SELECT c.id, c.name, c.type, c.balance, bcl.password_hash, bcl.is_active
       FROM clients c
       LEFT JOIN b2b_client_logins bcl ON c.id = bcl.client_id
       WHERE c.id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Client not found' });
    }

    const client = result.rows[0];

    if (!client.password_hash) {
      return res.status(401).json({ error: 'Client login not configured' });
    }

    if (!client.is_active) {
      return res.status(401).json({ error: 'Client account is inactive' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, client.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE b2b_client_logins SET last_login = CURRENT_TIMESTAMP WHERE client_id = $1',
      [clientId]
    );

    // Generate JWT token for client
    const token = jwt.sign(
      {
        id: client.id,
        name: client.name,
        type: 'CLIENT',
        clientType: client.type,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log('Client login successful for client:', client.name);
    res.json({
      token,
      client: {
        id: client.id,
        name: client.name,
        type: client.type,
        balance: parseFloat(client.balance),
      },
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify client token endpoint
router.post('/verify-client', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string; type: string };

    if (decoded.type !== 'CLIENT') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Check if client is still active
    const clientResult = await pool.query(
      'SELECT id, is_active FROM b2b_client_logins WHERE client_id = $1',
      [decoded.id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(401).json({ error: 'Client not found' });
    }

    const clientLogin = clientResult.rows[0];

    if (!clientLogin.is_active) {
      return res.status(401).json({ error: 'Client account is inactive' });
    }

    res.json({ valid: true, client: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

