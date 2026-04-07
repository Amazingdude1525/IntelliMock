import { Router } from 'express';
import { sql } from '../db/index.js';

export const statsRouter = Router();

// GET /api/stats/:userId — Avg score, total sessions, improvement trend
statsRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Total sessions
    const sessionsCount = await sql`
      SELECT COUNT(*) as count FROM sessions WHERE user_id = ${userId}
    `;

    // Average score from feedback
    const avgScore = await sql`
      SELECT
        COALESCE(AVG(overall_score), 0) as avg_score,
        COALESCE(MAX(overall_score), 0) as best_score
      FROM feedback WHERE user_id = ${userId}
    `;

    // Improvement trend (last 10 sessions)
    const trend = await sql`
      SELECT overall_score FROM feedback
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
      LIMIT 10
    `;

    // Calculate streak (consecutive days with sessions)
    const recentDays = await sql`
      SELECT DISTINCT DATE(created_at) as day FROM sessions
      WHERE user_id = ${userId}
      ORDER BY day DESC
      LIMIT 30
    `;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < recentDays.length; i++) {
      const day = new Date(recentDays[i].day);
      const expectedDay = new Date(today);
      expectedDay.setDate(expectedDay.getDate() - i);

      if (day.toDateString() === expectedDay.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    res.json({
      total_sessions: parseInt(sessionsCount[0].count),
      avg_score: Math.round(parseFloat(avgScore[0].avg_score)),
      best_score: parseInt(avgScore[0].best_score),
      streak,
      improvement_trend: trend.map((t) => t.overall_score),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});
