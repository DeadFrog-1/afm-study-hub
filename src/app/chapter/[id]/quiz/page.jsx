'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QuizCard } from '@/components/quiz/QuizCard';

export default function QuizPage() {
  const params = useParams();
  const chapterId = params.id;
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    fetch(`/api/content/${chapterId}?type=quiz`)
      .then(r => r.json())
      .then(data => { setQuiz(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <div className="animate-pulse h-64 rounded" style={{ background: 'var(--bg-secondary)' }} />;
  if (!quiz.length) return (
    <div className="text-center py-16">
      <h2 style={{ color: 'var(--text-muted)' }}>No quiz questions yet</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1>Chapter Quiz</h1>
        <div className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
          {score.correct} / {score.total || quiz.length}
        </div>
      </div>
      <div className="space-y-4">
        {quiz.map((q, i) => (
          <QuizCard
            key={q.id}
            question={q}
            index={i}
            onAnswer={(correct) => setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))}
            chapterId={chapterId}
          />
        ))}
      </div>
    </div>
  );
}
