// ─────────────────────────────────────────────
// Content Loader — Reads chapter JSON from disk
// ─────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import type { Chapter, Question, QuizQuestion, Flashcard, MindMapNode, Metadata } from '@/types';

const CONTENT_DIR = process.env.CONTENT_DIR || './content/chapters';

function readJsonFile<T>(filePath: string): T | null {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export function getChapterDir(chapterId: string): string {
  return path.join(CONTENT_DIR, chapterId);
}

export function loadChapter(chapterId: string): Chapter | null {
  return readJsonFile<Chapter>(path.join(getChapterDir(chapterId), 'chapter.json'));
}

export function loadQuestions(chapterId: string): Question[] {
  return readJsonFile<Question[]>(path.join(getChapterDir(chapterId), 'questions.json')) || [];
}

export function loadQuiz(chapterId: string): QuizQuestion[] {
  return readJsonFile<QuizQuestion[]>(path.join(getChapterDir(chapterId), 'quiz.json')) || [];
}

export function loadFlashcards(chapterId: string): Flashcard[] {
  return readJsonFile<Flashcard[]>(path.join(getChapterDir(chapterId), 'flashcards.json')) || [];
}

export function loadMindMap(chapterId: string): MindMapNode | null {
  return readJsonFile<MindMapNode>(path.join(getChapterDir(chapterId), 'mindmap.json'));
}

export function loadCRExam(chapterId: string): Question[] {
  return readJsonFile<Question[]>(path.join(getChapterDir(chapterId), 'cr-exam.json')) || [];
}

export function loadMetadata(): Metadata | null {
  // metadata.json lives one level above the chapters directory
  const metaPath = path.resolve(process.cwd(), CONTENT_DIR, '..', 'metadata.json');
  try {
    if (!fs.existsSync(metaPath)) return null;
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as Metadata;
  } catch {
    return null;
  }
}

export function getAvailableChapters(): string[] {
  const dir = path.resolve(process.cwd(), CONTENT_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('ch') && fs.statSync(path.join(dir, f)).isDirectory())
    .sort();
}
