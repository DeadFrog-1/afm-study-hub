'use client';

export default function QuizBattlePage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="mb-6">Quiz Battle</h1>
      <div className="rounded-lg p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Quiz Battle — 5 random MCQs in 10 minutes. Requires scraped content to activate.
        </p>
      </div>
    </div>
  );
}
