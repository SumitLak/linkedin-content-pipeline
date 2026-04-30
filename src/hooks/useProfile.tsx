'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile | null) => void;
  isAllProfiles: boolean;
  setIsAllProfiles: (val: boolean) => void;
  loading: boolean;
  uploadAvatar: (profileId: string, file: File) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profiles: [],
  activeProfile: null,
  setActiveProfile: () => {},
  isAllProfiles: false,
  setIsAllProfiles: () => {},
  loading: true,
  uploadAvatar: async () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isAllProfiles, setIsAllProfiles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('name');
    if (data && data.length > 0) {
      setProfiles(data);
      setActiveProfileState(data[0]);
    }
    setLoading(false);
  }

  function setActiveProfile(profile: Profile | null) {
    setActiveProfileState(profile);
    setIsAllProfiles(false);
  }

  async function uploadAvatar(profileId: string, file: File) {
    const ext = file.name.split('.').pop();
    const path = `avatars/${profileId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(path, file, { upsert: true });

    if (uploadError) return;

    const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(path);

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profileId);

    setProfiles(prev =>
      prev.map(p => p.id === profileId ? { ...p, avatar_url: publicUrl } : p)
    );
    if (activeProfile?.id === profileId) {
      setActiveProfileState(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
    }
  }

  return (
    <ProfileContext.Provider value={{ profiles, activeProfile, setActiveProfile, isAllProfiles, setIsAllProfiles, loading, uploadAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
