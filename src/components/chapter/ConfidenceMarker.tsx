'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  chapterId: string;
  pageId: string;
  totalPages: number;
}

export function ConfidenceMarker({ chapterId, pageId, totalPages }: Props) {
  const [marked, setMarked] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = useCallback(async () => {
    setSaving(true);
    const action = marked ? 'unmark' : 'mark';
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, pageId, action }),
      });
      setMarked(!marked);
    } catch {}
    setSaving(false);
  }, [marked, chapterId, pageId]);

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center"
      style={{
        background: marked ? 'var(--success)' : 'var(--bg-card)',
        color: marked ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${marked ? 'var(--success)' : 'var(--border)'}`,
        opacity: saving ? 0.6 : 1,
      }}
    >
      {marked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      {marked ? 'Understood ✓' : 'Mark as Understood'}
    </button>
  );
}
