// ─────────────────────────────────────────────
// Zustand Global State
// ─────────────────────────────────────────────
import { create } from 'zustand';
import type { Chapter, Question, QuizQuestion, Flashcard, MindMapNode, ChapterProgress, QuizBattleSession } from '@/types';

interface StudyStore {
  // ── Current state ──
  currentChapter: Chapter | null;
  currentQuestions: Question[];
  currentQuiz: QuizQuestion[];
  currentFlashcards: Flashcard[];
  currentMindMap: MindMapNode | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';

  // ── Progress ──
  chapterProgress: Record<string, ChapterProgress>;
  overallPercent: number;
  studyStreak: number;
  weeklyMinutes: number;

  // ── Quiz Battle ──
  activeBattle: QuizBattleSession | null;

  // ── Actions ──
  setCurrentChapter: (ch: Chapter) => void;
  setCurrentQuestions: (q: Question[]) => void;
  setCurrentQuiz: (q: QuizQuestion[]) => void;
  setCurrentFlashcards: (f: Flashcard[]) => void;
  setCurrentMindMap: (m: MindMapNode | null) => void;
  toggleSidebar: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  updateChapterProgress: (id: string, progress: ChapterProgress) => void;
  setOverallPercent: (p: number) => void;
  setStudyStreak: (s: number) => void;
  setWeeklyMinutes: (m: number) => void;
}

export const useStudyStore = create<StudyStore>((set) => ({
  currentChapter: null,
  currentQuestions: [],
  currentQuiz: [],
  currentFlashcards: [],
  currentMindMap: null,
  sidebarOpen: true,
  theme: (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'light' | 'dark')) || 'light',
  chapterProgress: {},
  overallPercent: 0,
  studyStreak: 0,
  weeklyMinutes: 0,
  activeBattle: null,

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
