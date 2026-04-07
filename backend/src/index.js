import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users.js';
import { sessionsRouter } from './routes/sessions.js';
import { interviewRouter } from './routes/interview.js';
import { feedbackRouter } from './routes/feedback.js';
import { resumeRouter } from './routes/resume.js';
import { statsRouter } from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'IntelliMock API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`🚀 IntelliMock API running on port ${PORT}`);
});
