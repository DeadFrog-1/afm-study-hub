'use client';

export function ChapterContent({ html }) {
  return (
    <div
      className="chapter-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
