'use client';

import { useState, useEffect } from 'react';
import type { CompanyReport } from '@/lib/types';

interface HistoryEntry {
  id: string;
  companyName: string;
  website: string;
  generatedAt: string;
  report: CompanyReport;
}

const STORAGE_KEY = 'casefile-research-history';

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(report: CompanyReport): void {
  const history = getHistory();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    companyName: report.companyName,
    website: report.website,
    generatedAt: report.generatedAt,
    report,
  };
  const updated = [entry, ...history].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export default function ResearchHistory({
  onSelectReport,
}: {
  onSelectReport: (report: CompanyReport) => void;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setMounted(true);

    const handleHistoryUpdated = () => {
      setHistory(getHistory());
    };
    window.addEventListener('history-updated', handleHistoryUpdated);
    return () => window.removeEventListener('history-updated', handleHistoryUpdated);
  }, []);

  if (!mounted || history.length === 0) {
    return (
      <div className="p-4 mt-6 bg-brand-card border border-brand-border rounded-[16px] shadow-sm">
        <div className="text-[10px] uppercase tracking-wider text-brand-secondary font-mono mb-3">Research History</div>
        <p className="text-xs text-brand-muted text-center py-4">No past research yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 mt-6 bg-brand-card border border-brand-border rounded-[16px] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-wider text-brand-secondary font-mono">Research History</span>
        <button
          onClick={() => {
            clearHistory();
            window.dispatchEvent(new Event('history-updated'));
          }}
          className="text-[10px] font-mono text-red-500 hover:text-red-600 transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin pr-1">
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectReport(entry.report)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-brand-border bg-brand-card hover:border-brand-primary hover:bg-brand-nav transition-all group shadow-sm text-left"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-nav flex items-center justify-center text-[13px] font-bold text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors shrink-0">
                {entry.companyName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] text-brand-text font-medium truncate group-hover:text-brand-primary transition-colors">
                  {entry.companyName}
                </div>
                <div className="text-[10px] text-brand-muted font-mono truncate mt-0.5">
                  {new Date(entry.generatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-brand-muted group-hover:text-brand-primary transition-colors shrink-0 ml-3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
