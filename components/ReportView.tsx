'use client';

import { useRef, useState } from 'react';
import type { CompanyReport } from '@/lib/types';

const TABS = ['Summary', 'Products', 'Pain Points', 'Competitors', 'Sources'] as const;
type Tab = (typeof TABS)[number];

export default function ReportView({
  report,
  onDownloadPdf,
  downloading,
}: {
  report: CompanyReport;
  onDownloadPdf: () => void;
  downloading: boolean;
}) {
  const [tab, setTab] = useState<Tab>('Summary');
  const [copied, setCopied] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const copyReport = async () => {
    const text = [
      `COMPANY RESEARCH DOSSIER: ${report.companyName}`,
      `Website: ${report.website}`,
      report.phone ? `Phone: ${report.phone}` : '',
      report.address ? `Address: ${report.address}` : '',
      '',
      '--- SUMMARY ---',
      report.summary,
      '',
      '--- PRODUCTS ---',
      ...report.products.map((p) => `• ${p}`),
      '',
      '--- PAIN POINTS ---',
      ...report.painPoints.map((p) => `• ${p}`),
      '',
      '--- COMPETITORS ---',
      ...report.competitors.map((c) => `• ${c.name} (${c.website})${c.reason ? ` — ${c.reason}` : ''}`),
      '',
      `Generated: ${new Date(report.generatedAt).toLocaleString()} | Model: ${report.model}`,
    ]
      .filter(Boolean)
      .join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-[16px] overflow-hidden shadow-sm animate-fadeIn">
      {/* Header */}
      <div className="bg-brand-card border-b border-brand-border px-6 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
            <span className="text-[11px] font-semibold tracking-widest text-brand-primary uppercase">Executive Summary</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text truncate tracking-tight">{report.companyName}</h2>
          {report.website && (
            <a href={report.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-[14px] font-medium text-brand-primary hover:text-brand-primaryHover transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {report.website}
            </a>
          )}
        </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 mt-2 sm:mt-0">
            <button
              onClick={copyReport}
              className="btn-ghost px-5 py-2.5 text-[14px] font-medium"
            >
              {copied ? (
                <span className="text-brand-success">Copied!</span>
              ) : (
                'Copy Details'
              )}
            </button>
            <button
              onClick={onDownloadPdf}
              disabled={downloading}
              className="btn-primary px-5 py-2.5 text-[14px]"
            >
              {downloading ? 'Building PDF...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {/* Contact info cards */}
        {(report.phone || report.address) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {report.phone && (
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-nav border border-brand-border rounded-lg text-[13px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-brand-primary">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-brand-text font-medium">{report.phone}</span>
              </div>
            )}
            {report.address && (
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-nav border border-brand-border rounded-lg text-[13px]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-brand-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-brand-text font-medium">{report.address}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div ref={tabsRef} className="border-b border-brand-border bg-brand-nav">
        <div className="flex px-2 sm:px-4 pt-2 overflow-x-auto scrollbar-thin">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-4 text-[14px] font-semibold tracking-wide capitalize whitespace-nowrap transition-colors relative rounded-t-lg mx-1 ${
                tab === t ? 'text-brand-primary bg-brand-card' : 'text-brand-secondary hover:text-brand-text hover:bg-brand-border/30'
              }`}
            >
              {t}
              {tab === t && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-primary rounded-t-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 sm:p-8 min-h-[220px] bg-brand-card">
        {tab === 'Summary' && (
          <div className="animate-fadeIn">
            {report.summary ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-brand-text mb-4">About {report.companyName}</h3>
                <div className="border-l-4 border-brand-primary pl-5 py-1">
                  <p className="text-base sm:text-lg leading-relaxed text-brand-text/90 whitespace-pre-wrap">{report.summary}</p>
                </div>
              </div>
            ) : (
              <p className="text-brand-danger italic">Summary could not be generated. (Field is missing or empty)</p>
            )}
          </div>
        )}

        {tab === 'Products' && (
          <div className="animate-fadeIn">
            <BulletBlock items={report.products} empty="No products/services publicly listed." />
          </div>
        )}

        {tab === 'Pain Points' && (
          <div className="animate-fadeIn">
            <BulletBlock items={report.painPoints} empty="Not enough data to infer pain points." />
          </div>
        )}

        {tab === 'Competitors' && (
          <div className="animate-fadeIn space-y-4">
            {report.competitors && report.competitors.length > 0 ? (
              report.competitors.map((c, i) => (
                <div key={i} className="group p-5 sm:p-6 rounded-xl border border-brand-border bg-brand-nav hover:bg-brand-card hover:border-brand-primary/50 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[16px] font-bold text-brand-text">{c.name}</div>
                      </div>
                      {c.reason && <div className="text-[14px] text-brand-secondary mt-2 leading-relaxed">{c.reason}</div>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[15px] text-brand-muted">No competitors identified.</p>
            )}
          </div>
        )}

        {tab === 'Sources' && (
          <div className="animate-fadeIn space-y-3">
            {report.sources && report.sources.length > 0 ? (
              report.sources.map((s, i) => (
                <div key={i} className="flex items-center gap-4 py-3 px-3 group rounded-lg hover:bg-brand-nav transition-colors border border-transparent hover:border-brand-border">
                  <span className="text-brand-muted shrink-0 font-bold w-6 text-center">{String(i + 1).padStart(2, '0')}</span>
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary font-medium hover:text-brand-primaryHover hover:underline truncate transition-colors text-[14px]"
                  >
                    {s}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-[15px] text-brand-muted">No sources listed.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-4 border-t border-brand-border bg-brand-nav flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-brand-muted">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-brand-primary">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6.01" y2="6" />
            <line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
          MODEL: {report.model || 'unknown'}
        </div>
        <div>
          {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : ''}
        </div>
      </div>
    </div>
  );
}

function BulletBlock({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-[15px] text-brand-muted">{empty}</p>;

  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 text-[15px] sm:text-base text-brand-secondary group items-start">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0 mt-0.5 text-brand-primary">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="leading-relaxed group-hover:text-brand-text transition-colors font-medium">{item}</span>
        </li>
      ))}
    </ul>
  );
}
