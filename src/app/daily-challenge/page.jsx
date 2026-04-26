'use client';

export default function DailyChallengePage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="mb-6">Daily Challenge</h1>
      <div className="rounded-lg p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Daily challenge feature — one random question per day. Requires scraped content to activate.
        </p>
      </div>
    </div>
  );
}
