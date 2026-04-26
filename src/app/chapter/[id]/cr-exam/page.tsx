'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Question } from '@/types';
import { QuestionCard } from '@/components/questions/QuestionCard';

export default function CRExamPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${chapterId}?type=cr-exam`)
      .then(r => r.json())
      .then(data => { setQuestions(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <div className="animate-pulse h-64 rounded" style={{ background: 'var(--bg-secondary)' }} />;
  if (!questions.length) return (
    <div className="text-center py-16">
      <h2 style={{ color: 'var(--text-muted)' }}>No CR exam questions for this chapter</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="mb-2">CR Exam Case Studies</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {questions.length} case study questions
      </p>
      <div className="space-y-6">
        {questions.map(q => (
          <QuestionCard key={q.id} question={q} chapterId={chapterId} />
        ))}
      </div>
    </div>
  );
}
