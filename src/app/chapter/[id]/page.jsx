'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChapterContent } from '@/components/chapter/ChapterContent';
import { PageSummary } from '@/components/chapter/PageSummary';
import { ConfidenceMarker } from '@/components/chapter/ConfidenceMarker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ChapterPage() {
  const params = useParams();
  const chapterId = params.id;
  const [chapter, setChapter] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content/${chapterId}`)
      .then(r => r.json())
      .then(data => {
        setChapter(data);
        setCurrentPageIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-4 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-64 rounded" style={{ background: 'var(--bg-secondary)' }} />
      </div>
    );
  }

  if (!chapter || !chapter.pages.length) {
    return (
      <div className="text-center py-16">
        <h2 style={{ color: 'var(--text-muted)' }}>Chapter not found</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Run the scraper first: <code>node scraper/scraper.js --chapter={chapterId.replace('ch', '')}</code>
        </p>
      </div>
    );
  }

  const page = chapter.pages[currentPageIndex];
  const totalPages = chapter.pages.length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Chapter header */}
      <div className="mb-6">
        <h1>{chapter.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {chapter.examWeight} exam weight · {totalPages} pages
        </p>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-sm disabled:opacity-30"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Page {currentPageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === totalPages - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-sm disabled:opacity-30"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Page title */}
      <h2 className="mb-4" style={{ color: 'var(--heading-color)' }}>{page.title}</h2>

      {/* Content */}
      <div
        className="rounded-lg p-6 mb-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <ChapterContent html={page.contentHtml} />
      </div>

      {/* AI Summary */}
      {page.aiSummary && (
        <div className="mb-4">
          <PageSummary summary={page.aiSummary} />
        </div>
      )}

      {/* Confidence marker */}
      <ConfidenceMarker chapterId={chapterId} pageId={page.id} totalPages={totalPages} />

      {/* Keyboard navigation hint */}
      <div className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Use ← → arrow keys to navigate pages
      </div>
    </div>
  );
}
