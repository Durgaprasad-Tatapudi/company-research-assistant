import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F4F6F8',
          card: '#FFFFFF',
          nav: '#EEF2F6',
          primary: '#2563EB',
          primaryHover: '#1D4ED8',
          text: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
          border: '#D1D5DB',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03)',
        glow: 'none',
        'glow-lg': 'none',
        'glow-violet': 'none',
        inner: 'none',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        rise: 'rise 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        slideUp: 'slideUp 0.3s ease-out forwards',
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        pulse2: 'pulse2 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
