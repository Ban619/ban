import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get user's followers count and following count
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const followersResult = await pool.query(
      'SELECT COUNT(*) as count FROM followers WHERE following_id = $1',
      [userId]
    );

    const followingResult = await pool.query(
      'SELECT COUNT(*) as count FROM followers WHERE follower_id = $1',
      [userId]
    );

    res.json({
      followers: parseInt(followersResult.rows[0].count),
      following: parseInt(followingResult.rows[0].count),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get user's following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Follow user
router.post('/:userId/follow', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const result = await pool.query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [req.userId, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'Already following' });
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.post('/:userId/unfollow', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2 RETURNING *',
      [req.userId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

export default router;
