// lib/serper.ts
// Thin wrapper around the Serper.dev "Google Search" API.
// Docs: https://serper.dev

interface SerperOrganicResult {
  title: string;
  link: string;
  snippet?: string;
}

interface SerperResponse {
  organic?: SerperOrganicResult[];
  knowledgeGraph?: {
    title?: string;
    website?: string;
    attributes?: Record<string, string>;
  };
}

const SERPER_URL = 'https://google.serper.dev/search';

async function serperSearch(query: string, num = 8): Promise<SerperResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not set. Add it to your environment variables.');
  }

  const res = await fetch(SERPER_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q: query, num })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Serper.dev request failed (${res.status}): ${body}`);
  }

  return (await res.json()) as SerperResponse;
}

/** Resolve a company name to its most likely official website. */
export async function findOfficialWebsite(companyName: string): Promise<string | null> {
  const data = await serperSearch(`${companyName} official website`, 5);

  if (data.knowledgeGraph?.website) {
    return normalizeUrl(data.knowledgeGraph.website);
  }

  const blocked = ['wikipedia.org', 'linkedin.com', 'facebook.com', 'twitter.com', 'x.com', 'crunchbase.com', 'youtube.com', 'instagram.com'];
  const first = data.organic?.find((r) => !blocked.some((b) => r.link.includes(b)));
  return first ? normalizeUrl(first.link) : null;
}

/** General-purpose supporting search used for contact info, competitors, etc. */
export async function supportingSearch(query: string, num = 8): Promise<SerperOrganicResult[]> {
  const data = await serperSearch(query, num);
  return data.organic ?? [];
}

export async function findCompetitors(companyName: string, industryHint: string): Promise<SerperOrganicResult[]> {
  const query = `top competitors of ${companyName} ${industryHint ?? ''}`.trim();
  const data = await serperSearch(query, 10);
  return data.organic ?? [];
}

export function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return u;
  }
}
