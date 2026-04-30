'use client';

import { ProfileProvider } from '@/hooks/useProfile';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="min-h-screen">
        <TopBar />
        <main className="px-8 pb-10" style={{ paddingTop: 'calc(72px + 32px)' }}>
          {children}
        </main>
      </div>
    </ProfileProvider>
  );
}
