import { Router } from 'express';
import { sql } from '../db/index.js';

export const sessionsRouter = Router();

// GET /api/sessions — Get all sessions (for now, all; later filter by auth user)
sessionsRouter.get('/', async (req, res) => {
  try {
    const sessions = await sql`
      SELECT * FROM sessions ORDER BY created_at DESC
    `;
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// POST /api/sessions — Create new session
sessionsRouter.post('/', async (req, res) => {
  try {
    const { role, domain, difficulty, persona, mode, resume_url, resume_text, user_id } = req.body;
    if (!role || !domain || !difficulty) {
      return res.status(400).json({ error: 'role, domain, and difficulty are required' });
    }

    const actualUserId = user_id || 'anonymous';

    // Ensure the user exists in the database to satisfy foreign key constraints
    await sql`
      INSERT INTO users (id, email, name)
      VALUES (${actualUserId}, ${actualUserId === 'anonymous' ? 'guest@intellimock.com' : 'user@intellimock.com'}, 'Guest')
      ON CONFLICT (id) DO NOTHING
    `;

    const result = await sql`
      INSERT INTO sessions (user_id, role, domain, difficulty, persona, mode, resume_url, resume_text)
      VALUES (${actualUserId}, ${role}, ${domain}, ${difficulty}, ${persona || 'default'}, ${mode || 'chat'}, ${resume_url || null}, ${resume_text || null})
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:id — Get session with messages
sessionsRouter.get('/:id', async (req, res) => {
  try {
    const session = await sql`SELECT * FROM sessions WHERE id = ${req.params.id}`;
    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messages = await sql`
      SELECT * FROM messages WHERE session_id = ${req.params.id} ORDER BY created_at ASC
    `;

    res.json({ ...session[0], messages });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// DELETE /api/sessions/:id
sessionsRouter.delete('/:id', async (req, res) => {
  try {
    await sql`DELETE FROM sessions WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});
