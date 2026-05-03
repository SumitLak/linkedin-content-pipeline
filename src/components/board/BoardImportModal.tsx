'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Post, PostStatus, PostingDay, autoPostingDay } from '@/types';

interface ParsedRow {
  posting_day?: string;
  posting_date?: string;
  full_post_content?: string;
  asset_name?: string;
  status?: string;
  linkedin_url?: string;
}

const STATUS_MAP: Record<string, PostStatus> = {
  live: 'live', Live: 'live', LIVE: 'live',
  scheduled: 'scheduled', Scheduled: 'scheduled', SCHEDULED: 'scheduled',
  ideation: 'ideation', Ideation: 'ideation', IDEATION: 'ideation',
  analytics_added: 'analytics_added',
  archived: 'archived', Archived: 'archived',
};

function normaliseStatus(raw: string): PostStatus {
  return STATUS_MAP[raw?.trim()] || 'ideation';
}

function normaliseDate(raw: string): string | null {
  if (!raw?.trim()) return null;
  // Handle "01-May-26" or "01-May-2026" or "2026-05-01"
  const monthMap: Record<string, string> = {
    Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',
    Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12',
  };
  const ddMonYY = raw.match(/^(\d{1,2})[/-]([A-Za-z]{3})[/-](\d{2,4})$/);
  if (ddMonYY) {
    const [, dd, mon, yy] = ddMonYY;
    const month = monthMap[mon.charAt(0).toUpperCase() + mon.slice(1).toLowerCase()];
    if (!month) return null;
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${month}-${dd.padStart(2, '0')}`;
  }
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  return null;
}

function parseTSV(text: string): ParsedRow[] {
  const lines = text.trim().split('\n').map(l => l.trimEnd());
  if (lines.length < 2) return [];

  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());

  // Map header names to our fields
  function colIdx(keywords: string[]): number {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  }

  const dayIdx     = colIdx(['day']);
  const dateIdx    = colIdx(['date']);
  const postIdx    = colIdx(['post', 'content', 'hook', 'caption']);
  const assetIdx   = colIdx(['video', 'asset', 'reference', 'internal']);
  const statusIdx  = colIdx(['status']);
  const urlIdx     = colIdx(['linkedin', 'url', 'insp']);

  return lines.slice(1).map(line => {
    const cells = line.split('\t');
    const get = (i: number) => (i >= 0 ? cells[i]?.trim() || '' : '');

    const rawDate = get(dateIdx);
    const posting_date = normaliseDate(rawDate) || undefined;
    const posting_day_from_date = posting_date ? autoPostingDay(posting_date) || undefined : undefined;
    const posting_day = get(dayIdx) || posting_day_from_date;

    return {
      posting_day:          posting_day || undefined,
      posting_date:         posting_date || undefined,
      full_post_content:    get(postIdx) || undefined,
      asset_name:           get(assetIdx) || undefined,
      status:               get(statusIdx) || undefined,
      linkedin_url:         get(urlIdx) || undefined,
    };
  }).filter(r => r.full_post_content || r.posting_date);
}

interface Props {
  onImport: (rows: Partial<Post>[]) => Promise<void>;
  onClose: () => void;
}

export default function BoardImportModal({ onImport, onClose }: Props) {
  const [text, setText] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  function handleParse() {
    setRows(parseTSV(text));
  }

  async function handleImport() {
    setImporting(true);
    const posts: Partial<Post>[] = rows.map(r => ({
      full_post_content: r.full_post_content || null,
      asset_name:        r.asset_name        || null,
      posting_date:      r.posting_date      || null,
      posting_day:       (r.posting_day      || null) as PostingDay | null,
      status:            normaliseStatus(r.status || ''),
      linkedin_url:      r.linkedin_url      || null,
    }));
    try {
      await onImport(posts);
      setDone(true);
    } catch (e: any) {
      setImportError(e?.message || 'Import failed. Check the console for details.');
    } finally {
      setImporting(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Paste List from Excel</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Copy rows from Excel (Ctrl+C) and paste below. Expects columns: Day, Date, Post, Video/Asset, Status
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Paste area */}
          <textarea
            className="w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-4 text-sm font-mono text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            rows={6}
            value={text}
            onChange={e => { setText(e.target.value); setRows([]); setDone(false); }}
            placeholder={"Paste your Excel rows here (including the header row)...\n\nDay\tDate\tPost\tVideo (Internal Reference)\tStatus\n..."}
          />

          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-colors"
          >
            <Upload className="h-4 w-4" /> Parse {text.trim() ? `(${text.trim().split('\n').length - 1} rows detected)` : ''}
          </button>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {rows.length} posts ready to import
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      {['Date','Day','Content Preview','Asset','Status'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold uppercase tracking-wider text-white/90 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.posting_date || '—'}</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{r.posting_day?.slice(0,3) || '—'}</td>
                        <td className="px-3 py-2 text-gray-700 max-w-[260px]">
                          <span className="block truncate">{r.full_post_content || '—'}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap italic">{r.asset_name || '—'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            normaliseStatus(r.status || '') === 'live'      ? 'bg-emerald-100 text-emerald-700' :
                            normaliseStatus(r.status || '') === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                            'bg-violet-100 text-violet-700'
                          }`}>
                            {normaliseStatus(r.status || '')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {rows.length === 0 && text.trim() && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              No rows parsed. Make sure you copy the header row too, and that columns are tab-separated (paste directly from Excel).
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {importError && (
              <span className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {importError}
              </span>
            )}
            {done ? (
              <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Imported!
              </span>
            ) : (
              <button
                onClick={handleImport}
                disabled={rows.length === 0 || importing}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {importing ? 'Importing…' : `Import ${rows.length} Posts`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
