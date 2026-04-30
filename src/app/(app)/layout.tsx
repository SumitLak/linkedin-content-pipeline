'use client';

import { ProfileProvider } from '@/hooks/useProfile';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="min-h-screen">
        <TopBar />
        <main className="pt-[72px] px-6 py-6">
          {children}
        </main>
      </div>
    </ProfileProvider>
  );
}
