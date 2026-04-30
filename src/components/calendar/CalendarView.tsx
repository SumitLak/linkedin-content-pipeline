'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { usePosts } from '@/hooks/usePosts';
import { Post, STATUS_COLORS, STATUS_LABELS, BRAND_COLORS, FORMAT_ICONS, autoExcerpt } from '@/types';
import PostModal from '@/components/ui/PostModal';

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
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }

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

  return (
    <>
      {/* Calendar header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            Today
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayPosts = postsByDate.get(key) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={key}
                className={`min-h-[110px] p-1.5 ${!isCurrentMonth ? 'bg-gray-50/60 opacity-50' : 'bg-white'}`}
              >
                {/* Date number */}
                <div className="mb-1.5 flex justify-end">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-blue-600 text-white' : 'text-gray-500'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Post chips */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map(post => {
                    const excerpt = post.excerpt || autoExcerpt(post.full_post_content);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="w-full rounded-lg bg-white border border-gray-100 shadow-sm px-1.5 py-1 text-left hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        {/* Badges row */}
                        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                          {post.brand_context && (
                            <span className={`rounded-full px-1.5 py-0 text-[9px] font-semibold leading-4 ${BRAND_COLORS[post.brand_context]}`}>
                              {post.brand_context}
                            </span>
                          )}
                          {post.asset_format && (
                            <span className="text-[9px] text-gray-400">{FORMAT_ICONS[post.asset_format]}</span>
                          )}
                          <span className={`ml-auto rounded-full px-1.5 py-0 text-[9px] font-semibold leading-4 ${STATUS_COLORS[post.status]}`}>
                            {STATUS_LABELS[post.status]}
                          </span>
                        </div>
                        {/* Excerpt */}
                        <p className="truncate text-[10px] text-gray-700 group-hover:text-gray-900 leading-snug">
                          {excerpt || post.internal_title || 'Untitled'}
                        </p>
                        {/* Posting day */}
                        {post.posting_day && (
                          <p className="text-[9px] text-gray-400 mt-0.5">{post.posting_day}</p>
                        )}
                      </button>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <p className="text-center text-[10px] text-gray-400">+{dayPosts.length - 3} more</p>
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
