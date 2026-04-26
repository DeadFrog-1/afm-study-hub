'use client';

import { useState, useRef, useCallback } from 'react';
import type { Question } from '@/types';
import { Clock, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  question: Question;
  chapterId: string;
}

export function QuestionCard({ question, chapterId }: Props) {
  const [answerText, setAnswerText] = useState('');
  const [timerDone, setTimerDone] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());

  // Start 45s timer on mount
  useState(() => {
    timerRef.current = setTimeout(() => setTimerDone(true), 45000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  });

  const canReveal = timerDone || answerText.trim().length > 0;

  const handleReveal = useCallback(async () => {
    if (!canReveal) return;
    setRevealed(true);
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, questionId: question.id, action: 'reveal', answerText }),
    });
  }, [canReveal, chapterId, question.id, answerText]);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            Q{question.number}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {question.marks} marks
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="p-4 animate-fade-in">
          {/* Question text */}
          <div
            className="mb-4 chapter-content"
            dangerouslySetInnerHTML={{ __html: question.questionHtml }}
          />

          {/* Answer sheet */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
              Your Answer
            </label>
            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full p-3 rounded-lg text-sm resize-y"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Timer + reveal */}
          <div className="flex items-center gap-3">
            {!timerDone && (
              <div className="flex items-center gap-1 text-xs animate-timer-warning">
                <Clock size={14} />
                <span>Wait 45s to reveal answer...</span>
              </div>
            )}
            <button
              onClick={handleReveal}
              disabled={!canReveal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: canReveal ? 'var(--accent)' : 'var(--bg-secondary)',
                color: canReveal ? '#fff' : 'var(--text-muted)',
                opacity: canReveal ? 1 : 0.5,
              }}
            >
              <Eye size={16} />
              Show Answer
            </button>
          </div>

          {/* Revealed answers */}
          {revealed && (
            <div className="mt-4 grid md:grid-cols-2 gap-4 animate-fade-in">
              {/* AI Answer */}
              {question.aiAnswer && (
                <div className="p-4 rounded-lg" style={{ background: 'var(--summary-bg)', border: '1px solid var(--summary-border)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--summary-border)' }}>
                    🤖 Step-by-Step Answer
                  </h4>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {question.aiAnswer.approach}
                  </p>
                  {question.aiAnswer.steps.map(step => (
                    <div key={step.stepNumber} className="mb-2">
                      <div className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                        Step {step.stepNumber}: {step.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {step.explanation}
                      </div>
                      {step.workings && (
                        <pre className="text-xs mt-1 p-2 rounded" style={{ background: 'var(--formula-bg)' }}>
                          {step.workings}
                        </pre>
                      )}
                    </div>
                  ))}
                  <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--success)' }}>
                    Conclusion: {question.aiAnswer.conclusion}
                  </div>
                </div>
              )}

              {/* Official Answer */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--highlight-bg)', border: '1px solid var(--highlight-border)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--highlight-border)' }}>
                  📚 Official ACCA Answer
                </h4>
                <div
                  className="text-xs chapter-content"
                  dangerouslySetInnerHTML={{ __html: question.officialAnswerHtml }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
