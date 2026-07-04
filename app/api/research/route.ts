import { NextRequest } from 'next/server';
import { findOfficialWebsite, supportingSearch, findCompetitors, normalizeUrl } from '@/lib/serper';
import { crawlWebsite } from '@/lib/crawler';
import { generateInsights } from '@/lib/openrouter';
import type { CompanyReport, ResearchProgressEvent } from '@/lib/types';
import { DEFAULT_MODEL } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isUrl(input: string): boolean {
  return /^https?:\/\//i.test(input.trim()) || /\w+\.\w{2,}/.test(input.trim().split(' ')[0]);
}

function sse(controller: ReadableStreamDefaultController, event: ResearchProgressEvent | { type: 'result'; data: CompanyReport } | { type: 'error'; message: string }) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const query: string = (body.query || '').trim();
  const model: string = body.model || DEFAULT_MODEL;

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sources: string[] = [];
      try {
        // Step 1: resolve website
        sse(controller, { step: 'resolve', status: 'active' });
        let website: string;
        let companyName: string;

        if (isUrl(query)) {
          website = normalizeUrl(query);
          companyName = new URL(website).hostname.replace('www.', '').split('.')[0];
          companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
        } else {
          companyName = query;
          const found = await findOfficialWebsite(query);
          if (!found) throw new Error(`Could not determine an official website for "${query}".`);
          website = found;
        }
        sources.push(website);
        sse(controller, { step: 'resolve', status: 'done', detail: website });

        // Step 2: crawl
        sse(controller, { step: 'crawl', status: 'active' });
        const pages = await crawlWebsite(website);
        sse(controller, { step: 'crawl', status: 'done', detail: `${pages.length} page(s) analyzed` });
        pages.forEach((p) => sources.push(p.url));

        // Step 3: supporting search
        sse(controller, { step: 'search', status: 'active' });
        const supporting = await supportingSearch(`${companyName} company phone address contact`, 6);
        const supportingSnippets = supporting.map((s) => `${s.title}: ${s.snippet ?? ''} (${s.link})`);
        supporting.forEach((s) => sources.push(s.link));
        sse(controller, { step: 'search', status: 'done', detail: `${supporting.length} result(s) found` });

        // Step 4: competitor search
        sse(controller, { step: 'competitors', status: 'active' });
        const industryHint = pages.find((p) => p.kind === 'about')?.text.slice(0, 200) ?? '';
        const competitorResults = await findCompetitors(companyName, industryHint);
        const competitorSnippets = competitorResults.map((s) => `${s.title}: ${s.snippet ?? ''} (${s.link})`);
        competitorResults.forEach((s) => sources.push(s.link));
        sse(controller, { step: 'competitors', status: 'done', detail: `${competitorResults.length} candidate(s) found` });

        // Step 5: AI analysis
        sse(controller, { step: 'ai', status: 'active', detail: model });
        const insights = await generateInsights(companyName, website, pages, supportingSnippets, competitorSnippets, model);
        console.log('\n--- BACKEND DEBUG LOG ---');
        console.log('1. Raw AI Insights parsed object:', JSON.stringify(insights, null, 2));
        console.log('2. Summary field specifically:', insights.summary);
        console.log('-------------------------\n');
        sse(controller, { step: 'ai', status: 'done' });

        const report: CompanyReport = {
          companyName,
          website,
          phone: insights.phone,
          address: insights.address,
          summary: insights.summary,
          products: insights.products,
          painPoints: insights.painPoints,
          competitors: insights.competitors,
          sources: Array.from(new Set(sources)).slice(0, 20),
          model,
          generatedAt: new Date().toISOString()
        };

        sse(controller, { type: 'result', data: report });
      } catch (err: any) {
        sse(controller, { type: 'error', message: err?.message || 'Unknown error occurred during research.' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
