export interface CrawledPage {
  url: string;
  title: string;
  text: string;
  kind: 'home' | 'about' | 'products' | 'services' | 'solutions' | 'contact' | 'pricing' | 'other';
}

export interface CompanyContactInfo {
  phone?: string;
  address?: string;
}

export interface Competitor {
  name: string;
  website: string;
  reason?: string;
}

export interface CompanyReport {
  companyName: string;
  website: string;
  phone?: string;
  address?: string;
  summary: string;
  products: string[];
  painPoints: string[];
  competitors: Competitor[];
  sources: string[];
  model: string;
  generatedAt: string;
}

export interface ResearchProgressEvent {
  step: string;
  status: 'pending' | 'active' | 'done' | 'error';
  detail?: string;
}

export interface ResearchRequestBody {
  query: string; // company name OR website URL
  model?: string; // OpenRouter model id
}

export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export const SUGGESTED_MODELS = [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.0-flash-001',
  'meta-llama/llama-3.1-70b-instruct',
  'mistralai/mistral-large'
];
