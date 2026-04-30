'use client';

import { ProfileProvider } from '@/hooks/useProfile';
import TopBar from '@/components/layout/TopBar';
import { usePageBackground } from '@/hooks/usePageBackground';
import { usePathname } from 'next/navigation';

function AppContent({ children }: { children: React.ReactNode }) {
  const { bgUrl } = usePageBackground();
  const pathname = usePathname();
  const isBgPage = pathname !== '/'; // apply to Board, Calendar, Library (everything except Dashboard)

  return (
    <div className="min-h-screen">
      <TopBar />
      <main
        className="px-8 pb-10"
        style={{
          paddingTop: 'calc(72px + 32px)',
          ...(isBgPage && bgUrl ? {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          } : {}),
        }}
      >
        {/* Frosted content overlay when background image is active */}
        {isBgPage && bgUrl ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-xl ring-1 ring-white/60">
            {children}
          </div>
        ) : children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AppContent>{children}</AppContent>
    </ProfileProvider>
  );
}
