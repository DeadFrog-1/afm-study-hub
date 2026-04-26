'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, ChevronLeft, ChevronRight, BarChart3, Flame,
} from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import { ExamCountdown } from './ExamCountdown';
import clsx from 'clsx';

const CHAPTERS = Array.from({ length: 18 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  const titles = {
    '01': 'Financial Management & Goals',
    '02': 'Financial Appraisal Techniques',
    '03': 'Working Capital Management',
    '04': 'Business Valuations & M&A',
    '05': 'Corporate Finance Risk Mgmt',
    '06': 'Investment Appraisal & Inflation',
    '07': 'Growth & Sustainability',
    '08': 'International Financial Mgmt',
    '09': 'Treasury Management',
    '10': 'Business Restructuring',
    '11': 'Corporate Governance & Ethics',
    '12': 'Environmental & Social Factors',
    '13': 'Emerging Issues in FM',
    '14': 'Section A Case Study Orientation',
    '15': 'Section B Case Study (1)',
    '16': 'Section B Case Study (2)',
    '17': 'Section B Case Study (3)',
    '18': 'Exam Technique & Revision',
  };
  return { id: `ch${num}`, num, title: titles[num] || `Chapter ${num}` };
});

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, studyStreak } = useStudyStore();
  const [scrapedChapters, setScrapedChapters] = useState(new Set());

  useEffect(() => {
    fetch('/api/content/metadata')
      .then(r => r.json())
      .then(data => {
        if (data?.chapters) {
          const scraped = new Set(
            data.chapters
              .filter((c) => c.status === 'scraped')
              .map((c) => c.id)
          );
          setScrapedChapters(scraped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside
      className={clsx(
        'flex flex-col border-r transition-all duration-300 overflow-hidden shrink-0',
        sidebarOpen ? 'w-[280px]' : 'w-[60px]'
      )}
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <BookOpen size={20} style={{ color: 'var(--accent)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--heading-color)' }}>
              AFM Study Hub
            </span>
          </Link>
        )}
        <button onClick={toggleSidebar} className="p-1 rounded hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Streak */}
      {sidebarOpen && studyStreak > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 text-sm streak-badge">
          <Flame size={16} />
          <span>{studyStreak}-day streak</span>
        </div>
      )}

      {/* Chapter list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {CHAPTERS.map(ch => {
          const isActive = pathname?.includes(ch.id);
          const isScraped = scrapedChapters.has(ch.id);
          return (
            <Link
              key={ch.id}
              href={`/chapter/${ch.id}`}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 text-sm no-underline transition-colors',
                isActive && 'font-semibold'
              )}
              style={{
                color: isActive ? 'var(--accent)' : isScraped ? 'var(--text-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                opacity: isScraped ? 1 : 0.5,
              }}
              title={sidebarOpen ? undefined : ch.title}
            >
              <span className="w-6 text-center text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                {ch.num}
              </span>
              {sidebarOpen && (
                <span className="truncate">{ch.title}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
          <ExamCountdown />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mt-2 text-xs no-underline"
            style={{ color: 'var(--text-muted)' }}
          >
            <BarChart3 size={14} />
            <span>Progress Dashboard</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
