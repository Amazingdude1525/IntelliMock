import { Router } from 'express';
import { sql } from '../db/index.js';

export const usersRouter = Router();

// POST /api/users/sync — Sync Clerk user to Neon on first login
usersRouter.post('/sync', async (req, res) => {
  try {
    const { id, email, name, avatar_url } = req.body;
    if (!id || !email) {
      return res.status(400).json({ error: 'id and email are required' });
    }

    await sql`
      INSERT INTO users (id, email, name, avatar_url)
      VALUES (${id}, ${email}, ${name || null}, ${avatar_url || null})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url
    `;

    res.json({ success: true });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});
