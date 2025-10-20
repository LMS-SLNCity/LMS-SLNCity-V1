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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query(
      'SELECT id, username, password_hash, role, is_active FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

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

    res.json({
      token,
      id: user.id,
      username: user.username,
      role: user.role,
      isActive: user.is_active,
      permissions,
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

export default router;

