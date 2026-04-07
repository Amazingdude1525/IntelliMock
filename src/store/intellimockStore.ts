import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Message, InterviewConfig, Feedback, UserStats, User } from '../types';

interface OnboardingData {
  university: string;
  major: string;
  targetRole: string;
  targetTier: string;
}

interface IntelliMockState {
  // ─── User ────────────────────────────────────
  user: User | null;
  setUser: (user: User | null) => void;
  onboardingData: OnboardingData | null;
  setOnboardingData: (data: OnboardingData | null) => void;

  // ─── Theme ───────────────────────────────────
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // ─── Interview Config ────────────────────────
  config: InterviewConfig;
  setConfig: (config: Partial<InterviewConfig>) => void;
  resetConfig: () => void;

  // ─── Active Session ──────────────────────────
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  // ─── Messages ────────────────────────────────
  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  clearMessages: () => void;

  // ─── Sessions ────────────────────────────────
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;

  // ─── Feedback ────────────────────────────────
  currentFeedback: Feedback | null;
  setCurrentFeedback: (fb: Feedback | null) => void;

  // ─── Stats ───────────────────────────────────
  stats: UserStats | null;
  setStats: (stats: UserStats | null) => void;

  // ─── UI State ────────────────────────────────
  isInterviewActive: boolean;
  setInterviewActive: (active: boolean) => void;
  isStreaming: boolean;
  setStreaming: (streaming: boolean) => void;
}

const defaultConfig: InterviewConfig = {
  role: '',
  domain: '',
  difficulty: 'medium',
  persona: 'default',
  mode: 'chat',
  duration: 20,
};

export const useIntelliMockStore = create<IntelliMockState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      onboardingData: null,
      setOnboardingData: (onboardingData) => set({ onboardingData }),

      // Theme
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Config
      config: { ...defaultConfig },
      setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
      resetConfig: () => set({ config: { ...defaultConfig } }),

      // Active session
      activeSessionId: null,
      setActiveSessionId: (id) => set({ activeSessionId: id }),

      // Messages
      messages: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () => set({ messages: [] }),

      // Sessions
      sessions: [],
      setSessions: (sessions) => set({ sessions }),

      // Feedback
      currentFeedback: null,
      setCurrentFeedback: (fb) => set({ currentFeedback: fb }),

      // Stats
      stats: null,
      setStats: (stats) => set({ stats }),

      // UI
      isInterviewActive: false,
      setInterviewActive: (active) => set({ isInterviewActive: active }),
      isStreaming: false,
      setStreaming: (streaming) => set({ isStreaming: streaming }),
    }),
    {
      name: 'intellimock-store',
      partialize: (state) => ({
        theme: state.theme,
        config: state.config,
        onboardingData: state.onboardingData,
      }),
    }
  )
);
