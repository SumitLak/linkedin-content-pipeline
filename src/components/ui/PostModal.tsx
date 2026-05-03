'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Post, Analytics, BRAND_CONTEXTS, POST_FORMATS, POST_STATUSES, STATUS_LABELS,
  POSTING_DAYS, PostStatus, BrandContext, PostFormat, PostingDay,
  autoExcerpt, autoPostingDay, FORMAT_ICONS, STATUS_COLORS, BRAND_COLORS,
} from '@/types';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PostModalProps {
  post?: Post | null;
  initialStatus?: PostStatus;
  onSave: (data: Partial<Post>) => Promise<Post | null | undefined>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';

export default function PostModal({ post, initialStatus, onSave, onDelete, onClose }: PostModalProps) {
  const { activeProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [excerptManual, setExcerptManual] = useState(!!post?.excerpt);
  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false);
  const [analyticsEntries, setAnalyticsEntries] = useState<Analytics[]>(post?.analytics || []);
  const contentRef = useRef<HTMLDivElement>(null);

  // Seed contenteditable on mount only (avoids React fighting cursor position)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = form.full_post_content || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    full_post_content:   post?.full_post_content   || '',
    excerpt:             post?.excerpt              || '',
    inspiration_post_url:post?.inspiration_post_url|| '',
    inspiration_notes:   post?.inspiration_notes   || '',
    posting_day:         post?.posting_day          || '' as string,
    posting_date:        post?.posting_date          || '',
    internal_title:      post?.internal_title       || '',
    asset_format:        post?.asset_format         || '' as string,
    asset_name:          post?.asset_name           || '',
    brand_context:       post?.brand_context        || '' as string,
    status:              post?.status               || initialStatus || 'ideation' as string,
    linkedin_url:        post?.linkedin_url          || '',
    notes:               post?.notes                || '',
  });

  const [analyticsForm, setAnalyticsForm] = useState({
    analytics_date:   new Date().toISOString().split('T')[0],
    impressions:      0,
    members_reached:  0,
    reactions:        0,
    comments:         0,
    reposts:          0,
    saves:            0,
    sends:            0,
    shares:           0,
    notes:            '',
  });

  // Auto-generate excerpt
  useEffect(() => {
    if (!excerptManual && form.full_post_content) {
      setForm(prev => ({ ...prev, excerpt: autoExcerpt(form.full_post_content) }));
    }
  }, [form.full_post_content, excerptManual]);

  // Auto-fill posting day from date
  useEffect(() => {
    if (form.posting_date) {
      const day = autoPostingDay(form.posting_date);
      if (day) setForm(prev => ({ ...prev, posting_day: day }));
    }
  }, [form.posting_date]);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateAnalytics(field: string, value: string | number) {
    setAnalyticsForm(prev => ({ ...prev, [field]: value }));
  }

  // Live calc for analytics form
  const liveTotal = analyticsForm.reactions + analyticsForm.comments + analyticsForm.reposts + analyticsForm.saves + analyticsForm.sends;
  const liveRate  = analyticsForm.impressions > 0 ? ((liveTotal / analyticsForm.impressions) * 100).toFixed(2) : '0.00';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data: Partial<Post> = {
      full_post_content:    form.full_post_content || null,
      excerpt:              form.excerpt           || null,
      inspiration_post_url: form.inspiration_post_url || null,
      inspiration_notes:    form.inspiration_notes || null,
      posting_day:          (form.posting_day || null) as PostingDay | null,
      posting_date:         form.posting_date      || null,
      internal_title:       form.internal_title    || null,
      asset_format:         (form.asset_format || null) as PostFormat | null,
      asset_name:           form.asset_name        || null,
      brand_context:        (form.brand_context || null) as BrandContext | null,
      status:               form.status as PostStatus,
      linkedin_url:         form.linkedin_url      || null,
      notes:                form.notes             || null,
    };
    if (!post) data.profile_id = activeProfile?.id;
    await onSave(data);
    setSaving(false);
  }

  async function handleDelete() {
    if (!post || !onDelete) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete(post.id);
    setDeleting(false);
    onClose();
  }

  async function handleAddAnalytics(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    const { data } = await supabase
      .from('analytics')
      .insert({ post_id: post.id, ...analyticsForm })
      .select()
      .single();
    if (data) {
      setAnalyticsEntries(prev => [...prev, data]);
      setShowAnalyticsForm(false);
      // Reset form
      setAnalyticsForm({ analytics_date: new Date().toISOString().split('T')[0], impressions: 0, members_reached: 0, reactions: 0, comments: 0, reposts: 0, saves: 0, sends: 0, shares: 0, notes: '' });
    }
  }

  async function handleDeleteAnalytics(id: string) {
    await supabase.from('analytics').delete().eq('id', id);
    setAnalyticsEntries(prev => prev.filter(a => a.id !== id));
  }

  async function markAnalyticsAdded() {
    if (!post) return;
    await supabase.from('posts').update({ status: 'analytics_added' }).eq('id', post.id);
    setForm(prev => ({ ...prev, status: 'analytics_added' }));
  }

  const chartData = [...analyticsEntries]
    .sort((a, b) => a.analytics_date.localeCompare(b.analytics_date))
    .map(a => ({ date: a.analytics_date, impressions: a.impressions, engagements: a.total_engagements, rate: Number(a.engagement_rate) }));

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'analytics', label: `Analytics${analyticsEntries.length > 0 ? ` (${analyticsEntries.length})` : ''}` },
  ] as const;

  const isEditing = !!post;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEditing ? (post.internal_title || post.excerpt?.slice(0, 40) || 'Edit Post') : 'New Post'}
            </h2>
            {isEditing && post.profiles && (
              <p className="text-xs text-gray-400 mt-0.5">{post.profiles.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && onDelete && (
              <button onClick={handleDelete} disabled={deleting} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
          {/* Status badge in header */}
          <div className="ml-auto flex items-center pr-4">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[form.status as PostStatus] || ''}`}>
              {STATUS_LABELS[form.status as PostStatus] || form.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <form id="post-form" onSubmit={handleSave} className="space-y-4 p-6">
              {/* Full Post Content — rich text field */}
              <div>
                <label className={labelClass}>Full Post Content *</label>
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={e => update('full_post_content', (e.currentTarget as HTMLDivElement).innerHTML)}
                  className="min-h-[200px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 whitespace-pre-wrap break-words"
                  style={{ lineHeight: '1.6' }}
                  data-placeholder="Paste your complete LinkedIn post here — emojis, line breaks and formatting are preserved…"
                />
                <p className="mt-0.5 text-[11px] text-gray-400">Paste directly from LinkedIn, Word or any source — formatting is preserved</p>
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>Excerpt</label>
                  {excerptManual && (
                    <button type="button" onClick={() => { setExcerptManual(false); setForm(prev => ({ ...prev, excerpt: autoExcerpt(form.full_post_content) })); }} className="text-[11px] text-blue-500 hover:underline">
                      Reset to auto
                    </button>
                  )}
                </div>
                <input
                  className={`${inputClass} ${!excerptManual ? 'bg-gray-50 text-gray-500' : ''}`}
                  value={form.excerpt}
                  onChange={e => { setExcerptManual(true); update('excerpt', e.target.value); }}
                  onClick={() => setExcerptManual(true)}
                  placeholder="Auto-generated from first 120 characters"
                />
                <p className="mt-0.5 text-[11px] text-gray-400">{form.excerpt.length}/120 chars {!excerptManual && '· auto'}</p>
              </div>

              {/* Posting Date + Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Posting Date</label>
                  <input type="date" className={inputClass} value={form.posting_date} onChange={e => update('posting_date', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Posting Day</label>
                  <select className={inputClass} value={form.posting_day} onChange={e => update('posting_day', e.target.value)}>
                    <option value="">Auto from date</option>
                    {POSTING_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Internal Title + Asset Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Internal Title / Memory Hook</label>
                  <input className={inputClass} value={form.internal_title} onChange={e => update('internal_title', e.target.value)} placeholder="e.g. leadership resilience post" />
                </div>
                <div>
                  <label className={labelClass}>Asset Name / Reminder</label>
                  <input className={inputClass} value={form.asset_name} onChange={e => update('asset_name', e.target.value)} placeholder="e.g. barber big video" />
                </div>
              </div>

              {/* Format + Brand + Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Asset Format</label>
                  <select className={inputClass} value={form.asset_format} onChange={e => update('asset_format', e.target.value)}>
                    <option value="">Select...</option>
                    {POST_FORMATS.map(f => <option key={f} value={f}>{FORMAT_ICONS[f]} {f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Brand / Context</label>
                  <select className={inputClass} value={form.brand_context} onChange={e => update('brand_context', e.target.value)}>
                    <option value="">Select...</option>
                    {BRAND_CONTEXTS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={form.status} onChange={e => update('status', e.target.value)}>
                    {POST_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <div className="flex gap-2">
                  <input className={inputClass} value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/posts/..." />
                  {form.linkedin_url && (
                    <a href={form.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center rounded-lg border border-gray-300 px-3 text-blue-500 hover:bg-blue-50">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Inspiration */}
              <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Inspiration</p>
                <div>
                  <label className={labelClass}>Inspiration Post URL</label>
                  <input className={inputClass} value={form.inspiration_post_url} onChange={e => update('inspiration_post_url', e.target.value)} placeholder="https://linkedin.com/..." />
                </div>
                <div>
                  <label className={labelClass}>Inspiration Notes</label>
                  <textarea className={inputClass} rows={2} value={form.inspiration_notes} onChange={e => update('inspiration_notes', e.target.value)} placeholder="What inspired this post?" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>Notes</label>
                <textarea className={inputClass} rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} />
              </div>
            </form>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6 space-y-5">
              {!isEditing ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <p className="text-sm text-gray-400">Save the post first, then add analytics.</p>
                </div>
              ) : (
                <>
                  {/* Status prompt */}
                  {analyticsEntries.length > 0 && form.status !== 'analytics_added' && (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                      <p className="text-sm text-blue-700">Analytics added — mark as Analytics Added?</p>
                      <button onClick={markAnalyticsAdded} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        Mark Done
                      </button>
                    </div>
                  )}

                  {/* Add entry toggle */}
                  <button
                    onClick={() => setShowAnalyticsForm(!showAnalyticsForm)}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-blue-200 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <span>+ Add analytics entry</span>
                    {showAnalyticsForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showAnalyticsForm && (
                    <form onSubmit={handleAddAnalytics} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className={labelClass}>Analytics Date</label>
                          <input type="date" required className={inputClass} value={analyticsForm.analytics_date} onChange={e => updateAnalytics('analytics_date', e.target.value)} />
                        </div>
                        {([['impressions','Impressions'],['members_reached','Members Reached'],['reactions','Reactions'],['comments','Comments'],['reposts','Reposts'],['saves','Saves'],['sends','Sends'],['shares','Shares']] as [string, string][]).map(([field, label]) => (
                          <div key={field}>
                            <label className={labelClass}>{label}</label>
                            <input
                              type="number" min="0" className={inputClass}
                              value={(analyticsForm as Record<string, unknown>)[field] as number}
                              onChange={e => updateAnalytics(field, parseInt(e.target.value) || 0)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Live calc */}
                      <div className="flex gap-4 rounded-lg bg-white p-3 text-sm">
                        <div>
                          <span className="text-xs text-gray-400">Total Engagements</span>
                          <p className="font-bold text-gray-900">{liveTotal}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Engagement Rate</span>
                          <p className="font-bold text-green-600">{liveRate}%</p>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Notes</label>
                        <input className={inputClass} value={analyticsForm.notes} onChange={e => updateAnalytics('notes', e.target.value)} />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Entry</button>
                        <button type="button" onClick={() => setShowAnalyticsForm(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
                      </div>
                    </form>
                  )}

                  {/* Chart */}
                  {chartData.length > 1 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Performance Over Time</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="l" type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Impressions" />
                          <Line yAxisId="l" type="monotone" dataKey="engagements" stroke="#10b981" strokeWidth={2} dot={false} name="Engagements" />
                          <Line yAxisId="r" type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Rate %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Entries table */}
                  {analyticsEntries.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            {['Date','Impressions','Reactions','Comments','Reposts','Saves','Sends','Total','Rate%',''].map(h => (
                              <th key={h} className="px-2.5 py-2 text-left font-semibold text-gray-500">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...analyticsEntries].sort((a,b) => b.analytics_date.localeCompare(a.analytics_date)).map(a => (
                            <tr key={a.id} className="border-b hover:bg-gray-50">
                              <td className="px-2.5 py-2 text-gray-700">{a.analytics_date}</td>
                              <td className="px-2.5 py-2">{a.impressions.toLocaleString()}</td>
                              <td className="px-2.5 py-2">{a.reactions}</td>
                              <td className="px-2.5 py-2">{a.comments}</td>
                              <td className="px-2.5 py-2">{a.reposts}</td>
                              <td className="px-2.5 py-2">{a.saves}</td>
                              <td className="px-2.5 py-2">{a.sends}</td>
                              <td className="px-2.5 py-2 font-semibold">{a.total_engagements}</td>
                              <td className="px-2.5 py-2 font-semibold text-green-600">{Number(a.engagement_rate).toFixed(2)}%</td>
                              <td className="px-2.5 py-2">
                                <button onClick={() => handleDeleteAnalytics(a.id)} className="text-red-400 hover:text-red-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {analyticsEntries.length === 0 && !showAnalyticsForm && (
                    <p className="py-8 text-center text-sm text-gray-400">No analytics entries yet.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <div className="text-xs text-gray-400">
            {post?.updated_at && `Updated ${new Date(post.updated_at).toLocaleDateString()}`}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {isEditing ? 'Close' : 'Cancel'}
            </button>
            {activeTab === 'overview' && (
              <button
                type="submit"
                form="post-form"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Post'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
