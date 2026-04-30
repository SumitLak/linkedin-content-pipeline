'use client';

import { Post, STATUS_COLORS, STATUS_LABELS, BRAND_COLORS, FORMAT_ICONS, autoExcerpt } from '@/types';
import { CalendarDays, ExternalLink } from 'lucide-react';

interface PostCardProps {
  post: Post;
  isDragging?: boolean;
  onClick?: (post: Post) => void;
}

export default function PostCard({ post, isDragging, onClick }: PostCardProps) {
  const excerpt = post.excerpt || autoExcerpt(post.full_post_content);
  const profileInitials = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <div
      onClick={() => onClick?.(post)}
      className={`cursor-pointer rounded-xl border border-white/80 bg-white p-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 select-none ${
        isDragging ? 'rotate-1 shadow-lg ring-2 ring-blue-400 scale-105' : ''
      }`}
    >
      {/* Top row: badges + profile avatar */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {post.brand_context && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BRAND_COLORS[post.brand_context]}`}>
              {post.brand_context}
            </span>
          )}
          {post.asset_format && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {FORMAT_ICONS[post.asset_format]} {post.asset_format}
            </span>
          )}
        </div>
        <div className="shrink-0">
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-gray-200" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[9px] font-bold text-white ring-1 ring-white">
              {profileInitials}
            </span>
          )}
        </div>
      </div>

      {/* Excerpt */}
      {excerpt ? (
        <p className="mb-2 text-[13px] leading-snug text-gray-800 line-clamp-2">{excerpt}</p>
      ) : (
        <p className="mb-2 text-[13px] italic text-gray-400">No content yet</p>
      )}

      {/* Asset name */}
      {post.asset_name && (
        <p className="mb-2 text-[11px] text-gray-400 italic truncate">
          🎬 {post.asset_name}
        </p>
      )}

      {/* Internal title */}
      {post.internal_title && (
        <p className="mb-2 text-[11px] font-medium text-gray-500 truncate">{post.internal_title}</p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          {(post.posting_day || post.posting_date) && (
            <>
              <CalendarDays className="h-3 w-3" />
              <span>
                {post.posting_day && <span className="font-medium">{post.posting_day.slice(0, 3)}</span>}
                {post.posting_day && post.posting_date && ' · '}
                {post.posting_date}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {post.linkedin_url && <ExternalLink className="h-3 w-3 text-blue-400" />}
          {post.analytics && post.analytics.length > 0 && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
              {post.analytics.length} 📊
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
