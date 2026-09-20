import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all social posts with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT sp.*, u.username, u.avatar_url, u.full_name,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = sp.id) as likes_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = sp.id) as comments_count
       FROM social_posts sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.is_public = true
       ORDER BY sp.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a post
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { content, image_urls } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      'INSERT INTO social_posts (user_id, content, image_urls, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, content, image_urls || [], true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like a post
router.post('/:postId/like', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [req.userId, postId]
    );

    if (result.rows.length === 0) {
      // Unlike
      await pool.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [req.userId, postId]
      );
      return res.json({ liked: false });
    }

    res.status(201).json({ liked: true });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Get post comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `SELECT pc.*, u.username, u.avatar_url
       FROM post_comments pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.post_id = $1
       ORDER BY pc.created_at DESC`,
      [postId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment
router.post('/:postId/comments', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      'INSERT INTO post_comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, postId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
