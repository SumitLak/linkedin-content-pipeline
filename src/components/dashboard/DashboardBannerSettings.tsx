'use client';

import { useRef } from 'react';
import { Upload, X, RefreshCw, ImageIcon, Sunset } from 'lucide-react';
import { useDashboardBanner, BannerPeriod, BANNER_PERIODS } from '@/hooks/useDashboardBanner';

const META: Record<BannerPeriod, { label: string; emoji: string; gradient: string }> = {
  morning:   { label: 'Morning',   emoji: '🌅', gradient: 'from-amber-300 to-yellow-200' },
  afternoon: { label: 'Afternoon', emoji: '☀️', gradient: 'from-orange-400 to-amber-300' },
  evening:   { label: 'Evening',   emoji: '🌆', gradient: 'from-purple-700 to-rose-400' },
  night:     { label: 'Night',     emoji: '🌙', gradient: 'from-blue-950 to-indigo-700' },
};

function PeriodCard({ period, url, uploading, onUpload, onRemove }: {
  period: BannerPeriod; url: string | null; uploading: boolean;
  onUpload: (f: File) => void; onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { label, emoji, gradient } = META[period];

  return (
    <div className="flex flex-col gap-2">
      {/* Preview */}
      <div
        className="relative h-28 overflow-hidden rounded-xl border-2 border-dashed border-gray-200"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {!url && <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-bold text-gray-800 hover:bg-white"
          >
            {uploading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {url ? 'Replace' : 'Upload'}
          </button>
          {url && (
            <button onClick={onRemove} className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-600">
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>

        {/* Label */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          {emoji} {label}
        </div>

        {/* Green dot when custom image is set */}
        {url && <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />}

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
      </div>

      {/* Button below */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
      >
        {uploading ? <><RefreshCw className="h-3 w-3 animate-spin" /> Uploading…</> :
         url      ? <><RefreshCw className="h-3 w-3" /> Replace</> :
                    <><Upload className="h-3 w-3" /> Upload photo</>}
      </button>
    </div>
  );
}

export default function DashboardBannerSettings() {
  const { urls, uploading, upload, remove } = useDashboardBanner();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
          <ImageIcon className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Dashboard Banner Photos</h3>
          <p className="text-xs text-gray-400">Upload a photo per time of day — replaces the animated gradient</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BANNER_PERIODS.map(p => (
          <PeriodCard key={p} period={p} url={urls[p]} uploading={uploading === p}
            onUpload={f => upload(p, f)} onRemove={() => remove(p)} />
        ))}
      </div>
    </div>
  );
}
