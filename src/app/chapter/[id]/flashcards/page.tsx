'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Flashcard } from '@/types';
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck';

export default function FlashcardsPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${chapterId}?type=flashcards`)
      .then(r => r.json())
      .then(data => { setCards(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <div className="animate-pulse h-64 rounded" style={{ background: 'var(--bg-secondary)' }} />;
  if (!cards.length) return (
    <div className="text-center py-16">
      <h2 style={{ color: 'var(--text-muted)' }}>No flashcards yet</h2>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="mb-6">Flashcards</h1>
      <FlashcardDeck cards={cards} chapterId={chapterId} />
    </div>
  );
}
