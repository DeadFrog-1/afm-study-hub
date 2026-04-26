// ─────────────────────────────────────────────
// Zustand Global State
// ─────────────────────────────────────────────
import { create } from 'zustand';

export const useStudyStore = create((set) => ({
  // ── Current state ──
  currentChapter: null,
  currentQuestions: [],
  currentQuiz: [],
  currentFlashcards: [],
  currentMindMap: null,
  sidebarOpen: true,
  theme: (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light',

  // ── Progress ──
  chapterProgress: {},
  overallPercent: 0,
  studyStreak: 0,
  weeklyMinutes: 0,

  // ── Quiz Battle ──
  activeBattle: null,

  // ── Actions ──
  setCurrentChapter: (ch) => set({ currentChapter: ch }),
  setCurrentQuestions: (q) => set({ currentQuestions: q }),
  setCurrentQuiz: (q) => set({ currentQuiz: q }),
  setCurrentFlashcards: (f) => set({ currentFlashcards: f }),
  setCurrentMindMap: (m) => set({ currentMindMap: m }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    set({ theme: t });
  },
  updateChapterProgress: (id, progress) =>
    set((s) => ({ chapterProgress: { ...s.chapterProgress, [id]: progress } })),
  setOverallPercent: (p) => set({ overallPercent: p }),
  setStudyStreak: (s) => set({ studyStreak: s }),
  setWeeklyMinutes: (m) => set({ weeklyMinutes: m }),
}));
