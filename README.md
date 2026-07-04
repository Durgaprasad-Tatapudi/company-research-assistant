# Enterprise AI Research Dashboard

An intelligent, AI-powered Company Research application designed to perform deep data extraction, web crawling, and automated dossier generation. This project has been upgraded with a **Premium Enterprise-grade Dashboard UI** built on a strictly defined design system.

Give the system a company name or a website URL, and it will:

1. **Resolve Identity:** Locate the official website and metadata via **Serper.dev**.
2. **Intelligent Web Crawling:** Deep crawl critical pages (Home, About, Products, Services, Solutions, Contact, Pricing), automatically skipping irrelevant or duplicate pages.
3. **Data Aggregation:** Gather context, public contact information, and business metrics.
4. **Competitor Discovery:** Automatically rank and analyze industry competitors.
5. **AI Reasoning:** Stream the aggregated dataset to an **OpenRouter** AI model of your choice to synthesize an executive summary, catalog products, deduce pain points, and map the competitive landscape.
6. **Enterprise Interface:** Render the results in a premium, tabbed dashboard with live progress indicators and interactive UI components.
7. **One-Click Export:** Generate and download a branded, professional PDF dossier instantly.
8. **Discord Integration (Bonus):** Push generated reports and PDF attachments directly to a Discord channel.

---

## 🎨 Enterprise Design System
The UI has been completely overhauled from a generic hackathon prototype to a scalable SaaS product:
- **Clean Palette:** Strict adherence to a professional color hierarchy (`#F4F6F8` backgrounds, crisp `#FFFFFF` cards, and `#2563EB` primary accents).
- **High Contrast:** Strictly enforces WCAG accessibility contrast ratios for maximum readability.
- **Interactive Micro-animations:** Seamless slide-ups, fade-ins, and button hover states for a premium user experience.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom `brand-*` theme
- **Web Scraping:** `cheerio` (HTML parsing) & `p-limit` (Bounded concurrency)
- **Document Generation:** `pdfkit` (Server-side PDF rendering)
- **Search API:** [Serper.dev](https://serper.dev/)
- **AI Gateway:** [OpenRouter](https://openrouter.ai/) (Allows toggling between Claude, GPT-4, etc.)
- **Notifications:** Discord Bot API

---

## 📂 Project Structure

```text
company-research-assistant/
├── app/
│   ├── page.tsx                 # Main application interface
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Core design tokens and CSS variables
│   └── api/
│       ├── research/route.ts    # Orchestrates crawl + search + AI, streams SSE
│       ├── pdf/route.ts         # Generates downloadable PDF from report JSON
│       └── discord/route.ts     # Pushes message + PDF attachment to Discord
├── components/
│   ├── ChatInterface.tsx        # Chat input, Sidebar, streaming progress UI
│   ├── ProgressIndicator.tsx    # Step-by-step progress ticker
│   ├── ReportView.tsx           # Tabbed Executive Dossier display
│   ├── ResearchHistory.tsx      # Local storage history of past reports
│   └── DiscordSettings.tsx      # Discord Integration configuration panel
├── lib/
│   ├── serper.ts                # Serper.dev integration
│   ├── crawler.ts               # Automated Website crawler
│   ├── openrouter.ts            # AI Chat completions & structured JSON extraction
│   ├── pdfGenerator.ts          # PDF builder logic
│   ├── discord.ts               # Discord Bot API client
│   └── types.ts                 # Shared TypeScript interfaces
├── .env.example
├── .gitignore
├── tailwind.config.ts           # Enterprise theme variables
└── package.json
```

---

## 🚀 Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/Durgaprasad-Tatapudi/company-research-assistant.git
cd company-research-assistant
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure Environment Variables**
Copy the template and fill in your API keys:
```bash
cp .env.example .env.local
```
Update `.env.local` with your credentials:
- `SERPER_API_KEY`: Get a key at [Serper.dev](https://serper.dev/)
- `OPENROUTER_API_KEY`: Get a key at [OpenRouter](https://openrouter.ai/keys)

**4. Start the Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚙️ Configuration details

| Variable | Required | Purpose |
|---|---|---|
| `SERPER_API_KEY` | **Yes** | Search integration (site resolution, competitors) |
| `OPENROUTER_API_KEY` | **Yes** | AI reasoning |
| `APP_URL` | No | Sent as `HTTP-Referer` to OpenRouter (default: `http://localhost:3000`) |

> **Note:** The Discord Bot Token and Channel ID are entered via the **Discord Integration panel** directly in the UI. They are never stored server-side to maintain a stateless security posture.

---

## ☁️ Deployment (Vercel)

1. Push your code to your GitHub repository.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add `SERPER_API_KEY` and `OPENROUTER_API_KEY`.
5. Click **Deploy**. Vercel will automatically build (`npm run build`) and host your Next.js application.

---

## 📌 Technical Notes & Architecture

- **Stateless Design:** No external database is required. The history component uses HTML5 `localStorage` to cache reports locally on the client.
- **Server-Sent Events (SSE):** The `/api/research` endpoint heavily utilizes Node Streams to push real-time status updates and final payload generation directly to the UI.
- **Crawler Scope:** The crawler operates entirely on a depth-1 breadth-first search from the resolved homepage to ensure operations complete within typical serverless execution timeouts.
