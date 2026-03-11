'use client';
import { useState, useCallback } from 'react';
import { useRadarStore } from '@/lib/store';
import { timeAgo, typeLabel, typeDotColor, sourceShortName, toggleBookmark, isBookmarked } from '@/lib/utils';
import type { NewsItem } from '@/types';

interface NewsCardProps {
  item: NewsItem;
  compact?: boolean;
  featured?: boolean;
  index?: number;
}

export function NewsCard({ item, compact = false, featured = false, index = 0 }: NewsCardProps) {
  const theme = useRadarStore(s => s.theme);
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(item.id));

  const dotColor = typeDotColor(item.type);
  const ts = item.timestamp || item.fetchedAt;

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setBookmarked(toggleBookmark(item));
  }, [item]);

  if (featured) {
    return (
      <a
        href={item.url} target="_blank" rel="noopener noreferrer"
        className="news-card news-card--featured animate-fade-in-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="news-card__meta">
          <span className="news-card__dot" style={{ background: dotColor }} />
          <span className="news-card__type">{typeLabel(item.type)}</span>
          {item.priority === 'HIGH' && <span className="news-card__breaking">Breaking</span>}
        </div>
        <h2 className="news-card__title">{item.title}</h2>
        {item.summary && <p className="news-card__summary">{item.summary}</p>}
        <div className="news-card__footer">
          <span className="news-card__source">{sourceShortName(item.source)}</span>
          {ts && <><span className="news-card__sep">·</span><span className="news-card__time">{timeAgo(ts)}</span></>}
          {item.score != null && <><span className="news-card__sep">·</span><span className="news-card__score">Score {item.score.toFixed(1)}</span></>}
          <button onClick={handleBookmark} className={`news-card__bookmark${bookmarked ? ' news-card__bookmark--saved' : ''}`}>
            {bookmarked ? '★' : '☆'}
          </button>
        </div>
      </a>
    );
  }

  if (compact) {
    return (
      <a
        href={item.url} target="_blank" rel="noopener noreferrer"
        className="news-card news-card--compact animate-fade-in-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <span className="news-card__dot news-card__dot--compact" style={{ background: dotColor }} />
        <div className="news-card__content">
          <div className="news-card__title">{item.title}</div>
          <div className="news-card__footer">
            <span className="news-card__source">{sourceShortName(item.source)}</span>
            {ts && <><span className="news-card__sep">·</span><span className="news-card__time">{timeAgo(ts)}</span></>}
          </div>
        </div>
      </a>
    );
  }

  // Standard card
  return (
    <a
      href={item.url} target="_blank" rel="noopener noreferrer"
      className="news-card animate-fade-in-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="news-card__body">
        <div className="news-card__content">
          <div className="news-card__meta">
            <span className="news-card__dot" style={{ background: dotColor }} />
            <span className="news-card__type">{typeLabel(item.type)}</span>
            {item.priority === 'HIGH' && <span className="news-card__breaking">Breaking</span>}
          </div>
          <div className="news-card__title">{item.title}</div>
          {item.summary && (
            <p className="news-card__summary news-card__summary--clamp">{item.summary}</p>
          )}
          <div className="news-card__footer">
            <span className="news-card__source">{sourceShortName(item.source)}</span>
            {ts && <><span className="news-card__sep">·</span><span className="news-card__time">{timeAgo(ts)}</span></>}
            {item.score != null && <><span className="news-card__sep">·</span><span className="news-card__score">{item.score.toFixed(1)}</span></>}
            {item.sentiment === 'positive' && <span className="news-card__sentiment news-card__sentiment--pos" title="Positive" />}
            {item.sentiment === 'negative' && <span className="news-card__sentiment news-card__sentiment--neg" title="Negative" />}
            {item.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="news-card__tag">{tag}</span>
            ))}
          </div>
        </div>
        <button onClick={handleBookmark} className={`news-card__bookmark${bookmarked ? ' news-card__bookmark--saved' : ''}`}>
          {bookmarked ? '★' : '☆'}
        </button>
      </div>
    </a>
  );
}

export function NewsCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`news-card-skeleton${compact ? ' news-card-skeleton--compact' : ''}`}>
      {!compact && <div className="skeleton skeleton--type" />}
      <div className="skeleton skeleton--title-1" />
      {!compact && <div className="skeleton skeleton--title-2" />}
      <div className="skeleton skeleton--meta" />
    </div>
  );
}
