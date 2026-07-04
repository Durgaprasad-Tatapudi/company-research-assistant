'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResearchProgressEvent } from '@/lib/types';

const STEPS = [
  { key: 'resolve', label: 'Resolving website', icon: '🔍' },
  { key: 'crawl', label: 'Crawling pages', icon: '🕸️' },
  { key: 'search', label: 'Searching sources', icon: '📡' },
  { key: 'competitors', label: 'Finding competitors', icon: '⚔️' },
  { key: 'ai', label: 'AI analysis', icon: '🧠' },
];

export default function ProgressIndicator({ events }: { events: ResearchProgressEvent[] }) {
  const latestByStep = new Map<string, ResearchProgressEvent>();
  events.forEach((e) => latestByStep.set(e.step, e));

  const doneCount = STEPS.filter((s) => latestByStep.get(s.key)?.status === 'done').length;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="glass overflow-hidden animate-slideUp">
      {/* Overall progress bar */}
      <div className="h-1 bg-base-300 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan via-violet to-cyan transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse2" />
            <span className="font-mono text-[11px] text-cyan tracking-[0.2em] uppercase">Processing</span>
          </div>
          <span className="font-mono text-[11px] text-cream-muted bg-base-100 px-2 py-1 rounded-md border border-line">
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Timeline steps */}
        <div className="relative pl-1">
          {/* Connecting line */}
          <div className="timeline-track">
            <div
              className="timeline-fill"
              style={{ height: `${Math.max(0, ((doneCount - 0.5) / (STEPS.length - 1)) * 100)}%` }}
            />
          </div>

          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const event = latestByStep.get(step.key);
              const status = event?.status ?? 'pending';

              return (
                <div key={step.key} className="flex items-center gap-4 relative" style={{ animationDelay: `${i * 60}ms` }}>
                  {/* Dot */}
                  <div className={`step-dot step-${status}`}>
                    {status === 'done' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : status === 'active' ? (
                      <span className="text-[14px]">{step.icon}</span>
                    ) : status === 'error' ? (
                      <span className="font-bold">!</span>
                    ) : (
                      <span className="text-xs font-mono opacity-50">{String(i + 1)}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] sm:text-sm font-medium transition-colors ${
                      status === 'done' ? 'text-cream' :
                      status === 'active' ? 'text-cyan' :
                      status === 'error' ? 'text-rose' :
                      'text-cream-dim'
                    }`}>
                      {step.label}
                    </div>
                    {event?.detail && (
                      <div className="text-[11px] text-cream-muted font-mono truncate mt-0.5 opacity-80">
                        {event.detail}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  {status === 'active' && (
                    <div className="shimmer rounded-full px-2.5 py-1 border border-cyan/10">
                      <span className="text-[10px] font-mono text-cyan tracking-wider uppercase">Active</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
