'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { MindMapNode } from '@/types';
import { MindMap } from '@/components/mindmap/MindMap';

export default function MindMapPage() {
  const params = useParams();
  const chapterId = params.id as string;
  const [mindmap, setMindmap] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content/${chapterId}?type=mindmap`)
      .then(r => r.json())
      .then(data => { setMindmap(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [chapterId]);

  if (loading) return <div className="animate-pulse h-64 rounded" style={{ background: 'var(--bg-secondary)' }} />;
  if (!mindmap) return (
    <div className="text-center py-16">
      <h2 style={{ color: 'var(--text-muted)' }}>No mind map yet</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="mb-6">Mind Map</h1>
      <MindMap node={mindmap} depth={0} />
    </div>
  );
}
