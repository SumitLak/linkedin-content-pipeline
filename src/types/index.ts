export type BrandContext = 'UKAT' | 'SEO' | 'AI' | 'Leadership' | 'Kindness' | 'Marketing' | 'Personal Growth' | 'Other';

export type PostFormat = 'text' | 'image' | 'video' | 'carousel' | 'poll' | 'document' | 'repost';

export type PostStatus = 'ideation' | 'scheduled' | 'live' | 'analytics_added' | 'archived';

export type PostingDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  profile_id: string;
  full_post_content: string | null;
  excerpt: string | null;
  inspiration_post_url: string | null;
  inspiration_notes: string | null;
  posting_day: PostingDay | null;
  posting_date: string | null;
  internal_title: string | null;
  asset_format: PostFormat | null;
  asset_name: string | null;
  brand_context: BrandContext | null;
  status: PostStatus;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  analytics?: Analytics[];
}

export interface Analytics {
  id: string;
  post_id: string;
  analytics_date: string;
  impressions: number;
  members_reached: number;
  reactions: number;
  comments: number;
  reposts: number;
  saves: number;
  sends: number;
  shares: number;
  total_engagements: number;
  engagement_rate: number;
  notes: string | null;
  created_at: string;
}

export const BRAND_CONTEXTS: BrandContext[] = ['UKAT', 'SEO', 'AI', 'Leadership', 'Kindness', 'Marketing', 'Personal Growth', 'Other'];
export const POST_FORMATS: PostFormat[] = ['text', 'image', 'video', 'carousel', 'poll', 'document', 'repost'];
export const POST_STATUSES: PostStatus[] = ['ideation', 'scheduled', 'live', 'analytics_added', 'archived'];
export const POSTING_DAYS: PostingDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const STATUS_LABELS: Record<PostStatus, string> = {
  ideation: 'Ideation',
  scheduled: 'Scheduled',
  live: 'Live',
  analytics_added: 'Analytics Added',
  archived: 'Archived',
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  ideation:        'bg-violet-100 text-violet-700',
  scheduled:       'bg-amber-100  text-amber-700',
  live:            'bg-emerald-100 text-emerald-700',
  analytics_added: 'bg-blue-100   text-blue-700',
  archived:        'bg-gray-100   text-gray-500',
};

export const BOARD_COLUMNS: { status: PostStatus; label: string; colBg: string; headerBg: string; accentBar: string; emptyText: string }[] = [
  { status: 'ideation',        label: 'Ideation',        colBg: 'bg-violet-50/60',  headerBg: 'bg-violet-100 text-violet-800',  accentBar: 'bg-violet-400',  emptyText: 'Drop your ideas here' },
  { status: 'scheduled',       label: 'Scheduled',       colBg: 'bg-amber-50/60',   headerBg: 'bg-amber-100  text-amber-800',   accentBar: 'bg-amber-400',   emptyText: 'Posts ready to go live' },
  { status: 'live',            label: '🟢 Live',          colBg: 'bg-emerald-50/60', headerBg: 'bg-emerald-100 text-emerald-800', accentBar: 'bg-emerald-400', emptyText: 'Posts published on LinkedIn' },
  { status: 'analytics_added', label: 'Analytics Added', colBg: 'bg-blue-50/60',    headerBg: 'bg-blue-100   text-blue-800',    accentBar: 'bg-blue-400',    emptyText: 'Analytics tracked ✓' },
  { status: 'archived',        label: 'Archived',        colBg: 'bg-gray-50',        headerBg: 'bg-gray-100   text-gray-600',    accentBar: 'bg-gray-300',    emptyText: 'Archived posts' },
];

export const BRAND_COLORS: Record<BrandContext, string> = {
  UKAT:             'bg-blue-100   text-blue-700',
  SEO:              'bg-orange-100 text-orange-700',
  AI:               'bg-violet-100 text-violet-700',
  Leadership:       'bg-indigo-100 text-indigo-700',
  Kindness:         'bg-pink-100   text-pink-700',
  Marketing:        'bg-teal-100   text-teal-700',
  'Personal Growth':'bg-yellow-100 text-yellow-700',
  Other:            'bg-gray-100   text-gray-600',
};

export const FORMAT_ICONS: Record<PostFormat, string> = {
  text:      '📝',
  image:     '🖼️',
  video:     '🎬',
  carousel:  '🎠',
  poll:      '📊',
  document:  '📄',
  repost:    '🔁',
};

export function autoExcerpt(text: string | null): string {
  if (!text) return '';
  return text.replace(/\n/g, ' ').trim().slice(0, 120);
}

export function autoPostingDay(dateStr: string | null): PostingDay | null {
  if (!dateStr) return null;
  const days: PostingDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(dateStr + 'T00:00:00').getDay()];
}
