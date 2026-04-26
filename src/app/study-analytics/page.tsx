'use client';

export default function StudyAnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="mb-6">Study Analytics</h1>
      <div className="rounded-lg p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Detailed study analytics — streaks, quiz scores, time breakdown. Requires study data to populate.
        </p>
      </div>
    </div>
  );
}
