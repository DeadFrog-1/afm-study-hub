'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, CheckCircle2, Flame, Target, Trophy, Clock, TrendingUp, Swords,
} from 'lucide-react';
import { useStudyStore } from '@/store/useStudyStore';

interface ChapterInfo {
  id: string;
  title: string;
  examWeight: string;
  status: string;
  stats?: { pages: number };
}

export default function DashboardPage() {
  const { studyStreak, weeklyMinutes, overallPercent } = useStudyStore();
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [streakCalendar, setStreakCalendar] = useState<boolean[]>([]);

  useEffect(() => {
    fetch('/api/content/metadata')
      .then(r => r.json())
      .then(data => {
        if (data?.chapters) setChapters(data.chapters);
      })
      .catch(() => {});
    fetch('/api/progress?type=calendar&days=30')
      .then(r => r.json())
      .then(data => { if (data?.calendar) setStreakCalendar(data.calendar); })
      .catch(() => {});
  }, []);

  const scrapedCount = chapters.filter(c => c.status === 'scraped').length;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="mb-6">AFM Study Hub</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Target size={20} />} label="Overall Progress" value={`${overallPercent}%`} color="var(--accent)" />
        <StatCard icon={<Flame size={20} />} label="Study Streak" value={`${studyStreak} days`} color="var(--streak-gold)" />
        <StatCard icon={<Clock size={20} />} label="This Week" value={`${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`} color="var(--battle-green)" />
        <StatCard icon={<BookOpen size={20} />} label="Chapters Scraped" value={`${scrapedCount} / 18`} color="var(--mastery-purple)" />
      </div>

      {/* Streak calendar */}
      <div className="rounded-lg p-4 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Study Calendar (last 30 days)
        </h3>
        <div className="flex flex-wrap gap-1">
          {streakCalendar.map((studied, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-sm"
              style={{
                background: studied ? 'var(--success)' : 'var(--bg-secondary)',
                opacity: studied ? 1 : 0.4,
              }}
              title={studied ? 'Studied' : 'No study'}
            />
          ))}
        </div>
      </div>

      {/* Chapter grid */}
      <h2 className="mb-4">Chapters</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {chapters.map(ch => (
          <Link
            key={ch.id}
            href={`/chapter/${ch.id}`}
            className="flex items-center gap-3 p-3 rounded-lg no-underline transition-colors hover:opacity-90"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              opacity: ch.status === 'scraped' ? 1 : 0.4,
            }}
          >
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}>
              {ch.id.replace('ch', '')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{ch.title}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ch.status === 'scraped'
                  ? `${ch.stats?.pages || 0} pages · ${ch.examWeight}`
                  : 'Not scraped yet'}
              </div>
            </div>
            {ch.status === 'scraped' && (
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
            )}
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction href="/daily-challenge" icon={<Target size={18} />} label="Daily Challenge" />
        <QuickAction href="/quiz-battle" icon={<Swords size={18} />} label="Quiz Battle" />
        <QuickAction href="/exam-simulation" icon={<Trophy size={18} />} label="Exam Simulation" />
        <QuickAction href="/study-analytics" icon={<TrendingUp size={18} />} label="Analytics" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>{icon}</div>
      <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 rounded-lg no-underline transition-colors hover:opacity-90"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
