'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const LS_KEY = 'page_background_url';
const STORAGE_PATH = 'page-background/bg.jpg';

export function usePageBackground() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setBgUrl(localStorage.getItem(LS_KEY));
  }, []);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from('post-media')
        .upload(STORAGE_PATH, file, { upsert: true });

      if (error) { console.error(error); return; }

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(STORAGE_PATH);

      // Bust cache so the new image always loads
      const busted = `${publicUrl}?t=${Date.now()}`;
      localStorage.setItem(LS_KEY, busted);
      setBgUrl(busted);
    } finally {
      setUploading(false);
    }
  }, []);

  const remove = useCallback(async () => {
    await supabase.storage.from('post-media').remove([STORAGE_PATH]);
    localStorage.removeItem(LS_KEY);
    setBgUrl(null);
  }, []);

  return { bgUrl, uploading, upload, remove };
}
