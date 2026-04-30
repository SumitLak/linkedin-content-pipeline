'use client';

import { ProfileProvider } from '@/hooks/useProfile';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <div className="min-h-screen">
        <TopBar />
        <main className="pt-14 p-6">
          {children}
        </main>
      </div>
    </ProfileProvider>
  );
}
