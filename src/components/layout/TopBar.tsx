'use client';

import { useProfile } from '@/hooks/useProfile';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Users, Camera, LayoutDashboard, Columns3, CalendarDays, Library } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Profile } from '@/types';

const navItems = [
  { href: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { href: '/board',    label: 'Board',     icon: Columns3 },
  { href: '/calendar', label: 'Calendar',  icon: CalendarDays },
  { href: '/library',  label: 'Library',   icon: Library },
];

function Avatar({ profile, size = 'sm' }: { profile: Profile; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm';
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.name} className={`${dim} rounded-full object-cover`} />;
  }
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white`}>
      {initials}
    </span>
  );
}

export default function TopBar() {
  const { profiles, activeProfile, setActiveProfile, isAllProfiles, setIsAllProfiles, uploadAvatar } = useProfile();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = isAllProfiles ? 'All Profiles' : activeProfile?.name || 'Select Profile';

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-blue-900/20 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-4 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2.5 pr-6 border-r border-white/10">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/20">
          <span className="text-xs font-black text-white">in</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-[12px] font-bold leading-tight text-white">LinkedIn</p>
          <p className="text-[10px] font-semibold leading-tight text-blue-300">Content Pipeline</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile switcher — pushed to the right */}
      <div ref={ref} className="relative ml-auto">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          {!isAllProfiles && activeProfile ? (
            <Avatar profile={activeProfile} size="sm" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
            <p className="px-4 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Profiles</p>
            {profiles.map(profile => (
              <div
                key={profile.id}
                className={clsx(
                  'group mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  !isAllProfiles && activeProfile?.id === profile.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                )}
                onClick={() => { setActiveProfile(profile); setOpen(false); }}
              >
                <div className="relative">
                  <Avatar profile={profile} size="md" />
                  <label
                    className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={e => e.stopPropagation()}
                  >
                    <Camera className="h-2.5 w-2.5 text-gray-500" />
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) await uploadAvatar(profile.id, file);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
                <p className={clsx('flex-1 truncate text-sm font-semibold', !isAllProfiles && activeProfile?.id === profile.id ? 'text-blue-700' : 'text-gray-800')}>
                  {profile.name}
                </p>
                {!isAllProfiles && activeProfile?.id === profile.id && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))}

            <div className="mx-3 my-2 border-t border-gray-100" />

            <div
              className={clsx('mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors', isAllProfiles ? 'bg-purple-50' : 'hover:bg-gray-50')}
              onClick={() => { setIsAllProfiles(true); setOpen(false); }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-xs font-bold text-white">All</span>
              <p className={clsx('text-sm font-semibold', isAllProfiles ? 'text-purple-700' : 'text-gray-800')}>All Profiles</p>
              {isAllProfiles && <span className="ml-auto h-2 w-2 rounded-full bg-purple-500" />}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
