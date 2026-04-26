// ─────────────────────────────────────────────
// Content Loader — Reads chapter JSON from disk
// ─────────────────────────────────────────────
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = process.env.CONTENT_DIR || './content/chapters';

function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function getChapterDir(chapterId) {
  return path.join(CONTENT_DIR, chapterId);
}

export function loadChapter(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'chapter.json'));
}

export function loadQuestions(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'questions.json')) || [];
}

export function loadQuiz(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'quiz.json')) || [];
}

export function loadFlashcards(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'flashcards.json')) || [];
}

export function loadMindMap(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'mindmap.json'));
}

export function loadCRExam(chapterId) {
  return readJsonFile(path.join(getChapterDir(chapterId), 'cr-exam.json')) || [];
}

export function loadMetadata() {
  // metadata.json lives one level above the chapters directory
  const metaPath = path.resolve(process.cwd(), CONTENT_DIR, '..', 'metadata.json');
  try {
    if (!fs.existsSync(metaPath)) return null;
    return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function getAvailableChapters() {
  const dir = path.resolve(process.cwd(), CONTENT_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.startsWith('ch') && fs.statSync(path.join(dir, f)).isDirectory())
    .sort();
}
