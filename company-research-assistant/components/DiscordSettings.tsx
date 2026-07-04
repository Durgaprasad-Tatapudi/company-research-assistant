'use client';

import { useState } from 'react';

export interface DiscordConfig {
  botToken: string;
  channelId: string;
  applicantName: string;
  applicantEmail: string;
}

export default function DiscordSettings({
  config,
  onChange,
}: {
  config: DiscordConfig;
  onChange: (c: DiscordConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const isConfigured = !!(config.botToken && config.channelId);

  return (
    <div className="glass overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-4 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[15px] shadow-inner transition-colors ${
            isConfigured ? 'bg-cyan-subtle border border-cyan/20 text-cyan' : 'bg-violet-glow border border-violet/20 text-violet'
          }`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <span className="font-display text-[13px] font-semibold tracking-wide text-cream block group-hover:text-cyan transition-colors">Discord Integration</span>
            <span className="text-[10px] font-mono text-cream-muted mt-0.5 block">
              {isConfigured ? 'Configured ✓' : 'Optional feature'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured && <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]" />}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-cream-muted transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 space-y-4 border-t border-line pt-4">
          <Field
            label="Discord Bot Token"
            value={config.botToken}
            onChange={(v) => onChange({ ...config, botToken: v })}
            type="password"
            placeholder="Bot token (from evaluator)"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cream-muted/60">
                <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <Field
            label="Channel ID"
            value={config.channelId}
            onChange={(v) => onChange({ ...config, channelId: v })}
            placeholder="Channel ID (from evaluator)"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cream-muted/60">
                <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
              </svg>
            }
          />
          <Field
            label="Applicant Name"
            value={config.applicantName}
            onChange={(v) => onChange({ ...config, applicantName: v })}
            placeholder="Your full name"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cream-muted/60">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <Field
            label="Applicant Email"
            value={config.applicantEmail}
            onChange={(v) => onChange({ ...config, applicantEmail: v })}
            placeholder="you@example.com"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cream-muted/60">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
          />
          <div className="bg-cyan-subtle border border-cyan/10 rounded-lg p-3 mt-1">
            <p className="text-[11px] text-cyan/80 font-mono leading-relaxed">
              Data is saved in browser state for this session only. Once configured, generated dossiers automatically post to the channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-cream-dim mb-1.5 ml-1">{label}</span>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full glass-input px-3.5 py-3 text-[13px] text-cream placeholder:text-cream-muted/40 focus:outline-none ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </label>
  );
}
