import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeInitializer } from '@/components/ThemeInitializer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'AI Radar — Real-time AI Intelligence',
  description: 'Live feed of AI models, research papers, tools, and breaking news from 26+ sources.',
  keywords: ['AI news', 'machine learning', 'AI tools', 'research papers', 'LLM'],
  openGraph: { title: 'AI Radar', description: 'Real-time AI intelligence dashboard', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FFFFFF' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="herald" suppressHydrationWarning>
      <body>
        <ThemeInitializer />
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: 'var(--surface)', border: '1px solid var(--border2)',
            color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: '13px',
          },
        }} />
      </body>
    </html>
  );
}
