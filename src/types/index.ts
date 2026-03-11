import { z } from 'zod';

export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  source: z.string(),
  sourceIcon: z.string().optional(),
  type: z.enum(['model', 'research', 'tool', 'news']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  score: z.number().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
  fetchedAt: z.union([z.string(), z.number()]).optional(),
});

export const TrendingItemSchema = z.object({
  tag: z.string(),
  count: z.number(),
});

export const MetadataSchema = z.object({
  lastUpdated: z.string(),
  todayCount: z.number().optional(),
  highCount: z.number().optional(),
  sourceCount: z.number().optional(),
  topTrending: z.array(TrendingItemSchema).optional(),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type TrendingItem = z.infer<typeof TrendingItemSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;

export type Theme = 'herald' | 'terminal' | 'dispatch';

export interface ThemeConfig {
  id: Theme;
  label: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  { id: 'herald',   label: 'Herald',   description: 'Editorial · Light' },
  { id: 'terminal', label: 'Terminal', description: 'Dark · Professional' },
  { id: 'dispatch', label: 'Dispatch', description: 'Wire · Neutral' },
];

export type FeedTab = 'all' | 'model' | 'research' | 'tool' | 'news';

export interface FeedCounts {
  total: number;
  model: number;
  research: number;
  tool: number;
  news: number;
  high: number;
}
