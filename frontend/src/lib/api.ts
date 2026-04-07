import axios from 'axios';
import type { Session, Message, Feedback, UserStats } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token if Clerk is available
export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ─── Users ─────────────────────────────────────────────
export async function syncUser(userData: { id: string; email: string; name?: string; avatar_url?: string }) {
  const res = await api.post('/api/users/sync', userData);
  return res.data;
}

// ─── Sessions ──────────────────────────────────────────
export async function getSessions(): Promise<Session[]> {
  const res = await api.get('/api/sessions');
  return res.data;
}

export async function getSession(id: string): Promise<Session & { messages: Message[] }> {
  const res = await api.get(`/api/sessions/${id}`);
  return res.data;
}

export async function createSession(config: {
  role: string;
  domain: string;
  difficulty: string;
  persona: string;
  mode: string;
  duration?: number;
  resume_url?: string;
  resume_text?: string;
  user_id?: string;
}): Promise<Session> {
  const res = await api.post('/api/sessions', config);
  return res.data;
}

export async function deleteSession(id: string) {
  const res = await api.delete(`/api/sessions/${id}`);
  return res.data;
}

// ─── Interview ─────────────────────────────────────────
export async function startInterview(sessionId: string): Promise<string> {
  const res = await api.post('/api/interview/start', { sessionId });
  return res.data.message;
}

export async function sendInterviewMessage(
  sessionId: string,
  content: string,
  metrics?: any
): Promise<ReadableStream<Uint8Array> | null> {
  const res = await fetch(`${API_URL}/api/interview/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(api.defaults.headers.common['Authorization']
        ? { Authorization: api.defaults.headers.common['Authorization'] as string }
        : {}),
    },
    body: JSON.stringify({ sessionId, content, metrics }),
  });

  if (!res.ok) throw new Error('Failed to send message');
  return res.body;
}

export async function endInterview(sessionId: string) {
  const res = await api.post('/api/interview/end', { sessionId });
  return res.data;
}

// ─── Feedback ──────────────────────────────────────────
export async function generateFeedback(sessionId: string): Promise<Feedback> {
  const res = await api.post('/api/feedback/generate', { sessionId });
  return res.data;
}

export async function getFeedback(sessionId: string): Promise<Feedback> {
  const res = await api.get(`/api/feedback/${sessionId}`);
  return res.data;
}

// ─── Resume ────────────────────────────────────────────
export async function uploadResume(file: File): Promise<{ url: string; text_preview: string }> {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await api.post('/api/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ─── Stats ─────────────────────────────────────────────
export async function getStats(userId: string): Promise<UserStats> {
  const res = await api.get(`/api/stats/${userId}`);
  return res.data;
}

export default api;
