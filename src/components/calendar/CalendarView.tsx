'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { Post, STATUS_COLORS, STATUS_LABELS, BRAND_COLORS, FORMAT_ICONS, autoExcerpt } from '@/types';
import PostModal from '@/components/ui/PostModal';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_BAR: Record<string, string> = {
  ideation:        'bg-violet-400',
  scheduled:       'bg-amber-400',
  live:            'bg-emerald-500',
  analytics_added: 'bg-blue-500',
  archived:        'bg-gray-400',
};

export default function CalendarView() {
  const { posts, loading, updatePost, deletePost } = usePosts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>();
    posts.forEach(post => {
      if (post.posting_date) {
        const existing = map.get(post.posting_date) || [];
        map.set(post.posting_date, [...existing, post]);
      }
    });
    return map;
  }, [posts]);

  const monthStart = startOfMonth(currentMonth);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthEnd   = endOfMonth(currentMonth);
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  async function handleSave(data: Partial<Post>): Promise<Post | null | undefined> {
    if (!selectedPost) return null;
    const result = await updatePost(selectedPost.id, data);
    setSelectedPost(null);
    return result;
  }

  async function handleDelete(id: string) {
    await deletePost(id);
    setSelectedPost(null);
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );

  const totalPosts = posts.filter(p => p.posting_date && p.posting_date.startsWith(format(currentMonth, 'yyyy-MM'))).length;

  return (
    <>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-200">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {format(currentMonth, 'MMMM')}
              <span className="ml-2 text-2xl font-light text-gray-400">{format(currentMonth, 'yyyy')}</span>
            </h1>
          </div>
          <p className="mt-1 ml-11 text-sm text-gray-400">
            {totalPosts} post{totalPosts !== 1 ? 's' : ''} scheduled this month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Today
          </button>
          <div className="flex items-center gap-1 rounded-xl border-2 border-gray-200 bg-white p-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Day-of-week header row */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600 to-indigo-600">
          {DAY_HEADERS.map((label, i) => {
            const isWeekend = i >= 5;
            return (
              <div key={label} className="py-3 text-center">
                <span className={`text-xs font-bold uppercase tracking-widest ${isWeekend ? 'text-blue-200' : 'text-white'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {days.map(day => {
            const key        = format(day, 'yyyy-MM-dd');
            const dayPosts   = postsByDate.get(key) || [];
            const inMonth    = isSameMonth(day, currentMonth);
            const isToday    = isSameDay(day, new Date());
            const dayOfWeek  = day.getDay(); // 0=Sun,6=Sat
            const isWeekend  = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={key}
                className={[
                  'min-h-[120px] p-2 transition-colors',
                  !inMonth    ? 'bg-gray-50/70'    : isWeekend ? 'bg-blue-50/30' : 'bg-white',
                  isToday     ? 'ring-2 ring-inset ring-blue-400' : '',
                ].join(' ')}
              >
                {/* Date number */}
                <div className="mb-2 flex justify-end">
                  <span className={[
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    isToday   ? 'bg-blue-600 text-white shadow-md shadow-blue-300' :
                    !inMonth  ? 'text-gray-300' :
                    isWeekend ? 'text-blue-400' :
                               'text-gray-600 hover:bg-gray-100',
                  ].join(' ')}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Post chips */}
                <div className="space-y-1.5">
                  {dayPosts.slice(0, 3).map(post => {
                    const excerpt = post.excerpt || autoExcerpt(post.full_post_content);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="group w-full overflow-hidden rounded-lg border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        {/* Coloured status bar */}
                        <div className={`h-1 w-full ${STATUS_BAR[post.status] || 'bg-gray-300'}`} />
                        <div className="px-2 py-1.5">
                          <div className="mb-1 flex items-center gap-1 flex-wrap">
                            {post.brand_context && (
                              <span className={`rounded-full px-1.5 text-[9px] font-bold leading-4 ${BRAND_COLORS[post.brand_context]}`}>
                                {post.brand_context}
                              </span>
                            )}
                            {post.asset_format && (
                              <span className="text-[10px]">{FORMAT_ICONS[post.asset_format]}</span>
                            )}
                            <span className={`ml-auto rounded-full px-1.5 text-[9px] font-semibold leading-4 ${STATUS_COLORS[post.status]}`}>
                              {STATUS_LABELS[post.status]}
                            </span>
                          </div>
                          <p className="truncate text-[11px] font-medium text-gray-700 group-hover:text-blue-700 leading-snug">
                            {post.internal_title || excerpt || 'Untitled'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <p className="pl-1 text-[10px] font-semibold text-blue-500">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
