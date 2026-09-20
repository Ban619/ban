import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's albums
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT ma.*, COUNT(mp.id) as photo_count
       FROM memories_albums ma
       LEFT JOIN memory_photos mp ON ma.id = mp.album_id
       WHERE ma.user_id = $1
       GROUP BY ma.id
       ORDER BY ma.created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Create album
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      'INSERT INTO memories_albums (user_id, title, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, title, description, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ error: 'Failed to create album' });
  }
});

// Get album photos
router.get('/:albumId/photos', async (req, res) => {
  try {
    const { albumId } = req.params;

    const result = await pool.query(
      'SELECT * FROM memory_photos WHERE album_id = $1 ORDER BY created_at DESC',
      [albumId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Add photo to album
router.post('/:albumId/photos', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { albumId } = req.params;
    const { image_url, caption } = req.body;

    const result = await pool.query(
      'INSERT INTO memory_photos (album_id, user_id, image_url, caption) VALUES ($1, $2, $3, $4) RETURNING *',
      [albumId, req.userId, image_url, caption]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

export default router;
