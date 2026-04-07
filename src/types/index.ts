// ─── User ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

// ─── Session ───────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Persona = 'google' | 'startup' | 'mckinsey' | 'default';
export type InterviewMode = 'chat' | 'voice';
export type SessionStatus = 'active' | 'completed';

export interface Session {
  id: string;
  user_id: string;
  role: string;
  domain: string;
  difficulty: Difficulty;
  persona: Persona;
  mode: InterviewMode;
  status: SessionStatus;
  resume_url?: string;
  resume_text?: string;
  total_questions: number;
  created_at: string;
  completed_at?: string;
  feedback?: Feedback;
}

// ─── Message ───────────────────────────────────────────
export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// ─── Feedback ──────────────────────────────────────────
export interface CareerRoadmap {
  immediate: string[];
  short_term: string[];
  long_term: string[];
}

export interface Feedback {
  id: string;
  session_id: string;
  user_id: string;
  clarity_score: number;
  depth_score: number;
  communication_score: number;
  confidence_score: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  career_roadmap: CareerRoadmap;
  raw_feedback?: string;
  verdict?: 'Ready' | 'Almost Ready' | 'Needs Work';
  summary?: string;
  created_at: string;
}

// ─── Interview Config (Setup form state) ───────────────
export interface InterviewConfig {
  role: string;
  domain: string;
  difficulty: Difficulty;
  persona: Persona;
  mode: InterviewMode;
  duration?: number;
  resumeFile?: File;
  resumeUrl?: string;
  resumeText?: string;
}

// ─── Stats ─────────────────────────────────────────────
export interface UserStats {
  total_interviews: number;
  average_score: number;
  best_score: number;
  streak: number;
  improvement_trend: number[];
}

// ─── API Response Wrappers ─────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ─── Confidence Metrics (Camera) ───────────────────────
export interface ConfidenceMetrics {
  eyeContact: number;
  posture: number;
  focus: number;
  calm: number;
  overall: number;
}
