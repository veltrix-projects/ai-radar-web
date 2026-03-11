'use client';
import { create } from 'zustand';
import type { Theme, NewsItem, TrendingItem, Metadata, FeedTab } from '@/types';

interface RadarStore {
  theme: Theme;
  setTheme: (t: Theme) => void;
  items: NewsItem[];
  breaking: NewsItem[];
  trending: TrendingItem[];
  metadata: Metadata | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refreshing: boolean;
  setItems: (items: NewsItem[]) => void;
  setBreaking: (items: NewsItem[]) => void;
  setTrending: (items: TrendingItem[]) => void;
  setMetadata: (m: Metadata) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setLastUpdated: (ts: number) => void;
  setRefreshing: (v: boolean) => void;
  feedTab: FeedTab;
  feedQuery: string;
  setFeedTab: (t: FeedTab) => void;
  setFeedQuery: (q: string) => void;
  cmdOpen: boolean;
  setCmdOpen: (v: boolean) => void;
  bookmarksOpen: boolean;
  setBookmarksOpen: (v: boolean) => void;
}

export const useRadarStore = create<RadarStore>((set) => ({
  theme: 'herald',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-radar-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  items: [], breaking: [], trending: [], metadata: null,
  loading: true, error: null, lastUpdated: null, refreshing: false,
  setItems: (items) => set({ items }),
  setBreaking: (breaking) => set({ breaking }),
  setTrending: (trending) => set({ trending }),
  setMetadata: (metadata) => set({ metadata }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setRefreshing: (refreshing) => set({ refreshing }),
  feedTab: 'all', feedQuery: '',
  setFeedTab: (feedTab) => set({ feedTab }),
  setFeedQuery: (feedQuery) => set({ feedQuery }),
  cmdOpen: false,
  setCmdOpen: (cmdOpen) => set({ cmdOpen }),
  bookmarksOpen: false,
  setBookmarksOpen: (bookmarksOpen) => set({ bookmarksOpen }),
}));
