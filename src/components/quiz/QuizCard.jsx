'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function QuizCard({ question, index, onAnswer, chapterId }) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const correctLabel = question.options[question.correctIndex]?.label;

  const handleSelect = useCallback((label) => {
    if (selected) return; // already answered
    setSelected(label);
    const correct = label === correctLabel;
    onAnswer(correct);
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, quizId: question.id, action: 'quiz', selectedOption: label, isCorrect: correct }),
    });
  }, [selected, correctLabel, onAnswer, chapterId, question.id]);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="p-4">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          Question {index + 1}
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          {question.questionText}
        </p>

        <div className="space-y-2">
          {question.options.map(opt => {
            const isSelected = selected === opt.label;
            const isCorrect = opt.label === correctLabel;
            const showResult = selected !== null;

            let bg = 'var(--bg-secondary)';
            let border = 'var(--border)';
            if (showResult && isCorrect) { bg = 'rgba(16,185,129,0.1)'; border = 'var(--success)'; }
            if (showResult && isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'var(--error)'; }

            return (
              <button
                key={opt.label}
                onClick={() => handleSelect(opt.label)}
                disabled={!!selected}
                className="w-full flex items-start gap-3 p-3 rounded-lg text-left text-sm transition-colors"
                style={{ background: bg, border: `1px solid ${border}`, color: 'var(--text-primary)' }}
              >
                <span className="font-bold shrink-0" style={{ color: isCorrect && showResult ? 'var(--success)' : 'var(--accent)' }}>
                  {opt.label}.
                </span>
                <span className="flex-1">{opt.text}</span>
                {showResult && isCorrect && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                {showResult && isSelected && !isCorrect && <XCircle size={16} style={{ color: 'var(--error)' }} />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--accent)' }}
            >
              {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
            {showExplanation && (
              <div className="mt-2 p-3 rounded text-xs animate-fade-in" style={{ background: 'var(--summary-bg)', border: '1px solid var(--summary-border)' }}>
                <p className="mb-1" style={{ color: 'var(--success)' }}>
                  ✓ {correctLabel} is correct: {question.officialExplanation}
                </p>
                {question.wrongOptionExplanations && Object.entries(question.wrongOptionExplanations).map(([label, explanation]) => (
                  <p key={label} className="mt-1" style={{ color: 'var(--error)' }}>
                    ✗ {label}: {explanation}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
