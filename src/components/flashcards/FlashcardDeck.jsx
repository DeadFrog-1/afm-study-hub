'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export function FlashcardDeck({ cards, chapterId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[currentIndex];
  if (!card) return null;

  const flip = () => setFlipped(!flipped);
  const prev = () => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false); };
  const next = () => { setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setFlipped(false); };

  return (
    <div>
      {/* Counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button onClick={() => { setCurrentIndex(0); setFlipped(false); }} className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Card */}
      <div
        onClick={flip}
        className="relative cursor-pointer rounded-xl p-8 min-h-[250px] flex items-center justify-center text-center transition-all duration-300"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          perspective: '1000px',
        }}
      >
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {flipped ? card.back : card.front}
        </div>
        <div className="absolute bottom-3 right-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {flipped ? 'Back' : 'Front'} · Click to flip
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm disabled:opacity-30"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          onClick={next}
          disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm disabled:opacity-30"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Space to flip · ← → to navigate
      </div>
    </div>
  );
}
