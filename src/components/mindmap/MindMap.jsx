'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const DEPTH_COLORS = ['#6B0000', '#800000', '#7C3AED', '#8B7AA0'];

export function MindMap({ node, depth }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const color = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

  return (
    <div className={depth > 0 ? 'ml-6 mt-1' : ''}>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="flex items-center gap-2 py-1 text-left w-full"
        style={{ color }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <span className="w-3.5" />
        )}
        <span className={`text-sm ${depth === 0 ? 'font-bold text-base' : 'font-medium'}`}>
          {node.label}
        </span>
      </button>
      {expanded && hasChildren && (
        <div className="animate-fade-in">
          {node.children.map(child => (
            <MindMap key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
