'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type BannerPeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export const BANNER_PERIODS: BannerPeriod[] = ['morning', 'afternoon', 'evening', 'night'];

const lsKey = (p: BannerPeriod) => `dashboard_banner_${p}`;
const storagePath = (p: BannerPeriod) => `dashboard-banners/${p}.jpg`;
const CHANGE_EVENT = 'dashboard-banner-changed';

function readAllFromStorage(): Record<BannerPeriod, string | null> {
  const out = {} as Record<BannerPeriod, string | null>;
  BANNER_PERIODS.forEach(p => { out[p] = localStorage.getItem(lsKey(p)); });
  return out;
}

export function useDashboardBanner() {
  const [urls, setUrls] = useState<Record<BannerPeriod, string | null>>({
    morning: null, afternoon: null, evening: null, night: null,
  });
  const [uploading, setUploading] = useState<BannerPeriod | null>(null);

  // Load on mount + re-sync whenever any instance makes a change
  useEffect(() => {
    setUrls(readAllFromStorage());
    const handler = () => setUrls(readAllFromStorage());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const upload = useCallback(async (period: BannerPeriod, file: File) => {
    setUploading(period);
    try {
      const { error } = await supabase.storage
        .from('post-media')
        .upload(storagePath(period), file, { upsert: true });
      if (error) { console.error(error); return; }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media').getPublicUrl(storagePath(period));

      const busted = `${publicUrl}?t=${Date.now()}`;
      localStorage.setItem(lsKey(period), busted);
      // Notify all hook instances (including TimeGreeting) to refresh
      window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    } finally {
      setUploading(null);
    }
  }, []);

  const remove = useCallback(async (period: BannerPeriod) => {
    await supabase.storage.from('post-media').remove([storagePath(period)]);
    localStorage.removeItem(lsKey(period));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }, []);

  return { urls, uploading, upload, remove };
}
