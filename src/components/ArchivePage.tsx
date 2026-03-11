'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRadarStore } from '@/lib/store';
import { getAvailableDates, getNewsByDate } from '@/lib/api';
import { computeCounts, dateToKey, formatDateKey } from '@/lib/utils';
import { NewsCard, NewsCardSkeleton } from '@/components/NewsCard';
import { RadarLogo } from '@/components/RadarLogo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import type { NewsItem, FeedTab } from '@/types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function ArchivePage() {
  const { theme } = useRadarStore();
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FeedTab>('all');
  const [query, setQuery] = useState('');
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  useEffect(() => {
    getAvailableDates().then(d => { setAvailableDates(new Set(d)); setDatesLoading(false); })
      .catch(() => { setError('Could not load archive index.'); setDatesLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true); setItems([]);
    getNewsByDate(selectedDate).then(d => { setItems(d); setLoading(false); })
      .catch(() => { setError('Failed to load this date.'); setLoading(false); });
  }, [selectedDate]);

  const filtered = items.filter(i => {
    if (tab !== 'all' && i.type !== tab) return false;
    if (query) { const q = query.toLowerCase(); return i.title?.toLowerCase().includes(q) || i.source?.toLowerCase().includes(q); }
    return true;
  });
  const counts = computeCounts(items);

  return (
    <div className="archive-page">
      <header className="archive-header">
        {theme === 'herald' && <div className="archive-header__herald-bar" />}
        <div className="archive-header__inner">
          <div className="archive-header__logo">
            <RadarLogo size={26} />
            <span className="archive-header__logo-name">AI Radar</span>
            <span className="archive-header__breadcrumb">/ Archive</span>
          </div>
          <div className="archive-header__actions">
            <div className="archive-theme-switcher"><ThemeSwitcher /></div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="archive-back-btn">← Dashboard</button>
            </Link>
          </div>
        </div>
      </header>

      {error && <div className="archive-error">⚠ {error}</div>}

      <main className="archive-main">
        <div className="archive-calendar-col">
          <CalendarPanel
            availableDates={availableDates} selectedDate={selectedDate}
            onSelectDate={setSelectedDate} loading={datesLoading}
            calYear={calYear} setCalYear={setCalYear}
            calMonth={calMonth} setCalMonth={setCalMonth}
          />
        </div>

        <div className="archive-content">
          {!selectedDate ? (
            <div className="archive-empty">
              <svg className="archive-empty__icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <span className="archive-empty__text">Select a date to browse the archive</span>
            </div>
          ) : loading ? (
            <div className="archive-loading">
              {[...Array(8)].map((_, i) => <NewsCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <div className="archive-date-head">
                <div className="archive-date-title-wrap">
                  <h1 className="archive-date-title">{formatDateKey(selectedDate)}</h1>
                  <p className="archive-date-meta">{counts.total} articles · {counts.high} breaking</p>
                </div>
                <div className="archive-date-stats">
                  {[
                    { l: 'Models',   v: counts.model,    c: 'var(--accent2)' },
                    { l: 'Research', v: counts.research, c: 'var(--accent)'  },
                    { l: 'Tools',    v: counts.tool,     c: 'var(--accent3)' },
                  ].map(s => (
                    <div key={s.l} className="archive-stat-box">
                      <div className="archive-stat-box__value" style={{ color: s.c }}>{s.v}</div>
                      <div className="archive-stat-box__label">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="archive-feed">
                <div className="archive-feed__bar">
                  <div className="archive-feed__tabs">
                    {(['all','model','research','tool','news'] as FeedTab[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`archive-feed__tab${tab === t ? ' archive-feed__tab--active' : ''}`}
                      >
                        {t === 'all' ? 'All' : t === 'model' ? 'Models' : t === 'research' ? 'Research' : t === 'tool' ? 'Tools' : 'News'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text" value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="archive-feed__search"
                  />
                </div>
                <div className="archive-feed__body">
                  {!filtered.length
                    ? <div className="archive-feed__empty">{query ? 'No results found' : 'No articles for this date'}</div>
                    : filtered.map((item, i) => <NewsCard key={item.id} item={item} index={i} />)
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CalendarPanel({ availableDates, selectedDate, onSelectDate, loading, calYear, setCalYear, calMonth, setCalMonth }: any) {
  const today = new Date();
  const todayKey = dateToKey(today);
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMon = new Date(calYear, calMonth + 1, 0).getDate();
  const isCurrent = calYear === today.getFullYear() && calMonth === today.getMonth();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMon }, (_, i) => i + 1)];

  function prevMonth() { if (calMonth === 0) { setCalMonth(11); setCalYear((y: number) => y - 1); } else setCalMonth((m: number) => m - 1); }
  function nextMonth() { if (isCurrent) return; if (calMonth === 11) { setCalMonth(0); setCalYear((y: number) => y + 1); } else setCalMonth((m: number) => m + 1); }

  return (
    <div className="cal-panel">
      <div className="cal-panel__header">
        <span className="cal-panel__title">Archive Calendar</span>
        {loading && <span className="cal-panel__loading">Loading…</span>}
      </div>
      <div className="cal-panel__nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <select className="cal-select cal-select--month" value={calMonth} onChange={e => setCalMonth(Number(e.target.value))}>
          {MONTHS.map((n, i) => <option key={n} value={i}>{n}</option>)}
        </select>
        <select className="cal-select cal-select--year" value={calYear} onChange={e => setCalYear(Number(e.target.value))}>
          {[0, 1, 2].map(i => <option key={i} value={today.getFullYear() - i}>{today.getFullYear() - i}</option>)}
        </select>
        <button className={`cal-nav-btn${isCurrent ? ' cal-nav-btn--disabled' : ''}`} onClick={nextMonth} disabled={isCurrent}>›</button>
      </div>
      <div className="cal-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>
      <div className="cal-days">
        {cells.map((day, idx) => {
          if (!day) return <div key={`b${idx}`} />;
          const dd = String(day).padStart(2, '0'), mm = String(calMonth + 1).padStart(2, '0');
          const key = `${dd}-${mm}-${calYear}`;
          const isFuture = new Date(calYear, calMonth, day) > today;
          const isToday = key === todayKey;
          const hasSaved = availableDates.has(key);
          const isSelected = key === selectedDate;
          const cls = [
            'cal-day',
            isSelected ? 'cal-day--selected' : '',
            isToday && !isSelected ? 'cal-day--today' : '',
            hasSaved && !isSelected ? 'cal-day--saved' : '',
            isFuture ? 'cal-day--future' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={key} className={cls} onClick={() => !isFuture && onSelectDate(key)}>
              {day}
              {!isFuture && hasSaved && !isSelected && <span className="cal-day__dot" />}
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        {[
          { dot: 'var(--accent)',  label: 'Today'    },
          { dot: 'var(--accent3)', label: 'Has data' },
          { dot: 'var(--border2)', label: 'No data'  },
        ].map(({ dot, label }) => (
          <div key={label} className="cal-legend__item">
            <span className="cal-legend__dot" style={{ background: dot }} />
            <span className="cal-legend__label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
