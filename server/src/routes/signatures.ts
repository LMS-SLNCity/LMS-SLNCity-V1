import express, { Request, Response } from 'express';
import pool from '../db/connection.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Directory for storing signature images
const SIGNATURES_DIR = path.join(process.cwd(), 'public', 'signatures');

// Ensure signatures directory exists
if (!fs.existsSync(SIGNATURES_DIR)) {
  fs.mkdirSync(SIGNATURES_DIR, { recursive: true });
}

// Get signature for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, signature_image_url FROM users WHERE id = $1',
      [req.params.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    res.json({
      userId: user.id,
      signatureImageUrl: user.signature_image_url,
    });
  } catch (error) {
    console.error('Error fetching signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload/Update signature for a user
router.post('/upload/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { imageData } = req.body; // Base64 encoded image data

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Extract base64 string and file type
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    const [, fileType, base64Data] = matches;
    const filename = `signature_${userId}_${Date.now()}.${fileType}`;
    const filepath = path.join(SIGNATURES_DIR, filename);

    // Write file
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filepath, buffer);

    // Update database
    const signatureUrl = `/signatures/${filename}`;
    const result = await pool.query(
      'UPDATE users SET signature_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, signature_image_url',
      [signatureUrl, userId]
    );

    if (result.rows.length === 0) {
      // Clean up file if user not found
      fs.unlinkSync(filepath);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: result.rows[0].id,
      signatureImageUrl: result.rows[0].signature_image_url,
      message: 'Signature uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete signature for a user
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT signature_image_url FROM users WHERE id = $1',
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const signatureUrl = result.rows[0].signature_image_url;
    if (signatureUrl) {
      const filepath = path.join(process.cwd(), 'public', signatureUrl);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Update database
    await pool.query(
      'UPDATE users SET signature_image_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.params.userId]
    );

    res.json({ message: 'Signature deleted successfully' });
  } catch (error) {
    console.error('Error deleting signature:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

