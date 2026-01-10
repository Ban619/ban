import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get study resources
router.get('/resources', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM study_resources WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create study resource
router.post('/resources', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, difficulty_level, resource_url } = req.body;

    const result = await pool.query(
      'INSERT INTO study_resources (user_id, title, description, category, difficulty_level, resource_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, title, description, category, difficulty_level, resource_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Get study notes
router.get('/notes', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM study_notes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create study note
router.post('/notes', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, content, subject, is_public } = req.body;

    const result = await pool.query(
      'INSERT INTO study_notes (user_id, title, content, subject, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, title, content, subject, is_public || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update study note
router.put('/notes/:noteId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, subject, is_public } = req.body;

    const result = await pool.query(
      'UPDATE study_notes SET title = $1, content = $2, subject = $3, is_public = $4, updated_at = NOW() WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, content, subject, is_public, noteId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

export default router;
