import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all role permissions
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT role, permissions FROM role_permissions ORDER BY role'
    );
    
    const rolePermissions: Record<string, string[]> = {};
    result.rows.forEach(row => {
      rolePermissions[row.role] = row.permissions || [];
    });
    
    res.json(rolePermissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get permissions for a specific role
router.get('/:role', async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    
    const result = await pool.query(
      'SELECT permissions FROM role_permissions WHERE role = $1',
      [role]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ role, permissions: result.rows[0].permissions || [] });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update permissions for a specific role (SUDO role cannot be edited)
router.patch('/:role', async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    
    // Prevent editing SUDO role
    if (role === 'SUDO') {
      return res.status(403).json({ error: 'SUDO role permissions cannot be edited' });
    }
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array' });
    }
    
    const result = await pool.query(
      'UPDATE role_permissions SET permissions = $1, updated_at = CURRENT_TIMESTAMP WHERE role = $2 RETURNING role, permissions',
      [permissions, role]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    console.log(`✅ Updated permissions for role ${role}:`, permissions);
    res.json({ role: result.rows[0].role, permissions: result.rows[0].permissions });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

