// lib/openrouter.ts
// Sends the collected crawl + search context to an OpenRouter-hosted model
// and asks for strictly-structured JSON insights.

import type { CrawledPage, Competitor } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIInsights {
  summary: string;
  products: string[];
  painPoints: string[];
  competitors: Competitor[];
  phone?: string;
  address?: string;
}

function buildPrompt(params: {
  companyName: string;
  website: string;
  pages: CrawledPage[];
  supportingSnippets: string[];
  competitorSnippets: string[];
}): string {
  const { companyName, website, pages, supportingSnippets, competitorSnippets } = params;

  const pageBlocks = pages
    .map((p) => `### ${p.kind.toUpperCase()} (${p.url})\n${p.text.slice(0, 1500)}`)
    .join('\n\n');

  return `You are a business analyst. Analyze the company "${companyName}" (${website}) using ONLY the material below. Be concise, factual, and avoid invented specifics.

WEBSITE CONTENT:
${pageBlocks || '(no page content could be crawled)'}

SUPPORTING SEARCH SNIPPETS:
${supportingSnippets.map((s, i) => `[${i + 1}] ${s}`).join('\n') || '(none)'}

COMPETITOR SEARCH SNIPPETS:
${competitorSnippets.map((s, i) => `[${i + 1}] ${s}`).join('\n') || '(none)'}

Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "summary": "2-4 sentence company summary",
  "products": ["short product/service names, max 6"],
  "painPoints": ["likely business pain points this company could address for its customers, or challenges the company itself faces, max 5"],
  "competitors": [{"name": "Competitor name", "website": "https://...", "reason": "one short phrase"}],
  "phone": "phone number if found in the content above, else omit the field",
  "address": "postal address if found in the content above, else omit the field"
}
List between 3 and 6 competitors, prioritizing ones that operate in the same country and industry with similar products/services.`;
}

export async function generateInsights(
  companyName: string,
  website: string,
  pages: CrawledPage[],
  supportingSnippets: string[],
  competitorSnippets: string[],
  model: string
): Promise<AIInsights> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. Add it to your environment variables.');
  }

  const prompt = buildPrompt({ companyName, website, pages, supportingSnippets, competitorSnippets });

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'https://localhost:3000',
      'X-Title': 'Company Research Assistant'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a precise research analyst that only outputs valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenRouter request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? '{}';
  console.log('\n--- OPENROUTER RAW LLM OUTPUT ---');
  console.log(raw);
  console.log('-----------------------------------\n');
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary ?? 'No summary available.',
      products: Array.isArray(parsed.products) ? parsed.products : [],
      painPoints: Array.isArray(parsed.painPoints) ? parsed.painPoints : [],
      competitors: Array.isArray(parsed.competitors) ? parsed.competitors : [],
      phone: parsed.phone,
      address: parsed.address
    };
  } catch {
    return {
      summary: cleaned.slice(0, 600) || 'The model did not return parseable JSON.',
      products: [],
      painPoints: [],
      competitors: []
    };
  }
}
