'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';

export function ExamCountdown() {
  const examDate = process.env.NEXT_PUBLIC_EXAM_DATE || '2026-06-05';
  const examName = process.env.NEXT_PUBLIC_EXAM_NAME || 'ACCA AFM';

  const daysLeft = useMemo(() => {
    const target = new Date(examDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  const color =
    daysLeft > 60 ? 'var(--success)' :
    daysLeft > 30 ? 'var(--warning)' :
    'var(--error)';

  return (
    <div className="flex items-center gap-2 text-xs" style={{ color }}>
      <Clock size={14} />
      <span className="font-semibold">{daysLeft} days to {examName}</span>
    </div>
  );
}
