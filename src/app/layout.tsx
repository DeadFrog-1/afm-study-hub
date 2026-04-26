// ─────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export const metadata: Metadata = {
  title: 'AFM Study Hub',
  description: 'ACCA AFM Study Application — Offline First',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
