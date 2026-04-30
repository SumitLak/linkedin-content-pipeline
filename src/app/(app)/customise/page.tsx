'use client';

import DashboardBannerSettings from '@/components/dashboard/DashboardBannerSettings';
import PageBackgroundUpload from '@/components/dashboard/PageBackgroundUpload';
import { Settings2 } from 'lucide-react';

export default function CustomisePage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
          <Settings2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customise</h1>
          <p className="text-sm text-gray-400">Personalise your dashboard and page appearance</p>
        </div>
      </div>

      <DashboardBannerSettings />
      <PageBackgroundUpload />
    </div>
  );
}
