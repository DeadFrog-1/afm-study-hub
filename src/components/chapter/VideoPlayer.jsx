'use client';

export function VideoPlayer({ src, alt }) {
  return (
    <div className="rounded-lg overflow-hidden my-4" style={{ border: '1px solid var(--border)' }}>
      <video
        controls
        preload="metadata"
        className="w-full"
        title={alt}
      >
        <source src={src} />
        Your browser does not support video.
      </video>
    </div>
  );
}
