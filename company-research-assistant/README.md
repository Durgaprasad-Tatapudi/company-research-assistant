# Company Research Assistant

An AI-powered Company Research Assistant built for the **Relu Consultancy — AI & Automation Developer** hackathon.

Give it a company name or a website URL and it will:

1. Resolve the official website (if a name was given) via **Serper.dev**.
2. **Crawl** the site's important pages (Home, About, Products, Services, Solutions, Contact, Pricing) — skipping duplicates, login pages, and irrelevant pages.
3. Run **supporting search** for contact details and public context.
4. Search for and rank **competitors** operating in the same country/industry.
5. Send everything to an **OpenRouter** model of your choice to generate a summary, product list, AI-generated pain points, and competitor suggestions.
6. Render it all in a **ChatGPT-style interface** with live progress indicators.
7. Export a **professional PDF dossier** with one click.
8. *(Bonus)* Push the report + PDF to a **Discord channel** via the Bot API.

---

## Tech stack

- **Next.js 14 (App Router, TypeScript)** — single unified project, frontend + API routes, deploys as one app.
- **Tailwind CSS** — styling (dark "case file / dossier" visual theme).
- **cheerio** — HTML parsing for the crawler.
- **p-limit** — bounded concurrency for crawling.
- **pdfkit** — server-side PDF generation.
- **Serper.dev** — search API.
- **OpenRouter** — AI model gateway (model selectable in the UI).
- **Discord Bot API** — bonus notification + file upload.

No database, no authentication, no persisted history — fully stateless per the assignment spec.

---

## Project structure

```
company-research-assistant/
├── app/
│   ├── page.tsx                 # Landing page (hero + chat UI)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── research/route.ts    # Orchestrates crawl + search + AI, streams progress (SSE)
│       ├── pdf/route.ts         # Report JSON -> downloadable PDF
│       └── discord/route.ts     # Report JSON -> Discord channel message + PDF attachment
├── components/
│   ├── ChatInterface.tsx        # Chat input, streaming progress, report list
│   ├── ProgressIndicator.tsx    # Step-by-step "case file" progress ticker
│   ├── ReportView.tsx           # Tabbed dossier display (Summary/Products/Pain Points/Competitors/Sources)
│   └── DiscordSettings.tsx      # Bonus: Discord Bot Token / Channel ID / applicant info panel
├── lib/
│   ├── serper.ts                # Serper.dev integration (site resolution, search, competitors)
│   ├── crawler.ts                # Website crawler (page discovery, dedup, extraction)
│   ├── openrouter.ts             # OpenRouter chat completion + structured JSON parsing
│   ├── pdfGenerator.ts           # PDFKit report builder
│   ├── discord.ts                # Discord Bot API notifier (multipart file upload)
│   └── types.ts                  # Shared types + model list
├── .env.example
└── package.json
```

---

## Setup

```bash
git clone <your-fork-url>
cd company-research-assistant
npm install
cp .env.example .env.local
# fill in SERPER_API_KEY and OPENROUTER_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000.

### Required environment variables

| Variable | Required | Purpose |
|---|---|---|
| `SERPER_API_KEY` | Yes | Search integration (site resolution, contact info, competitors) — https://serper.dev |
| `OPENROUTER_API_KEY` | Yes | AI reasoning — https://openrouter.ai/keys |
| `APP_URL` | No | Sent as `HTTP-Referer` to OpenRouter; defaults to `http://localhost:3000` |

**Discord Bot Token and Channel ID are entered in-app** (Discord Integration panel), per the assignment's requirement that the evaluator supplies them at evaluation time — they are never stored server-side.

---

## Deployment (Vercel example)

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add `SERPER_API_KEY` and `OPENROUTER_API_KEY` as Environment Variables in the Vercel project settings.
4. Deploy. Vercel builds the Next.js app automatically (`next build`).
5. Set `APP_URL` to your production URL for a clean OpenRouter referrer (optional).

The same steps apply to Netlify (`@netlify/plugin-nextjs`) or Cloudflare Pages (`next-on-pages`).

---

## How each requirement is satisfied

- **Company Research** — `lib/serper.ts` + `lib/crawler.ts` + `lib/openrouter.ts` collect name, website, phone, address, products/services, and AI-generated pain points from the crawl + search context.
- **Website Crawling** — `lib/crawler.ts` discovers Home/About/Products/Services/Solutions/Contact/Pricing pages from on-page links, dedupes by normalized path, skips login-hinted and non-HTML URLs, and extracts cleaned text.
- **Search Integration** — `lib/serper.ts` wraps Serper.dev for site resolution, contact lookup, and competitor discovery.
- **AI Integration** — `lib/openrouter.ts` calls OpenRouter's `/chat/completions` with a user-selectable `model` and enforces strict JSON output.
- **Competitor Analysis** — dedicated Serper query + AI ranking returns 3–6 named competitors with websites.
- **Interactive Chat Interface** — `components/ChatInterface.tsx`, streamed step-by-step via Server-Sent Events from `/api/research`.
- **PDF Generation** — `lib/pdfGenerator.ts` (PDFKit) renders a branded, single-click-downloadable dossier via `/api/pdf`.
- **Discord Integration (bonus)** — `components/DiscordSettings.tsx` + `/api/discord` + `lib/discord.ts` post the applicant/company details and attach the generated PDF to a Discord channel via the Bot API.

---

## Notes & limitations

- The crawler is same-origin and depth-1 (from links reachable from the homepage) — sufficient for typical marketing sites within the hackathon's time and API-cost budget; it can be extended to multi-level BFS if needed.
- AI output is only as good as what was crawled/found; sparse public information will produce sparser summaries rather than fabricated detail.
- Because there's no database, refreshing the page clears chat history by design (matches the "no report history required" requirement).
