'use client';

export function PageSummary({ summary }) {
  return (
    <div className="content-block-summary">
      <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--summary-border)' }}>
        📝 AI Study Summary
      </h4>
      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {summary}
      </div>
    </div>
  );
}
