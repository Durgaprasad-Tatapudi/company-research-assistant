import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Case File — AI Company Research Assistant',
  description: 'AI-powered company research: crawl websites, analyze competitors, generate dossier PDFs. Powered by OpenRouter & Serper.dev.',
  keywords: ['company research', 'AI', 'competitor analysis', 'dossier', 'PDF export'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-body bg-slate-50 text-slate-900 min-h-[100dvh] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
