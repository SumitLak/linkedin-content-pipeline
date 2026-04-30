'use client';

import { useMemo } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { Post, STATUS_LABELS, BRAND_COLORS, BrandContext, autoExcerpt } from '@/types';
import { FileText, Calendar, TrendingUp, AlertTriangle, Eye, ThumbsUp, Zap } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import TimeGreeting from './TimeGreeting';
import PageBackgroundUpload from './PageBackgroundUpload';
import DashboardBannerSettings from './DashboardBannerSettings';

function StatCard({ label, value, icon: Icon, gradient, sub }: { label: string; value: string | number; icon: React.ElementType; gradient: string; sub?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{label}</p>
          <p className="mt-1 text-4xl font-black">{value}</p>
          {sub && <p className="mt-1 text-xs text-white/60">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/20 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
  );
}

export default function DashboardView() {
  const { posts, loading } = usePosts();
  const { activeProfile, isAllProfiles } = useProfile();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd   = endOfWeek(now, { weekStartsOn: 1 });

    const total      = posts.length;
    const thisWeek   = posts.filter(p => p.posting_date && p.posting_date >= weekStart.toISOString().split('T')[0] && p.posting_date <= weekEnd.toISOString().split('T')[0]).length;
    const upcoming   = posts.filter(p => p.status === 'scheduled').length;
    const missingAn  = posts.filter(p => p.status === 'live' && (!p.analytics || p.analytics.length === 0)).length;

    const withAnalytics = posts.filter(p => p.analytics && p.analytics.length > 0);

    const bestByImpressions = [...withAnalytics]
      .sort((a, b) => Math.max(...(b.analytics?.map(n => n.impressions) || [0])) - Math.max(...(a.analytics?.map(n => n.impressions) || [0])))
      .slice(0, 5);

    const bestByEngagement = [...withAnalytics]
      .sort((a, b) => Math.max(...(b.analytics?.map(n => Number(n.engagement_rate)) || [0])) - Math.max(...(a.analytics?.map(n => Number(n.engagement_rate)) || [0])))
      .slice(0, 5);

    const formatCounts: Record<string, number> = {};
    posts.forEach(p => { if (p.asset_format) formatCounts[p.asset_format] = (formatCounts[p.asset_format] || 0) + 1; });

    const brandCounts: Record<string, number> = {};
    posts.forEach(p => { if (p.brand_context) brandCounts[p.brand_context] = (brandCounts[p.brand_context] || 0) + 1; });

    const dayCounts: Record<string, number> = {};
    posts.forEach(p => { if (p.posting_day) dayCounts[p.posting_day] = (dayCounts[p.posting_day] || 0) + 1; });

    return { total, thisWeek, upcoming, missingAn, bestByImpressions, bestByEngagement, formatCounts, brandCounts, dayCounts };
  }, [posts]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Pull full-bleed: break out of layout's px-8 and top gap */}
      <div className="-mx-8 mb-8" style={{ marginTop: 'calc(-32px)' }}>
        <TimeGreeting />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Posts"    value={stats.total}     icon={FileText}      gradient="bg-gradient-to-br from-violet-600 to-purple-700" />
          <StatCard label="This Week"      value={stats.thisWeek}  icon={Calendar}      gradient="bg-gradient-to-br from-blue-500 to-cyan-600"     sub="scheduled / live" />
          <StatCard label="Scheduled"      value={stats.upcoming}  icon={TrendingUp}    gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
          <StatCard label="Need Analytics" value={stats.missingAn} icon={AlertTriangle} gradient="bg-gradient-to-br from-rose-500 to-pink-600"    sub="live without data" />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <Eye className="h-4 w-4 text-blue-500" /> Top by Impressions
            </h3>
            {stats.bestByImpressions.length === 0 ? (
              <p className="text-sm text-gray-400">No analytics yet.</p>
            ) : stats.bestByImpressions.map(post => {
              const maxImp = Math.max(...(post.analytics?.map(a => a.impressions) || [0]));
              return (
                <div key={post.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <span className="truncate text-sm text-gray-700 max-w-[220px]">
                    {post.internal_title || autoExcerpt(post.full_post_content) || 'Untitled'}
                  </span>
                  <span className="ml-2 shrink-0 text-sm font-bold text-blue-600">{maxImp.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <ThumbsUp className="h-4 w-4 text-green-500" /> Top by Engagement Rate
            </h3>
            {stats.bestByEngagement.length === 0 ? (
              <p className="text-sm text-gray-400">No analytics yet.</p>
            ) : stats.bestByEngagement.map(post => {
              const maxRate = Math.max(...(post.analytics?.map(a => Number(a.engagement_rate)) || [0]));
              return (
                <div key={post.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <span className="truncate text-sm text-gray-700 max-w-[220px]">
                    {post.internal_title || autoExcerpt(post.full_post_content) || 'Untitled'}
                  </span>
                  <span className="ml-2 shrink-0 text-sm font-bold text-green-600">{maxRate.toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-gray-700">Format Breakdown</h3>
            {Object.keys(stats.formatCounts).length === 0 ? (
              <p className="text-sm text-gray-400">No data.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.formatCounts).sort((a, b) => b[1] - a[1]).map(([fmt, count]) => (
                  <div key={fmt} className="flex items-center gap-2">
                    <span className="w-20 text-xs capitalize text-gray-600">{fmt}</span>
                    <div className="flex-1 rounded-full bg-gray-100 h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(count / stats.total) * 100}%` }} />
                    </div>
                    <span className="w-5 text-right text-xs font-medium text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-gray-700">Brand / Context</h3>
            {Object.keys(stats.brandCounts).length === 0 ? (
              <p className="text-sm text-gray-400">No data.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.brandCounts).sort((a, b) => b[1] - a[1]).map(([brand, count]) => (
                  <span key={brand} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BRAND_COLORS[brand as BrandContext] || 'bg-gray-100 text-gray-600'}`}>
                    {brand} · {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <Zap className="h-4 w-4 text-amber-500" /> Posting Days
            </h3>
            {Object.keys(stats.dayCounts).length === 0 ? (
              <p className="text-sm text-gray-400">No data.</p>
            ) : (
              <div className="space-y-1.5">
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => {
                  const count = stats.dayCounts[d] || 0;
                  if (!count) return null;
                  return (
                    <div key={d} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-gray-600">{d.slice(0, 3)}</span>
                      <div className="flex-1 rounded-full bg-gray-100 h-2">
                        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(count / stats.total) * 100}%` }} />
                      </div>
                      <span className="w-5 text-right text-xs font-medium text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Customisation settings ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardBannerSettings />
          <PageBackgroundUpload />
        </div>
      </div>
    </div>
  );
}
