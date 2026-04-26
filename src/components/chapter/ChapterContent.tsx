'use client';

interface Props {
  html: string;
}

export function ChapterContent({ html }: Props) {
  return (
    <div
      className="chapter-content prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
