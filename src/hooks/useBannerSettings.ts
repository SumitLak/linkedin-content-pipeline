'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export const TIME_PERIODS: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

const LS_KEY = (t: TimeOfDay) => `banner_img_${t}`;

export function useBannerSettings() {
  const [bannerUrls, setBannerUrls] = useState<Record<TimeOfDay, string | null>>({
    morning: null, afternoon: null, evening: null, night: null,
  });
  const [uploading, setUploading] = useState<TimeOfDay | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = {} as Record<TimeOfDay, string | null>;
    TIME_PERIODS.forEach(t => {
      loaded[t] = localStorage.getItem(LS_KEY(t));
    });
    setBannerUrls(loaded);
  }, []);

  const upload = useCallback(async (period: TimeOfDay, file: File) => {
    setUploading(period);
    try {
      const ext  = file.name.split('.').pop() || 'jpg';
      const path = `banners/${period}.${ext}`;

      const { error } = await supabase.storage
        .from('post-media')
        .upload(path, file, { upsert: true });

      if (error) { console.error(error); return; }

      const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(path);

      localStorage.setItem(LS_KEY(period), publicUrl);
      setBannerUrls(prev => ({ ...prev, [period]: publicUrl }));
    } finally {
      setUploading(null);
    }
  }, []);

  const remove = useCallback(async (period: TimeOfDay) => {
    // Remove from storage (best-effort)
    await supabase.storage.from('post-media').remove([`banners/${period}.jpg`, `banners/${period}.png`, `banners/${period}.webp`]);
    localStorage.removeItem(LS_KEY(period));
    setBannerUrls(prev => ({ ...prev, [period]: null }));
  }, []);

  return { bannerUrls, uploading, upload, remove };
}
