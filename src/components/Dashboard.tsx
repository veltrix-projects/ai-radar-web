'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useRadarStore } from '@/lib/store';
import { getLatestNews, getBreakingNews, getTrending, getMetadata } from '@/lib/api';
import { computeCounts, deduplicateNews, timeAgo } from '@/lib/utils';
import { Header } from './Header';
import { NewsCard, NewsCardSkeleton } from './NewsCard';
import { CommandPalette } from './CommandPalette';
import { BookmarksPanel } from './BookmarksPanel';
import { toast } from 'sonner';
import type { FeedTab, NewsItem, TrendingItem, Metadata } from '@/types';

const REFRESH_MS = 5 * 60_000;

export function Dashboard() {
  const {
    theme, items, breaking, trending, metadata, loading, error, lastUpdated,
    setItems, setBreaking, setTrending, setMetadata,
    setLoading, setError, setLastUpdated, setRefreshing, refreshing,
    feedTab, feedQuery, setFeedTab, setFeedQuery,
  } = useRadarStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef<number>(0);

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null);
      const [news, brk, trnd, meta] = await Promise.all([
        getLatestNews(), getBreakingNews(), getTrending(), getMetadata(),
      ]);
      const deduped = deduplicateNews(news);
      if (prevCountRef.current > 0 && deduped.length > prevCountRef.current) {
        const diff = deduped.length - prevCountRef.current;
        toast.success(`${diff} new item${diff > 1 ? 's' : ''} added`);
      }
      prevCountRef.current = deduped.length;
      setItems(deduped); setBreaking(brk); setTrending(trnd); setMetadata(meta);
      setLastUpdated(Date.now()); setLoading(false);
    } catch {
      setError('Could not load feed. Please check your connection.');
      setLoading(false);
    }
  }, [setError, setItems, setBreaking, setTrending, setMetadata, setLastUpdated, setLoading]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), REFRESH_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success('Feed updated');
  }, [load, setRefreshing]);

  const counts = computeCounts(items);
  const filtered = items.filter(i => {
    if (feedTab !== 'all' && i.type !== feedTab) return false;
    if (feedQuery) {
      const q = feedQuery.toLowerCase();
      return i.title?.toLowerCase().includes(q) || i.source?.toLowerCase().includes(q) || i.tags?.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const topModels   = items.filter(i => i.type === 'model').slice(0, 5);
  const topResearch = items.filter(i => i.type === 'research').slice(0, 5);
  const topTools    = items.filter(i => i.type === 'tool').slice(0, 5);

  return (
    <div className="dashboard">
      <Header onRefresh={handleRefresh} />
      <CommandPalette />
      <BookmarksPanel />

      {error && <div className="error-banner">⚠ {error}</div>}

      {/* Breaking news ticker */}
      {!loading && breaking.length > 0 && (
        <div className="breaking-bar">
          <span className="breaking-bar__label">Breaking</span>
          <div className="breaking-bar__scroll">
            <div className="ticker-track">
              {[...breaking, ...breaking].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="ticker-item">
                  {item.title?.slice(0, 100)}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="page-main">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <StatsRow counts={counts} metadata={metadata} />
            <div className="section-divider" />
            <div className="main-grid">
              <div className="col-section col-first">
                <SectionLabel>Models</SectionLabel>
                {topModels.length > 0 && <NewsCard item={topModels[0]} featured />}
                {topModels.slice(1).map((item, i) => <NewsCard key={item.id} item={item} compact index={i} />)}
                {!topModels.length && <EmptySection label="No model updates yet" />}
              </div>
              <div className="col-section col-mid">
                <SectionLabel>Research</SectionLabel>
                {topResearch.map((item, i) => (
                  <NewsCard key={item.id} item={item} featured={i === 0} compact={i > 0} index={i} />
                ))}
                {!topResearch.length && <EmptySection label="No research updates yet" />}
              </div>
              <div className="col-section col-mid">
                <SectionLabel>Tools</SectionLabel>
                {topTools.map((item, i) => (
                  <NewsCard key={item.id} item={item} featured={i === 0} compact={i > 0} index={i} />
                ))}
                {!topTools.length && <EmptySection label="No tool updates yet" />}
              </div>
              <div className="sidebar">
                <TrendingSidebar trending={trending} metadata={metadata} lastUpdated={lastUpdated} />
              </div>
            </div>
            <FullFeed
              items={filtered} total={items.length}
              tab={feedTab} onTab={setFeedTab}
              query={feedQuery} onQuery={setFeedQuery}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ── Stats Row ──────────────────────────────────────────────────────────────────
function StatsRow({ counts, metadata }: { counts: any; metadata: Metadata | null }) {
  const stats = [
    { label: 'Total today', value: metadata?.todayCount ?? counts.total,  danger: false },
    { label: 'Models',      value: counts.model,                           danger: false },
    { label: 'Research',    value: counts.research,                        danger: false },
    { label: 'Tools',       value: counts.tool,                            danger: false },
    { label: 'Breaking',    value: metadata?.highCount ?? counts.high,     danger: true  },
    { label: 'Sources',     value: metadata?.sourceCount ?? 16,            danger: false },
  ];
  return (
    <div className="stats-row">
      {stats.map((s, i) => (
        <div key={s.label} className={`stats-cell${i < 5 ? ' stats-cell--bordered' : ''}`}>
          <div className={`stats-cell__value${s.danger ? ' stats-cell__value--danger' : ''}`}>{s.value}</div>
          <div className="stats-cell__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Section Label ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-label__text">{children}</span>
    </div>
  );
}

// ── Trending Sidebar ───────────────────────────────────────────────────────────
function TrendingSidebar({ trending, metadata, lastUpdated }: { trending: TrendingItem[]; metadata: Metadata | null; lastUpdated: number | null }) {
  return (
    <div className="trending-sidebar">
      <div className="sidebar-section-head"><span className="sidebar-section-head__text">Status</span></div>
      <div className="sidebar-status">
        {[
          { label: 'Last updated',    value: lastUpdated ? timeAgo(lastUpdated) : '—' },
          { label: "Today's items",   value: metadata?.todayCount ?? '—' },
          { label: 'Active sources',  value: metadata?.sourceCount ?? 16 },
          { label: 'Breaking',        value: metadata?.highCount ?? '—' },
        ].map(s => (
          <div key={s.label} className="sidebar-row">
            <span className="sidebar-row__key">{s.label}</span>
            <span className="sidebar-row__val">{s.value}</span>
          </div>
        ))}
      </div>
      {trending.length > 0 && (
        <>
          <div className="sidebar-section-head"><span className="sidebar-section-head__text">Trending</span></div>
          <div className="trending-list">
            {trending.slice(0, 10).map((t, i) => (
              <div key={t.tag} className="trending-item">
                <div className="trending-item__left">
                  <span className="trending-item__rank">{i + 1}</span>
                  <span className="trending-item__tag">{t.tag}</span>
                </div>
                <span className="trending-item__count">{t.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Full Feed ──────────────────────────────────────────────────────────────────
function FullFeed({ items, total, tab, onTab, query, onQuery }: any) {
  const tabs: { id: FeedTab; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'model', label: 'Models' },
    { id: 'research', label: 'Research' }, { id: 'tool', label: 'Tools' }, { id: 'news', label: 'News' },
  ];
  return (
    <div className="full-feed">
      <div className="feed-top-border" />
      <div className="feed-filter-bar">
        <div className="feed-filter-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={`feed-tab${tab === t.id ? ' feed-tab--active' : ''}`}
            >{t.label}</button>
          ))}
        </div>
        <div className="feed-filter-search">
          <div className="feed-search-wrap">
            <svg className="feed-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="feed-search-input"
              value={query}
              onChange={e => onQuery(e.target.value)}
              placeholder="Filter articles…"
            />
          </div>
        </div>
      </div>
      <div className="feed-grid">
        {!items.length ? (
          <div className="feed-empty">{query ? 'No articles match your search' : 'No articles yet'}</div>
        ) : (
          items.map((item: NewsItem, i: number) => (
            <div key={item.id} className={`feed-item feed-item-${i % 3}`}>
              <NewsCard item={item} index={i} />
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="feed-count">Showing {items.length} of {total} articles</div>
      )}
    </div>
  );
}

// ── Misc ───────────────────────────────────────────────────────────────────────
function EmptySection({ label }: { label: string }) {
  return <div className="empty-section">{label}</div>;
}

function LoadingSkeleton() {
  return (
    <div className="skeleton-root">
      <div className="skeleton-stats">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`skeleton-stat${i < 5 ? ' skeleton-stat--bordered' : ''}`}>
            <div className="skeleton skeleton--stat-val" />
            <div className="skeleton skeleton--stat-lbl" />
          </div>
        ))}
      </div>
      <div className="skeleton-grid">
        {[0, 1, 2].map(col => (
          <div key={col} className={`skeleton-col${col < 2 ? ' skeleton-col--bordered' : ''}`}>
            <div className="skeleton skeleton--section-lbl" />
            {[...Array(4)].map((_, i) => <NewsCardSkeleton key={i} compact={i > 0} />)}
          </div>
        ))}
        <div className="skeleton-sidebar-col">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-sidebar-item">
              <div className="skeleton skeleton--sidebar-line1" />
              <div className="skeleton skeleton--sidebar-line2" />
            </div>
          ))}
        </div>
      </div>
      <div className="skeleton-loader">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span className="skeleton-loader__text">Loading from 16 sources…</span>
      </div>
    </div>
  );
}
