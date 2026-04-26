// ─────────────────────────────────────────────
// API: Progress tracking
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import {
  markPageConfident, unmarkPageConfident, getChapterProgress,
  getOverallProgress, saveQuizAttempt, getStudyStreak,
  getStreakCalendar, getWeeklyStudyTime,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');

  if (type === 'streak') {
    return NextResponse.json({ streak: getStudyStreak() });
  }
  if (type === 'calendar') {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30');
    return NextResponse.json({ calendar: getStreakCalendar(days) });
  }
  if (type === 'weekly') {
    return NextResponse.json({ minutes: getWeeklyStudyTime() });
  }
  if (type === 'overall') {
    return NextResponse.json(getOverallProgress(300)); // rough estimate
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chapterId, pageId, action, questionId, quizId, selectedOption, isCorrect, answerText } = body;

  if (action === 'mark') {
    markPageConfident(chapterId, pageId);
    return NextResponse.json({ ok: true });
  }
  if (action === 'unmark') {
    unmarkPageConfident(chapterId, pageId);
    return NextResponse.json({ ok: true });
  }
  if (action === 'quiz') {
    saveQuizAttempt(chapterId, quizId, selectedOption, isCorrect);
    return NextResponse.json({ ok: true });
  }
  if (action === 'reveal') {
    // Just acknowledge — we could store this later
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
