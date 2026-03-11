import { z } from 'zod';
import {
  NewsItemSchema, TrendingItemSchema, MetadataSchema,
  type NewsItem, type TrendingItem, type Metadata
} from '@/types';

const BACKEND = 'https://veltrix-projects.github.io/ai-radar-backend';
const CACHE_TTL = 5 * 60 * 1000;

// ── Memory cache ──────────────────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; ts: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const url = `${BACKEND}/${path}`;
  const cached = getCached<T>(url);
  if (cached) return cached;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  const raw = await res.json();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.warn('Schema validation warning:', parsed.error.issues.slice(0, 3));
    // Return raw data even if validation has minor issues
    setCache(url, raw);
    return raw as T;
  }
  setCache(url, parsed.data);
  return parsed.data;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getLatestNews(): Promise<NewsItem[]> {
  const data = await apiFetch('latest.json', z.object({ items: z.array(NewsItemSchema) }));
  return data.items || [];
}

export async function getBreakingNews(): Promise<NewsItem[]> {
  const data = await apiFetch('breaking.json', z.object({ items: z.array(NewsItemSchema) }));
  return data.items || [];
}

export async function getTrending(): Promise<TrendingItem[]> {
  const data = await apiFetch('trending.json', z.object({ trending: z.array(TrendingItemSchema) }));
  return data.trending || [];
}

export async function getMetadata(): Promise<Metadata> {
  return apiFetch('metadata.json', MetadataSchema);
}

export async function getAvailableDates(): Promise<string[]> {
  const data = await apiFetch('index.json', z.array(z.string()));
  return Array.isArray(data) ? data : [];
}

export async function getNewsByDate(dateKey: string): Promise<NewsItem[]> {
  const [dd, mm, yyyy] = dateKey.split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month = monthNames[parseInt(mm, 10) - 1];
  const data = await apiFetch(`${yyyy}/${month}/${dateKey}.json`, z.object({ items: z.array(NewsItemSchema) }));
  return data.items || [];
}

export async function testConnection(): Promise<{ ok: boolean; lastUpdated?: string; count?: number; error?: string }> {
  try {
    const meta = await getMetadata();
    return { ok: true, lastUpdated: meta.lastUpdated, count: meta.todayCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
