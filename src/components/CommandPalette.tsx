'use client';
import { useState, useEffect, useRef } from 'react';
import { useRadarStore } from '@/lib/store';
import { typeLabel, sourceShortName } from '@/lib/utils';
import type { NewsItem } from '@/types';

export function CommandPalette() {
  const { cmdOpen, setCmdOpen, items } = useRadarStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cmdOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [cmdOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setCmdOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCmdOpen]);

  if (!cmdOpen) return null;

  const results: NewsItem[] = query.trim()
    ? items.filter(i => {
        const q = query.toLowerCase();
        return i.title?.toLowerCase().includes(q) || i.source?.toLowerCase().includes(q) || i.tags?.some(t => t.toLowerCase().includes(q));
      }).slice(0, 10)
    : items.slice(0, 8);

  return (
    <div className="cmd-overlay" onClick={() => setCmdOpen(false)}>
      <div className="cmd-palette animate-fade-in-up" onClick={e => e.stopPropagation()}>

        <div className="cmd-palette__search">
          <svg className="cmd-palette__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="cmd-palette__input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, sources, topics…"
          />
          <kbd className="cmd-palette__esc">esc</kbd>
        </div>

        {!query && <div className="cmd-section-label">Recent</div>}

        <div className="cmd-results">
          {results.length === 0 && <div className="cmd-empty">No results found</div>}
          {results.map(item => (
            <a
              key={item.id}
              href={item.url} target="_blank" rel="noopener noreferrer"
              className="cmd-result"
              onClick={() => setCmdOpen(false)}
            >
              <span className="cmd-result__type">{typeLabel(item.type)}</span>
              <span className="cmd-result__title">{item.title}</span>
              <span className="cmd-result__source">{sourceShortName(item.source)}</span>
            </a>
          ))}
        </div>

        <div className="cmd-palette__footer">
          <span className="cmd-hint">↑↓ navigate</span>
          <span className="cmd-hint">↵ open</span>
          <span className="cmd-hint">esc close</span>
          <span className="cmd-hint cmd-hint--right">⌘K</span>
        </div>
      </div>
    </div>
  );
}
