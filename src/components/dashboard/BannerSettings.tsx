'use client';

import { useRef } from 'react';
import { Upload, X, ImageIcon, RefreshCw } from 'lucide-react';
import { useBannerSettings, TimeOfDay, TIME_PERIODS } from '@/hooks/useBannerSettings';

const PERIOD_LABELS: Record<TimeOfDay, { label: string; emoji: string; accent: string }> = {
  morning:   { label: 'Morning',   emoji: '🌅', accent: 'from-amber-400 to-yellow-300' },
  afternoon: { label: 'Afternoon', emoji: '☀️', accent: 'from-orange-500 to-amber-400' },
  evening:   { label: 'Evening',   emoji: '🌆', accent: 'from-purple-700 to-rose-500' },
  night:     { label: 'Night',     emoji: '🌙', accent: 'from-blue-950 to-indigo-800' },
};

function PeriodCard({
  period,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  period: TimeOfDay;
  url: string | null;
  uploading: boolean;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { label, emoji, accent } = PERIOD_LABELS[period];

  return (
    <div className="flex flex-col gap-2">
      {/* Preview / placeholder */}
      <div
        className="relative h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {!url && (
          <div className={`h-full w-full bg-gradient-to-br ${accent} opacity-60`} />
        )}

        {/* Overlay buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white"
            disabled={uploading}
          >
            {uploading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <>{url ? <RefreshCw className="h-3 w-3" /> : <Upload className="h-3 w-3" />}</>
            )}
            {url ? 'Replace' : 'Upload'}
          </button>
          {url && (
            <button
              onClick={onRemove}
              className="flex items-center gap-1 rounded-lg bg-red-500/90 px-2.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-600"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>

        {/* Period label badge */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
          <span>{emoji}</span>
          <span>{label}</span>
        </div>

        {/* Custom image indicator */}
        {url && (
          <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
            <ImageIcon className="h-2.5 w-2.5 text-white" />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
      </div>

      {/* Upload button (always visible below) */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
      >
        {uploading ? (
          <><RefreshCw className="h-3 w-3 animate-spin" /> Uploading…</>
        ) : url ? (
          <><RefreshCw className="h-3 w-3" /> Replace</>
        ) : (
          <><Upload className="h-3 w-3" /> Upload image</>
        )}
      </button>
    </div>
  );
}

export default function BannerSettings() {
  const { bannerUrls, uploading, upload, remove } = useBannerSettings();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800">Banner Backgrounds</h3>
        <p className="mt-0.5 text-xs text-gray-400">
          Upload a custom photo for each time of day. Hover the preview to replace or remove.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TIME_PERIODS.map(period => (
          <PeriodCard
            key={period}
            period={period}
            url={bannerUrls[period]}
            uploading={uploading === period}
            onUpload={f => upload(period, f)}
            onRemove={() => remove(period)}
          />
        ))}
      </div>
    </div>
  );
}
