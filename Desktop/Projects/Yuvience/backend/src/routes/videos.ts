import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all videos (public feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT v.*, u.username, u.avatar_url
       FROM videos v
       JOIN users u ON v.user_id = u.id
       WHERE v.is_public = true
       ORDER BY v.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Upload video
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, video_url, thumbnail_url, duration } = req.body;

    const result = await pool.query(
      'INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, duration, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.userId, title, description, video_url, thumbnail_url, duration, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get user's videos
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT * FROM videos WHERE user_id = $1 AND is_public = true ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Failed to fetch user videos' });
  }
});

export default router;
