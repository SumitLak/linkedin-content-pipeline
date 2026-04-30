'use client';

import { useRef } from 'react';
import { Upload, X, RefreshCw, ImageIcon, Layers } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';

export default function PageBackgroundUpload() {
  const { bgUrl, uploading, upload, remove } = usePageBackground();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
          <Layers className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">Page Background</h3>
          <p className="text-xs text-gray-400">Applied to Board, Calendar &amp; Library pages</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
          style={bgUrl ? {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {!bgUrl && (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-300" />
            </div>
          )}
          {bgUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
              <span className="text-[10px] font-bold text-white">Custom BG</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {uploading ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Uploading…</>
            ) : bgUrl ? (
              <><RefreshCw className="h-4 w-4" /> Replace image</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload image</>
            )}
          </button>

          {bgUrl && (
            <button
              onClick={remove}
              className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <X className="h-4 w-4" /> Remove image
            </button>
          )}

          {!bgUrl && (
            <p className="text-xs text-gray-400">No background set — pages use default white</p>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
