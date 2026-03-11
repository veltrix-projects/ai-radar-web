'use client';
import { useEffect, useState } from 'react';
import { useRadarStore } from '@/lib/store';
import { getBookmarks } from '@/lib/utils';
import { NewsCard } from './NewsCard';
import type { NewsItem } from '@/types';

export function BookmarksPanel() {
  const { bookmarksOpen, setBookmarksOpen } = useRadarStore();
  const [bookmarks, setBookmarks] = useState<NewsItem[]>([]);

  useEffect(() => { if (bookmarksOpen) setBookmarks(getBookmarks()); }, [bookmarksOpen]);
  if (!bookmarksOpen) return null;

  return (
    <div className="bookmarks-overlay" onClick={() => setBookmarksOpen(false)}>
      <div className="bookmarks-panel animate-slide-in" onClick={e => e.stopPropagation()}>

        <div className="bookmarks-panel__header">
          <div className="bookmarks-panel__title-wrap">
            <h2 className="bookmarks-panel__title">Saved Articles</h2>
            <p className="bookmarks-panel__count">{bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'}</p>
          </div>
          <button className="bookmarks-panel__close" onClick={() => setBookmarksOpen(false)}>Close</button>
        </div>

        <div className="bookmarks-panel__body">
          {bookmarks.length === 0 ? (
            <div className="bookmarks-empty">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              <span className="bookmarks-empty__text">No saved articles yet</span>
              <span className="bookmarks-empty__hint">Click ★ on any article to save it</span>
            </div>
          ) : bookmarks.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)}
        </div>

        {bookmarks.length > 0 && (
          <div className="bookmarks-panel__footer">
            <button
              className="bookmarks-clear-btn"
              onClick={() => { localStorage.setItem('ai-radar-bookmarks', '[]'); setBookmarks([]); }}
            >
              Clear all saved articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
