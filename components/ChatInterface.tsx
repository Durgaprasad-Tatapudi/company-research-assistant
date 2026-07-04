'use client';

import { useEffect, useRef, useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import ReportView from './ReportView';
import DiscordSettings, { DiscordConfig } from './DiscordSettings';
import ResearchHistory, { saveToHistory } from './ResearchHistory';
import MobileDrawer from './MobileDrawer';
import type { CompanyReport, ResearchProgressEvent } from '@/lib/types';
import { SUGGESTED_MODELS, DEFAULT_MODEL } from '@/lib/types';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'system'; text: string }
  | { role: 'report'; report: CompanyReport };

const EXAMPLE_COMPANIES = [
  { name: 'Stripe', icon: '💳' },
  { name: 'Tesla', icon: '⚡' },
  { name: 'Vercel', icon: '▲' },
  { name: 'OpenAI', icon: '🤖' },
];

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<ResearchProgressEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [discordSending, setDiscordSending] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig>({
    botToken: '',
    channelId: '',
    applicantName: '',
    applicantEmail: '',
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setHistoryKey((k) => k + 1);
    window.addEventListener('history-updated', handler);
    return () => window.removeEventListener('history-updated', handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, events, loading]);

  async function runResearch(query: string) {
    setMessages((m) => [...m, { role: 'user', text: query }]);
    setEvents([]);
    setLoading(true);
    setDiscordStatus(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, model }),
      });

      if (!res.body) throw new Error('No response stream received.');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.replace(/^data:\s*/, '');
          if (!line) continue;
          const parsed = JSON.parse(line);

          if ('type' in parsed && parsed.type === 'result') {
            setMessages((m) => [...m, { role: 'report', report: parsed.data }]);
            saveToHistory(parsed.data);
            setHistoryKey((k) => k + 1);
            maybeSendDiscord(parsed.data);
          } else if ('type' in parsed && parsed.type === 'error') {
            setMessages((m) => [...m, { role: 'system', text: `Error: ${parsed.message}` }]);
          } else {
            setEvents((e) => [...e.filter((ev) => ev.step !== parsed.step), parsed]);
          }
        }
      }
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'system', text: `Error: ${err?.message || 'Something went wrong.'}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function maybeSendDiscord(report: CompanyReport) {
    if (!discordConfig.botToken || !discordConfig.channelId) return;
    setDiscordSending(true);
    try {
      const res = await fetch('/api/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, ...discordConfig }),
      });
      const data = await res.json();
      setDiscordStatus(res.ok ? '✓ Sent to Discord' : `Discord error: ${data.error}`);
    } catch (err: any) {
      setDiscordStatus(`Discord error: ${err?.message}`);
    } finally {
      setDiscordSending(false);
    }
  }

  async function downloadPdf(report: CompanyReport) {
    setDownloading(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error('PDF generation failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.companyName.replace(/\s+/g, '-')}-dossier.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'system', text: `Error: ${err?.message}` }]);
    } finally {
      setDownloading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    runResearch(q);
  }

  function handleHistoryReport(report: CompanyReport) {
    setMessages((m) => [...m, { role: 'report', report }]);
    setDrawerOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-brand-border bg-brand-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center text-white shadow-sm shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-brand-text tracking-tight leading-none">DeepSight AI AI</h1>
            <div className="text-[12px] font-medium text-brand-secondary mt-1">Enterprise Research</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <label className="block text-[10px] uppercase tracking-wider text-brand-secondary font-mono mb-2.5">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            AI Model (OpenRouter)
          </span>
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full glass bg-brand-card-input bg-brand-card px-3.5 py-3 text-[13px] text-brand-text focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]"
        >
          {SUGGESTED_MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-brand-muted font-mono mt-2.5">
          Any OpenRouter model ID works.
        </p>
      </div>

      <DiscordSettings config={discordConfig} onChange={setDiscordConfig} />
      {discordStatus && (
        <p className={`text-[11px] font-mono px-1.5 mt-2 ${discordStatus.includes('error') ? 'text-red-500' : 'text-brand-primary'}`}>
          {discordStatus}
        </p>
      )}
      {discordSending && (
        <p className="text-[11px] font-mono text-amber-500 px-1.5 mt-2 animate-pulse">
          Sending to Discord…
        </p>
      )}

      <ResearchHistory key={historyKey} onSelectReport={handleHistoryReport} />

      <div className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand-secondary font-mono mb-3">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_COMPANIES.map((ex) => (
            <button
              key={ex.name}
              onClick={() => {
                runResearch(ex.name);
                setDrawerOpen(false);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-brand-border text-brand-secondary hover:text-brand-primary hover:border-brand-primary hover:bg-brand-nav transition-all disabled:opacity-40 text-left bg-brand-card"
            >
              <span className="text-base grayscale group-hover:grayscale-0">{ex.icon}</span>
              <span className="text-[11px] font-mono font-medium">{ex.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-brand-bg text-brand-text md:flex-row font-sans">
      <aside className="hidden md:flex flex-col w-[320px] bg-brand-nav border-r border-brand-border shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {sidebarContent}
      </aside>

      <header className="md:hidden flex items-center justify-between p-4 bg-brand-card border-b border-brand-border sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center text-white shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="font-bold text-[16px] tracking-tight">DeepSight AI AI</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="p-2 -mr-2 text-brand-secondary hover:text-brand-text hover:bg-brand-nav rounded-md transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {sidebarContent}
      </MobileDrawer>

      <section className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth scrollbar-thin bg-brand-bg flex flex-col">
        <div ref={scrollRef} className="max-w-[800px] mx-auto w-full space-y-8 flex-1">
          {messages.length === 0 && (
            <div className="p-8 sm:p-12 text-center animate-fadeIn mt-8 sm:mt-12 bg-brand-card border border-brand-border rounded-[16px] shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primaryHover flex items-center justify-center text-white shadow-md mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight mb-3">Enterprise AI Research</h2>
              <p className="text-brand-secondary text-[15px] sm:text-base max-w-[460px] mx-auto leading-relaxed">
                Enter a company name or website URL. The system will dispatch agents to crawl, analyze, and construct a comprehensive dossier.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2.5 sm:hidden">
                {EXAMPLE_COMPANIES.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => runResearch(ex.name)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-border text-[11px] font-mono text-brand-secondary hover:text-brand-primary hover:border-brand-primary hover:bg-brand-nav transition-all disabled:opacity-40 bg-brand-card"
                  >
                    <span>{ex.icon}</span>
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end animate-slideUp">
                  <div className="bg-brand-primary text-white rounded-2xl rounded-tr-sm px-5 py-3.5 text-[15px] sm:text-base max-w-[85%] sm:max-w-[70%] shadow-sm leading-relaxed">
                    <div className="flex items-center gap-2 mb-1.5 opacity-80">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">You</span>
                    </div>
                    {msg.text}
                  </div>
                </div>
              );
            }
            if (msg.role === 'system') {
              return (
                <div key={i} className="animate-slideUp flex justify-center">
                  <div className="flex items-start gap-3 text-[13px] text-brand-danger font-mono bg-red-50 border border-brand-danger/30 rounded-lg px-5 py-4 max-w-[85%]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }
            return <ReportView key={i} report={msg.report} onDownloadPdf={() => downloadPdf(msg.report)} downloading={downloading} />;
          })}

          {loading && <ProgressIndicator events={events} />}
        </div>

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 sm:bottom-4 bg-brand-card border border-brand-border rounded-xl p-2 flex gap-2.5 z-20 shadow-lg mt-8"
        >
          <div className="flex items-center pl-4 text-brand-muted shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a company name or website URL…"
            className="flex-1 bg-transparent px-2 py-3 text-[15px] sm:text-base text-brand-text placeholder:text-brand-muted focus:outline-none font-medium"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary h-[46px] px-6 sm:px-8 font-display text-[14px] font-bold tracking-wide flex items-center gap-2.5 shrink-0"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <span className="hidden sm:inline">Processing...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Investigate</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
