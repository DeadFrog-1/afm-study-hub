// ─────────────────────────────────────────────
// API: AI Summary generation (placeholder)
// ─────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chapterId, pageId, content } = body;

  // Since we're building without an API key, this is a placeholder
  // In the future, you can add Claude API integration here
  return NextResponse.json({
    summary: 'Summary generation requires an Anthropic API key. Add ANTHROPIC_API_KEY to .env.local to enable this feature.',
  });
}
