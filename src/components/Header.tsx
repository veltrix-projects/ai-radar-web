'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRadarStore } from '@/lib/store';
import { RadarLogo } from './RadarLogo';
import { ThemeSwitcher } from './ThemeSwitcher';
import { timeAgo } from '@/lib/utils';

interface HeaderProps {
  onRefresh: () => void;
  showArchiveLink?: boolean;
}

export function Header({ onRefresh, showArchiveLink = true }: HeaderProps) {
  const { refreshing, lastUpdated, setCmdOpen, setBookmarksOpen } = useRadarStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close menu on route/resize
  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__herald-bar" />

      {/* ── Desktop ───────────────────────────────────────────────── */}
      <div className="header-desktop">
        <div className="header-logo-group">
          <RadarLogo size={28} />
          <div className="header-logo-text">
            <div className="header-logo-name">AI Radar</div>
            <div className="header-subtitle">26 sources · live</div>
          </div>
          <LiveBadge />
        </div>

        <div className="theme-switcher-wrap">
          <ThemeSwitcher />
        </div>

        <div className="header-actions">
          {lastUpdated && (
            <span className="header-last-updated">{timeAgo(lastUpdated)}</span>
          )}
          <ActionBtn onClick={() => setCmdOpen(true)} icon={<SearchIcon />}>Search</ActionBtn>
          <ActionBtn onClick={() => setBookmarksOpen(true)} icon={<BookmarkIcon />}>Saved</ActionBtn>
          <ActionBtn onClick={onRefresh} disabled={refreshing} primary icon={<RefreshIcon spinning={refreshing} />}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </ActionBtn>
          {showArchiveLink && (
            <Link href="/archive" style={{ textDecoration: 'none' }}>
              <ActionBtn icon={<ArchiveIcon />}>Archive</ActionBtn>
            </Link>
          )}
        </div>
      </div>

      {/* ── Mobile ────────────────────────────────────────────────── */}
      <div className="header-mobile">
        <div className="header-mobile__logo">
          <RadarLogo size={24} />
          <span className="header-mobile__name">AI Radar</span>
          <LiveBadge />
        </div>

        <div className="header-mobile__right" ref={menuRef}>
          <button
            className="mobile-refresh-btn"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RefreshIcon spinning={refreshing} />
          </button>

          <button
            className={`hamburger-btn${menuOpen ? ' hamburger-btn--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>

          {menuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu__theme">
                <div className="mobile-menu__theme-label">Theme</div>
                <ThemeSwitcher />
              </div>
              <div className="mobile-menu__items">
                <button className="menu-item" onClick={() => { setCmdOpen(true); setMenuOpen(false); }}>
                  <SearchIcon /> Search
                </button>
                <button className="menu-item" onClick={() => { setBookmarksOpen(true); setMenuOpen(false); }}>
                  <BookmarkIcon /> Saved
                </button>
                {showArchiveLink && (
                  <Link href="/archive" style={{ textDecoration: 'none', display: 'block' }} onClick={() => setMenuOpen(false)}>
                    <button className="menu-item"><ArchiveIcon /> Archive</button>
                  </Link>
                )}
              </div>
              {lastUpdated && (
                <div className="mobile-menu__updated">Updated {timeAgo(lastUpdated)}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function LiveBadge() {
  return (
    <div className="live-badge">
      <span className="live-badge__dot animate-pulse" />
      <span className="live-badge__text">Live</span>
    </div>
  );
}

function ActionBtn({ onClick, disabled, primary, icon, children }: {
  onClick?: () => void; disabled?: boolean; primary?: boolean;
  icon?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`action-btn${primary ? ' action-btn--primary' : ''}`}
    >
      {icon}{children}
    </button>
  );
}

function MenuItem({ icon, onClick, children }: { icon?: React.ReactNode; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button className="menu-item" onClick={onClick}>
      {icon}{children}
    </button>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function BookmarkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>;
}
function ArchiveIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>;
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={spinning ? 'animate-spin' : ''}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
}
