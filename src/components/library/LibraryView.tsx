'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, ExternalLink, X, Download, Upload, Link2 } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { Post, BRAND_CONTEXTS, POST_FORMATS, POST_STATUSES, STATUS_LABELS, STATUS_COLORS, BRAND_COLORS, FORMAT_ICONS, POSTING_DAYS, BrandContext, PostFormat, PostStatus, PostingDay, autoExcerpt } from '@/types';
import PostModal from '@/components/ui/PostModal';
import { postsToCSV, parseCSV, downloadCSV } from '@/lib/csv';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

export default function LibraryView() {
  const { posts, loading, createPost, updatePost, deletePost, fetchPosts } = usePosts();
  const { activeProfile } = useProfile();
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    return posts.filter(post => {
      if (search) {
        const q = search.toLowerCase();
        const fields = [post.full_post_content, post.excerpt, post.internal_title, post.asset_name, post.notes, post.inspiration_notes];
        if (!fields.some(f => f?.toLowerCase().includes(q))) return false;
      }
      if (filterBrand  && post.brand_context !== filterBrand)  return false;
      if (filterFormat && post.asset_format  !== filterFormat) return false;
      if (filterStatus && post.status        !== filterStatus) return false;
      if (filterDay    && post.posting_day   !== filterDay)    return false;
      if (filterDateFrom && post.posting_date && post.posting_date < filterDateFrom) return false;
      if (filterDateTo   && post.posting_date && post.posting_date > filterDateTo)   return false;
      return true;
    });
  }, [posts, search, filterBrand, filterFormat, filterStatus, filterDay, filterDateFrom, filterDateTo]);

  const hasFilters = filterBrand || filterFormat || filterStatus || filterDay || filterDateFrom || filterDateTo;

  function clearFilters() {
    setFilterBrand(''); setFilterFormat(''); setFilterStatus('');
    setFilterDay(''); setFilterDateFrom(''); setFilterDateTo('');
  }

  function openEdit(post: Post) { setSelectedPost(post); setShowModal(true); }

  async function handleSave(data: Partial<Post>): Promise<Post | null | undefined> {
    let result;
    if (selectedPost) result = await updatePost(selectedPost.id, data);
    else result = await createPost(data);
    setShowModal(false);
    setSelectedPost(null);
    return result;
  }

  async function handleDelete(id: string) {
    await deletePost(id);
    setShowModal(false);
    setSelectedPost(null);
  }

  function handleExport() {
    downloadCSV(postsToCSV(filtered), `lcp-posts-${new Date().toISOString().split('T')[0]}.csv`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeProfile) return;
    setImporting(true);
    const text = await file.text();
    const rows = parseCSV(text);
    const validFields = ['internal_title', 'asset_name', 'brand_context', 'asset_format', 'status', 'posting_day', 'posting_date', 'linkedin_url', 'full_post_content', 'excerpt', 'inspiration_post_url', 'inspiration_notes', 'notes'];
    for (const row of rows) {
      const postData: Record<string, unknown> = { profile_id: activeProfile.id };
      validFields.forEach(f => { if (row[f]) postData[f] = row[f]; });
      await supabase.from('posts').insert(postData);
    }
    setImporting(false);
    fetchPosts();
    e.target.value = '';
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );

  const selectClass = 'rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none';

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
              <Search className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Library
              <span className="ml-2 text-lg font-light text-gray-400">· {posts.length} posts</span>
            </h1>
          </div>
          <p className="mt-1 ml-11 text-sm text-gray-400">All your LinkedIn content in one place</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts, excerpts, asset names, notes…"
            className="w-full rounded-xl border-2 border-blue-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${hasFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'}`}>
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && <button onClick={e => { e.stopPropagation(); clearFilters(); }} className="ml-1"><X className="h-3 w-3" /></button>}
        </button>
        <button onClick={handleExport} className="flex items-center gap-1.5 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
          <Download className="h-4 w-4" /> Export
        </button>
        <label className={`flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 ${importing ? 'opacity-50' : ''}`}>
          <Upload className="h-4 w-4" /> {importing ? 'Importing…' : 'Import'}
          <input type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={importing} />
        </label>
        <button onClick={() => { setSelectedPost(null); setShowModal(true); }} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <select value={filterStatus}  onChange={e => setFilterStatus(e.target.value)}  className={selectClass}>
            <option value="">All Statuses</option>
            {POST_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={filterBrand}   onChange={e => setFilterBrand(e.target.value)}   className={selectClass}>
            <option value="">All Brands</option>
            {BRAND_CONTEXTS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterFormat}  onChange={e => setFilterFormat(e.target.value)}  className={selectClass}>
            <option value="">All Formats</option>
            {POST_FORMATS.map(f => <option key={f} value={f}>{FORMAT_ICONS[f]} {f}</option>)}
          </select>
          <select value={filterDay}     onChange={e => setFilterDay(e.target.value)}     className={selectClass}>
            <option value="">Any Day</option>
            {POSTING_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className={selectClass} title="From date" />
          <input type="date" value={filterDateTo}   onChange={e => setFilterDateTo(e.target.value)}   className={selectClass} title="To date" />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
              {['Posting Date','Day','Internal Title / Hook','Excerpt','Brand','Format','Asset','Status','LinkedIn','Insp.'].map(h => (
                <th key={h} className="whitespace-nowrap px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-white/90">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                {search || hasFilters ? 'No posts match your filters.' : 'No posts yet. Click New Post to begin.'}
              </td></tr>
            ) : filtered.map(post => (
              <tr key={post.id} className="border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50/40" onClick={() => openEdit(post)}>
                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{post.posting_date || '—'}</td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{post.posting_day?.slice(0, 3) || '—'}</td>
                <td className="px-3 py-2.5 max-w-[160px]">
                  <span className="block truncate font-medium text-blue-700">{post.internal_title || '—'}</span>
                </td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <span className="block truncate text-gray-600 text-xs">{post.excerpt || autoExcerpt(post.full_post_content) || '—'}</span>
                </td>
                <td className="px-3 py-2.5">
                  {post.brand_context && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${BRAND_COLORS[post.brand_context]}`}>{post.brand_context}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                  {post.asset_format ? <>{FORMAT_ICONS[post.asset_format]} {post.asset_format}</> : '—'}
                </td>
                <td className="px-3 py-2.5 max-w-[120px]">
                  <span className="block truncate text-xs italic text-gray-400">{post.asset_name || '—'}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${STATUS_COLORS[post.status]}`}>{STATUS_LABELS[post.status]}</span>
                </td>
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                  {post.linkedin_url && (
                    <a href={post.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </td>
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                  {post.inspiration_post_url && (
                    <a href={post.inspiration_post_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-600">
                      <Link2 className="h-3.5 w-3.5" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400">{filtered.length} of {posts.length} posts</p>

      {showModal && (
        <PostModal
          post={selectedPost}
          onSave={handleSave}
          onDelete={selectedPost ? handleDelete : undefined}
          onClose={() => { setShowModal(false); setSelectedPost(null); }}
        />
      )}
    </>
  );
}
