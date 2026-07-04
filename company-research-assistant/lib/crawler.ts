// lib/crawler.ts
// Lightweight, dependency-light crawler tailored to company marketing sites.
// Discovers Home / About / Products / Services / Solutions / Contact / Pricing
// pages, skips duplicates & login pages, and extracts readable text.

import * as cheerio from 'cheerio';
// Custom simple promise concurrency limiter to avoid p-limit module resolution issues
function pLimit(concurrency: number) {
  const queue: Array<() => void> = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()!();
    }
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (activeCount >= concurrency) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    activeCount++;
    try {
      return await fn();
    } finally {
      next();
    }
  };
}
import type { CrawledPage } from './types';

const PAGE_KEYWORDS: Record<CrawledPage['kind'], string[]> = {
  home: [''],
  about: ['about', 'about-us', 'company', 'who-we-are', 'story'],
  products: ['product', 'products', 'platform', 'features'],
  services: ['service', 'services', 'what-we-do'],
  solutions: ['solution', 'solutions', 'use-cases', 'industries'],
  contact: ['contact', 'contact-us', 'get-in-touch', 'support'],
  pricing: ['pricing', 'plans', 'price'],
  other: []
};

const LOGIN_HINTS = ['login', 'signin', 'sign-in', 'log-in', 'account/login', 'wp-admin', 'auth/'];
const IGNORE_EXTENSIONS = /\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip|mp4|mp3|ico|woff2?)$/i;

const MAX_PAGES = 8;
const FETCH_TIMEOUT_MS = 8000;

function classify(path: string): CrawledPage['kind'] {
  const lower = path.toLowerCase();
  for (const kind of Object.keys(PAGE_KEYWORDS) as CrawledPage['kind'][]) {
    if (kind === 'home') continue;
    if (PAGE_KEYWORDS[kind].some((kw) => kw && lower.includes(kw))) return kind;
  }
  return 'other';
}

async function fetchWithTimeout(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CompanyResearchBot/1.0)' }
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractText($: cheerio.CheerioAPI): string {
  $('script, style, noscript, svg, header nav, footer nav').remove();
  const text = $('body').text();
  return text.replace(/\s+/g, ' ').trim().slice(0, 6000);
}

function discoverLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;
  const found = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const abs = new URL(href, baseUrl);
      if (abs.origin !== origin) return; // stay on the same domain
      if (IGNORE_EXTENSIONS.test(abs.pathname)) return;
      if (LOGIN_HINTS.some((h) => abs.pathname.toLowerCase().includes(h))) return;
      abs.hash = '';
      found.add(abs.toString());
    } catch {
      /* ignore malformed URLs */
    }
  });

  return Array.from(found);
}

/**
 * Crawl a company website: fetch the homepage, discover important internal
 * pages, dedupe them, and extract readable text for AI analysis.
 */
export async function crawlWebsite(rootUrl: string): Promise<CrawledPage[]> {
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];

  const homeHtml = await fetchWithTimeout(rootUrl);
  if (!homeHtml) return pages;

  const $home = cheerio.load(homeHtml);
  pages.push({
    url: rootUrl,
    title: $home('title').first().text().trim() || rootUrl,
    text: extractText($home),
    kind: 'home'
  });
  visited.add(normalizePath(rootUrl));

  // Rank discovered links by how strongly they match a wanted page type.
  const candidates = discoverLinks($home, rootUrl)
    .map((url) => ({ url, kind: classify(new URL(url).pathname) }))
    .filter((c) => c.kind !== 'other' || false); // drop generic pages first pass

  // Keep at most one URL per kind, prefer shortest path (closer to root = more canonical)
  const byKind = new Map<string, string>();
  for (const c of candidates) {
    if (c.kind === 'home') continue;
    const existing = byKind.get(c.kind);
    if (!existing || c.url.length < existing.length) byKind.set(c.kind, c.url);
  }

  const limit = pLimit(4);
  const targets = Array.from(byKind.entries()).slice(0, MAX_PAGES - 1);

  const results = await Promise.all(
    targets.map(([kind, url]) =>
      limit(async () => {
        const path = normalizePath(url);
        if (visited.has(path)) return null;
        visited.add(path);
        const html = await fetchWithTimeout(url);
        if (!html) return null;
        const $ = cheerio.load(html);
        const page: CrawledPage = {
          url,
          title: $('title').first().text().trim() || url,
          text: extractText($),
          kind: kind as CrawledPage['kind']
        };
        return page;
      })
    )
  );

  for (const r of results) {
    if (r && r.text.length > 40) pages.push(r);
  }

  return pages;
}

function normalizePath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
}
