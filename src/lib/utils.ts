import type { NewsItem, FeedCounts, Theme } from '@/types';

export function timeAgo(ts: string | number | undefined): string {
  if (!ts) return '';
  const date = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  if (hr  < 24)  return `${hr}h ago`;
  if (day <  7)  return `${day}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function truncate(str: string, max = 100): string {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

export function typeLabel(type: string): string {
  return ({ model: 'Model', research: 'Research', tool: 'Tool', news: 'News' } as Record<string, string>)[type] || 'News';
}

export function typeDotColor(type: string): string {
  return ({ model: 'var(--accent2)', research: 'var(--accent)', tool: 'var(--accent3)', news: 'var(--text4)' } as Record<string, string>)[type] || 'var(--text4)';
}

export function priorityBadgeStyle(priority: string | undefined): { bg: string; color: string } {
  if (priority === 'HIGH')   return { bg: 'var(--accent)', color: '#fff' };
  if (priority === 'MEDIUM') return { bg: 'var(--warning)', color: '#fff' };
  return { bg: 'var(--bg3)', color: 'var(--text3)' };
}

export function sourceShortName(source = ''): string {
  const map: Record<string, string> = {
    'Hacker News': 'HN', 'HuggingFace Papers': 'HF Papers', 'HuggingFace Models': 'HF Models',
    'ArXiv': 'ArXiv', 'GitHub': 'GitHub', 'Reddit r/LocalLLaMA': 'r/LocalLLaMA',
    'Reddit r/MachineLearning': 'r/ML', 'Product Hunt': 'PH', 'OpenAI Blog': 'OpenAI',
    'Anthropic Blog': 'Anthropic', 'Google DeepMind': 'DeepMind', 'Meta AI Blog': 'Meta AI',
    'NVIDIA Blog': 'NVIDIA', 'VentureBeat AI': 'VentureBeat', 'TechCrunch AI': 'TechCrunch',
    'Papers With Code': 'PWC',
  };
  return map[source] || source;
}

export function computeCounts(items: NewsItem[]): FeedCounts {
  return {
    total:    items.length,
    model:    items.filter(i => i.type === 'model').length,
    research: items.filter(i => i.type === 'research').length,
    tool:     items.filter(i => i.type === 'tool').length,
    news:     items.filter(i => i.type === 'news').length,
    high:     items.filter(i => i.priority === 'HIGH').length,
  };
}

export function deduplicateNews(items: NewsItem[]): NewsItem[] {
  const seen = new Map<string, NewsItem>();
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    if (!seen.has(key) || (item.score || 0) > (seen.get(key)!.score || 0)) {
      seen.set(key, item);
    }
  }
  return Array.from(seen.values());
}

export function dateKeyToDate(key: string): Date {
  const [dd, mm, yyyy] = key.split('-');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

export function dateToKey(d: Date): string {
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

export function formatDateKey(key: string): string {
  return dateKeyToDate(key).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const BOOKMARKS_KEY = 'ai-radar-bookmarks';
export function getBookmarks(): NewsItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}
export function toggleBookmark(item: NewsItem): boolean {
  const bm = getBookmarks();
  const idx = bm.findIndex(b => b.id === item.id);
  if (idx >= 0) { bm.splice(idx, 1); localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); return false; }
  bm.unshift(item); localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); return true;
}
export function isBookmarked(id: string): boolean {
  return getBookmarks().some(b => b.id === id);
}
