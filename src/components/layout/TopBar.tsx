'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, Sun, Moon } from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';
import clsx from 'clsx';

const TABS = [
  { label: 'Content', path: '' },
  { label: 'Questions', path: 'questions' },
  { label: 'Quiz', path: 'quiz' },
  { label: 'Flashcards', path: 'flashcards' },
  { label: 'Mind Map', path: 'mindmap' },
  { label: 'CR Exam', path: 'cr-exam' },
];

export function TopBar() {
  const pathname = usePathname() || '';
  const { toggleSidebar, theme, setTheme, overallPercent } = useStudyStore();

  const isChapter = pathname.includes('/chapter/ch');
  const chapterMatch = pathname.match(/\/chapter\/(ch\d+)/);
  const chapterId = chapterMatch?.[1];
  const activeTab = isChapter
    ? (TABS.find(t => t.path && pathname.includes(t.path))?.path || '')
    : '';

  return (
    <header
      className="flex items-center gap-4 px-4 border-b shrink-0 h-14"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Mobile menu */}
      <button onClick={toggleSidebar} className="p-1 rounded lg:hidden" style={{ color: 'var(--text-muted)' }}>
        <Menu size={20} />
      </button>

      {/* Chapter tabs */}
      {isChapter && chapterId && (
        <nav className="flex items-center gap-1 overflow-x-auto flex-1">
          {TABS.map(tab => {
            const href = tab.path
              ? `/chapter/${chapterId}/${tab.path}`
              : `/chapter/${chapterId}`;
            const isActive = tab.path === activeTab || (!tab.path && pathname === `/chapter/${chapterId}`);
            return (
              <Link
                key={tab.path}
                href={href}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-md no-underline whitespace-nowrap transition-colors',
                  isActive && 'font-semibold'
                )}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      )}

      {!isChapter && <div className="flex-1" />}

      {/* Theme + progress */}
      <div className="flex items-center gap-3">
        <div
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}
        >
          {overallPercent}%
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-md hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
