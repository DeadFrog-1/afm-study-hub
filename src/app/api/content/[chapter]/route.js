// ─────────────────────────────────────────────
// API: Serve chapter content
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server';
import {
  loadChapter, loadQuestions, loadQuiz, loadFlashcards,
  loadMindMap, loadCRExam, getAvailableChapters, loadMetadata,
} from '@/lib/content-loader';

export async function GET(req, { params }) {
  const chapterId = params.chapter;

  // Special endpoint for metadata
  if (chapterId === 'metadata') {
    const meta = loadMetadata();
    return NextResponse.json(meta || { chapters: [], totalChapters: 18, chaptersScraped: 0 });
  }

  const type = req.nextUrl.searchParams.get('type');

  if (type === 'questions') {
    return NextResponse.json(loadQuestions(chapterId));
  }
  if (type === 'quiz') {
    return NextResponse.json(loadQuiz(chapterId));
  }
  if (type === 'flashcards') {
    return NextResponse.json(loadFlashcards(chapterId));
  }
  if (type === 'mindmap') {
    return NextResponse.json(loadMindMap(chapterId));
  }
  if (type === 'cr-exam') {
    return NextResponse.json(loadCRExam(chapterId));
  }

  // Default: full chapter
  const chapter = loadChapter(chapterId);
  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }
  return NextResponse.json(chapter);
}
