'use client';

import { useProfile } from '@/hooks/useProfile';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown, Users, Camera,
  LayoutDashboard, Columns3, CalendarDays, Library,
} from 'lucide-react';
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
  const dim = size === 'md' ? 'h-9 w-9 text-sm' : 'h-8 w-8 text-xs';
  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.name} className={`${dim} rounded-full object-cover`} />;
  }
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white`}>
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
    <header className="fixed left-0 right-0 top-0 z-30 h-[72px] bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-[72px] items-stretch px-8 gap-8">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 pr-8 border-r border-blue-100 shrink-0 self-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md">
            <span className="text-sm font-black text-white tracking-tight">in</span>
          </div>
          <div>
            <p className="text-[15px] font-black leading-tight text-blue-900 tracking-tight">LinkedIn</p>
            <p className="text-[11px] font-semibold leading-tight text-blue-400 tracking-wide uppercase">Content Pipeline</p>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group relative flex items-center gap-2 px-5 py-6 text-[15px] font-semibold transition-colors duration-150 border-b-2',
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-blue-700'
                )}
              >
                <Icon className={clsx('h-[17px] w-[17px] shrink-0', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Profile switcher ── */}
        <div ref={ref} className="relative ml-auto shrink-0 self-center">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-2.5 transition-all hover:border-blue-300 hover:bg-blue-100"
          >
            {!isAllProfiles && activeProfile ? (
              <Avatar profile={activeProfile} size="sm" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-xs font-bold text-white">
                All
              </span>
            )}
            <div className="text-left">
              <p className="text-[13px] font-bold leading-tight text-blue-900">{displayName}</p>
              <p className="text-[10px] text-blue-400 leading-tight">Active profile</p>
            </div>
            <ChevronDown className="h-4 w-4 text-blue-400 ml-1" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-200 bg-white py-2 shadow-2xl">
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Switch Profile</p>
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  className={clsx(
                    'group mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
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
                className={clsx('mx-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors', isAllProfiles ? 'bg-purple-50' : 'hover:bg-gray-50')}
                onClick={() => { setIsAllProfiles(true); setOpen(false); }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-xs font-bold text-white">All</span>
                <p className={clsx('text-sm font-semibold', isAllProfiles ? 'text-purple-700' : 'text-gray-800')}>All Profiles</p>
                {isAllProfiles && <span className="ml-auto h-2 w-2 rounded-full bg-purple-500" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
