import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all music tracks
router.get('/tracks', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM music_tracks ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Get user's playlists
router.get('/playlists', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT up.*, COUNT(pt.id) as track_count
       FROM user_playlists up
       LEFT JOIN playlist_tracks pt ON up.id = pt.playlist_id
       WHERE up.user_id = $1
       GROUP BY up.id
       ORDER BY up.created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Create playlist
router.post('/playlists', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      'INSERT INTO user_playlists (user_id, title, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, title, description, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist tracks
router.get('/playlists/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;

    const result = await pool.query(
      `SELECT mt.*, pt.position
       FROM playlist_tracks pt
       JOIN music_tracks mt ON pt.track_id = mt.id
       WHERE pt.playlist_id = $1
       ORDER BY pt.position ASC`,
      [playlistId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get playlist tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

// Add track to playlist
router.post('/playlists/:playlistId/tracks', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { playlistId } = req.params;
    const { track_id } = req.body;

    // Get max position
    const posResult = await pool.query(
      'SELECT MAX(position) as max_pos FROM playlist_tracks WHERE playlist_id = $1',
      [playlistId]
    );

    const position = (posResult.rows[0]?.max_pos || 0) + 1;

    const result = await pool.query(
      'INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES ($1, $2, $3) RETURNING *',
      [playlistId, track_id, position]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add track error:', error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

export default router;
