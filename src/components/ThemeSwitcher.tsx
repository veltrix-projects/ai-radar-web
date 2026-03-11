'use client';
import { useRadarStore } from '@/lib/store';
import { THEMES, type Theme } from '@/types';

export function ThemeSwitcher() {
  const { theme, setTheme } = useRadarStore();
  return (
    <div className="theme-switcher">
      {THEMES.map(t => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as Theme)}
            title={t.description}
            className={`theme-btn${active ? ' theme-btn--active' : ''}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
