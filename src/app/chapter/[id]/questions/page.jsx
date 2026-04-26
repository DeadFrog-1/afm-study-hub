'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QuestionCard } from '@/components/questions/QuestionCard';

export default function QuestionsPage() {
  const params = useParams();
  const chapterId = params.id;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${chapterId}?type=questions`)
      .then(r => r.json())
      .then(data => { setQuestions(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <Skeleton />;
  if (!questions.length) return <Empty chapterId={chapterId} />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="mb-2">Practice Questions</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {questions.length} questions · Type your answer, then reveal the solution
      </p>
      <div className="space-y-6">
        {questions.map(q => (
          <QuestionCard key={q.id} question={q} chapterId={chapterId} />
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 rounded" style={{ background: 'var(--bg-secondary)' }} />
      ))}
    </div>
  );
}

function Empty({ chapterId }) {
  return (
    <div className="text-center py-16">
      <h2 style={{ color: 'var(--text-muted)' }}>No questions yet</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Scrape this chapter first: <code>node scraper/scraper.js --chapter={chapterId.replace('ch', '')}</code>
      </p>
    </div>
  );
}
