'use client';
import { useEffect } from 'react';
import { useRadarStore } from '@/lib/store';
import type { Theme } from '@/types';

export function ThemeInitializer() {
  const setTheme = useRadarStore(s => s.setTheme);
  useEffect(() => {
    const saved = localStorage.getItem('ai-radar-theme') as Theme | null;
    const valid: Theme[] = ['herald', 'terminal', 'dispatch'];
    if (saved && valid.includes(saved)) {
      document.documentElement.setAttribute('data-theme', saved);
      setTheme(saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'herald');
    }
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useRadarStore.getState().setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTheme]);
  return null;
}
