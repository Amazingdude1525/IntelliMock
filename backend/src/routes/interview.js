import { Router } from 'express';
import { sql } from '../db/index.js';
import { buildInterviewPrompt, sendToGroq } from '../services/groq.js';

export const interviewRouter = Router();

// POST /api/interview/start — Start session, return first AI question
interviewRouter.post('/start', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });

    const session = await sql`SELECT * FROM sessions WHERE id = ${sessionId}`;
    if (session.length === 0) return res.status(404).json({ error: 'Session not found' });

    const s = session[0];
    const systemPrompt = buildInterviewPrompt(s.role, s.domain, s.difficulty, s.persona, s.resume_text);

    // Store system message
    await sql`
      INSERT INTO messages (session_id, role, content)
      VALUES (${sessionId}, 'system', ${systemPrompt})
    `;

    // Get first question from Groq (non-streaming for the initial message)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Start the interview. Greet the candidate and ask your first question.' },
    ];

    const groqResponse = await sendToGroq(messages, false);
    const data = await groqResponse.json();
    const aiMessage = data.choices[0].message.content;

    // Store AI message
    await sql`
      INSERT INTO messages (session_id, role, content)
      VALUES (${sessionId}, 'assistant', ${aiMessage})
    `;

    // Update session question count
    await sql`UPDATE sessions SET total_questions = 1 WHERE id = ${sessionId}`;

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// POST /api/interview/message — Send answer, stream next question
interviewRouter.post('/message', async (req, res) => {
  try {
    const { sessionId, content, metrics } = req.body;
    if (!sessionId || !content) {
      return res.status(400).json({ error: 'sessionId and content are required' });
    }

    let finalContent = content;

    // Inject active behavioral coaching to the AI model if metrics are poor
    if (metrics && metrics.overall < 70) {
       const behavioralWarning = `\n\n[SYSTEM METRICS FOR CANDIDATE: EyeContact=${metrics.eyeContact}%, Posture=${metrics.posture}%, Overall=${metrics.overall}%]. The candidate is either severely slouching, not looking at the camera, or hiding their face. Incorporate a polite but firm 1-sentence reminder about maintaining eye contact and sitting professionally before asking your next question.`;
       finalContent += behavioralWarning;
    }

    // Store user message
    await sql`
      INSERT INTO messages (session_id, role, content)
      VALUES (${sessionId}, 'user', ${finalContent})
    `;

    // Get conversation history
    const dbMessages = await sql`
      SELECT role, content FROM messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `;

    const messages = dbMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: m.content,
    }));

    // Stream response from Groq
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const groqResponse = await sendToGroq(messages, true);
    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);

      // Parse tokens to accumulate full response
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.slice(6));
            const token = parsed.choices?.[0]?.delta?.content || '';
            fullResponse += token;
          } catch {}
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Store AI response
    if (fullResponse) {
      await sql`
        INSERT INTO messages (session_id, role, content)
        VALUES (${sessionId}, 'assistant', ${fullResponse})
      `;

      // Update question count
      await sql`
        UPDATE sessions SET total_questions = total_questions + 1
        WHERE id = ${sessionId}
      `;

      // Check if interview is complete
      if (fullResponse.includes('INTELLIMOCK_COMPLETE')) {
        await sql`
          UPDATE sessions SET status = 'completed', completed_at = NOW()
          WHERE id = ${sessionId}
        `;
      }
    }
  } catch (error) {
    console.error('Interview message error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message' });
    }
  }
});

// POST /api/interview/end — End session
interviewRouter.post('/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    await sql`
      UPDATE sessions SET status = 'completed', completed_at = NOW()
      WHERE id = ${sessionId}
    `;
    res.json({ success: true });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ error: 'Failed to end interview' });
  }
});
