// ─────────────────────────────────────────────
// SQLite Database Layer
// ─────────────────────────────────────────────
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'content', 'study-hub.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      page_id TEXT NOT NULL,
      confidence_marked INTEGER DEFAULT 0,
      marked_at DATETIME,
      UNIQUE(chapter_id, page_id)
    );

    CREATE TABLE IF NOT EXISTS question_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      attempt_text TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revealed_answer INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      selected_option TEXT,
      is_correct INTEGER DEFAULT 0,
      attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flashcard_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      flipped INTEGER DEFAULT 0,
      reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date DATE NOT NULL UNIQUE,
      duration_minutes INTEGER DEFAULT 0,
      chapters_touched TEXT
    );

    CREATE TABLE IF NOT EXISTS question_review_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      last_attempt_date DATETIME,
      attempt_count INTEGER DEFAULT 1,
      is_correct INTEGER DEFAULT 0,
      next_review_interval INTEGER,
      UNIQUE(chapter_id, question_id, scheduled_date)
    );

    CREATE TABLE IF NOT EXISTS flashcard_difficulty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      card_id TEXT NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      last_reviewed DATETIME,
      review_count INTEGER DEFAULT 0,
      correct_in_row INTEGER DEFAULT 0,
      next_review DATETIME,
      UNIQUE(chapter_id, card_id)
    );

    CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_date DATE NOT NULL UNIQUE,
      question_id TEXT NOT NULL,
      user_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS quiz_battle_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE,
      session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      questions_count INTEGER DEFAULT 5,
      time_limit_minutes INTEGER DEFAULT 10,
      questions_answered INTEGER DEFAULT 0,
      score_achieved INTEGER DEFAULT 0,
      max_score INTEGER DEFAULT 5,
      duration_seconds INTEGER,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_battle_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      question_number INTEGER,
      quiz_id TEXT NOT NULL,
      selected_option TEXT,
      is_correct INTEGER,
      time_spent_seconds INTEGER,
      FOREIGN KEY (session_id) REFERENCES quiz_battle_sessions(session_id)
    );

    CREATE TABLE IF NOT EXISTS exam_simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulation_id TEXT UNIQUE,
      simulation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      section_a_questions INTEGER DEFAULT 1,
      section_b_questions INTEGER DEFAULT 2,
      total_marks INTEGER DEFAULT 100,
      section_a_score INTEGER DEFAULT 0,
      section_b_score INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      time_spent_seconds INTEGER,
      status TEXT DEFAULT 'in_progress',
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS exam_simulation_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulation_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      section TEXT NOT NULL,
      user_answer TEXT,
      marks_earned INTEGER DEFAULT 0,
      max_marks INTEGER,
      submitted_at DATETIME,
      FOREIGN KEY (simulation_id) REFERENCES exam_simulations(simulation_id)
    );

    CREATE TABLE IF NOT EXISTS study_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      studied INTEGER DEFAULT 0,
      study_duration_minutes INTEGER DEFAULT 0
    );
  `);
}

// ── Progress Functions ──

export function markPageConfident(chapterId: string, pageId: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO page_progress (chapter_id, page_id, confidence_marked, marked_at)
    VALUES (?, ?, 1, datetime('now'))
    ON CONFLICT(chapter_id, page_id) DO UPDATE SET confidence_marked = 1, marked_at = datetime('now')
  `).run(chapterId, pageId);
}

export function unmarkPageConfident(chapterId: string, pageId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE page_progress SET confidence_marked = 0, marked_at = NULL
    WHERE chapter_id = ? AND page_id = ?
  `).run(chapterId, pageId);
}

export function isPageConfident(chapterId: string, pageId: string): boolean {
  const db = getDb();
  const row = db.prepare(`
    SELECT confidence_marked FROM page_progress
    WHERE chapter_id = ? AND page_id = ?
  `).get(chapterId, pageId) as { confidence_marked: number } | undefined;
  return row?.confidence_marked === 1;
}

export function getChapterProgress(chapterId: string, totalPages: number): { marked: number; total: number; percent: number } {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as marked FROM page_progress
    WHERE chapter_id = ? AND confidence_marked = 1
  `).get(chapterId) as { marked: number };
  const marked = row.marked;
  return { marked, total: totalPages, percent: totalPages > 0 ? Math.round((marked / totalPages) * 100) : 0 };
}

export function getOverallProgress(totalPages: number): { marked: number; total: number; percent: number } {
  const db = getDb();
  const row = db.prepare(`
    SELECT COUNT(*) as marked FROM page_progress WHERE confidence_marked = 1
  `).get() as { marked: number };
  const marked = row.marked;
  return { marked, total: totalPages, percent: totalPages > 0 ? Math.round((marked / totalPages) * 100) : 0 };
}

// ── Question Attempts ──

export function saveQuestionAttempt(chapterId: string, questionId: string, text: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO question_attempts (chapter_id, question_id, attempt_text)
    VALUES (?, ?, ?)
  `).run(chapterId, questionId, text);
}

export function revealAnswer(chapterId: string, questionId: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO question_attempts (chapter_id, question_id, revealed_answer)
    VALUES (?, ?, 1)
    ON CONFLICT DO UPDATE SET revealed_answer = 1
  `).run(chapterId, questionId);
}

// ── Quiz ──

export function saveQuizAttempt(chapterId: string, quizId: string, option: string, isCorrect: boolean): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO quiz_attempts (chapter_id, quiz_id, selected_option, is_correct)
    VALUES (?, ?, ?, ?)
  `).run(chapterId, quizId, option, isCorrect ? 1 : 0);
}

export function getChapterQuizScore(chapterId: string): { correct: number; total: number; percent: number } {
  const db = getDb();
  const rows = db.prepare(`
    SELECT quiz_id, is_correct FROM quiz_attempts WHERE chapter_id = ?
  `).all(chapterId) as { quiz_id: string; is_correct: number }[];
  // Only count last attempt per quiz
  const lastAttempts = new Map<string, number>();
  for (const r of rows) lastAttempts.set(r.quiz_id, r.is_correct);
  const total = lastAttempts.size;
  const correct = Array.from(lastAttempts.values()).filter(v => v === 1).length;
  return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
}

// ── Study Sessions / Streaks ──

export function recordStudySession(durationMinutes: number): void {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO study_sessions (session_date, duration_minutes)
    VALUES (?, ?)
    ON CONFLICT(session_date) DO UPDATE SET duration_minutes = duration_minutes + ?
  `).run(today, durationMinutes, durationMinutes);
}

export function getStudyStreak(): number {
  const db = getDb();
  const rows = db.prepare(`
    SELECT session_date FROM study_sessions ORDER BY session_date DESC
  `).all() as { session_date: string }[];
  if (rows.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (rows[i]?.session_date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getStreakCalendar(days: number = 30): boolean[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT session_date FROM study_sessions ORDER BY session_date DESC
  `).all() as { session_date: string }[];
  const dates = new Set(rows.map(r => r.session_date));
  const result: boolean[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(dates.has(d.toISOString().split('T')[0]));
  }
  return result;
}

export function getWeeklyStudyTime(): number {
  const db = getDb();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const row = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM study_sessions WHERE session_date >= ?
  `).get(weekAgo.toISOString().split('T')[0]) as { total: number };
  return row.total;
}
