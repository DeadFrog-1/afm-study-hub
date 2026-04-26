// ─────────────────────────────────────────────
// AFM Study Hub — TypeScript Interfaces
// ─────────────────────────────────────────────

// ── Chapter Content ──

export interface MediaRef {
  originalSrc: string;
  localPath: string;
  type: 'image' | 'video';
}

export interface ChapterPage {
  id: string;            // "ch01-p01"
  title: string;
  contentHtml: string;
  aiSummary?: string;
  mediaRefs: MediaRef[];
}

export interface Chapter {
  id: string;            // "ch01"
  title: string;
  examWeight: string;
  pages: ChapterPage[];
}

// ── Questions ──

export interface Question {
  id: string;            // "ch01-q01"
  number: number;
  marks: number;
  questionHtml: string;
  officialAnswerHtml: string;
  aiAnswer?: AIAnswer;
  type: 'practice' | 'cr-exam';
}

export interface AIAnswer {
  approach: string;
  steps: AIAnswerStep[];
  conclusion: string;
  markingSchemeNotes: string;
  examTechniqueReminder: string;
}

export interface AIAnswerStep {
  stepNumber: number;
  title: string;
  explanation: string;
  workings: string;
  result: string;
}

// ── Quiz ──

export interface QuizOption {
  label: string;         // "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctIndex: number;  // 0-3
  officialExplanation: string;
  wrongOptionExplanations?: Record<string, string>;
}

// ── Flashcards ──

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

// ── Mind Map ──

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

// ── Page Summary (AI) ──

export interface PageSummaryData {
  conceptOverview: string;
  examRelevance: string;
  keyFormulas: string[];
  commonMistakes: string[];
  markingTips: string[];
  linkToOtherTopics: string;
}

// ── Progress ──

export interface ChapterProgress {
  chapterId: string;
  marked: number;
  total: number;
  percent: number;
}

export interface OverallProgress {
  marked: number;
  total: number;
  percent: number;
}

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
}

// ── Spaced Repetition ──

export interface ReviewSchedule {
  chapterId: string;
  questionId: string;
  scheduledDate: string;
  attemptCount: number;
  isCorrect: number;
  nextReviewInterval: number;
}

// ── Quiz Battle ──

export interface QuizBattleSession {
  sessionId: string;
  sessionDate: string;
  questionsCount: number;
  timeLimitMinutes: number;
  questionsAnswered: number;
  scoreAchieved: number;
  maxScore: number;
  durationSeconds: number;
  completed: number;
}

// ── Exam Simulation ──

export interface ExamSimulation {
  simulationId: string;
  simulationDate: string;
  totalMarks: number;
  sectionAScore: number;
  sectionBScore: number;
  totalScore: number;
  timeSpentSeconds: number;
  status: 'in_progress' | 'completed';
}

// ── Study Streak ──

export interface StreakData {
  date: string;
  studied: boolean;
  durationMinutes: number;
}

// ── Metadata ──

export interface ChapterMeta {
  id: string;
  title: string;
  examWeight: string;
  status: 'scraped' | 'not_scraped' | 'partial';
  scrapedAt: string | null;
  stats?: {
    pages: number;
    questions: number;
    quiz: number;
    flashcards: number;
    mindmapNodes: number;
    imagesDownloaded: number;
    videosDownloaded: number;
  };
  aiEnhancementsStatus: 'pending' | 'done' | 'skipped';
}

export interface Metadata {
  totalChapters: number;
  chaptersScraped: number;
  chapters: ChapterMeta[];
  totalPages: number;
  totalPagesExpected: number;
  progressPercent: number;
}
