import { Router } from 'express';
import { sql } from '../db/index.js';
import { buildFeedbackPrompt, sendToGroqNonStream } from '../services/groq.js';

export const feedbackRouter = Router();

// POST /api/feedback/generate — Generate AI feedback for a session
feedbackRouter.post('/generate', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    // Get session info
    const session = await sql`SELECT * FROM sessions WHERE id = ${sessionId}`;
    if (session.length === 0) return res.status(404).json({ error: 'Session not found' });

    // Get conversation
    const messages = await sql`
      SELECT role, content FROM messages
      WHERE session_id = ${sessionId} AND role != 'system'
      ORDER BY created_at ASC
    `;

    const conversation = messages
      .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    const s = session[0];
    const feedbackPrompt = buildFeedbackPrompt(conversation, s.role, s.domain);

    // Get feedback from Groq
    const rawFeedback = await sendToGroqNonStream([
      { role: 'system', content: 'You are an expert interview coach. Return only valid JSON.' },
      { role: 'user', content: feedbackPrompt },
    ]);

    // Parse JSON from response
    let feedbackData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawFeedback.match(/\{[\s\S]*\}/);
      feedbackData = JSON.parse(jsonMatch ? jsonMatch[0] : rawFeedback);
    } catch {
      return res.status(500).json({ error: 'Failed to parse feedback JSON', raw: rawFeedback });
    }

    // Store feedback in DB
    const result = await sql`
      INSERT INTO feedback (
        session_id, user_id, clarity_score, depth_score,
        communication_score, confidence_score, overall_score,
        strengths, improvements, career_roadmap, raw_feedback
      ) VALUES (
        ${sessionId}, ${s.user_id},
        ${feedbackData.clarity_score || 0}, ${feedbackData.depth_score || 0},
        ${feedbackData.communication_score || 0}, ${feedbackData.confidence_score || 0},
        ${feedbackData.overall_score || 0},
        ${feedbackData.strengths || []}, ${feedbackData.improvements || []},
        ${JSON.stringify(feedbackData.career_roadmap || { immediate: [], short_term: [], long_term: [] })}, ${rawFeedback}
      )
      RETURNING *
    `;

    res.json({
      ...result[0],
      verdict: feedbackData.verdict,
      summary: feedbackData.summary,
      career_roadmap: feedbackData.career_roadmap,
    });
  } catch (error) {
    console.error('Generate feedback error:', error);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

// GET /api/feedback/:sessionId
feedbackRouter.get('/:sessionId', async (req, res) => {
  try {
    const feedback = await sql`
      SELECT * FROM feedback WHERE session_id = ${req.params.sessionId}
    `;
    if (feedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json(feedback[0]);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Failed to get feedback' });
  }
});
