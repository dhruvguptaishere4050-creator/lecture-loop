/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          void: '#080C14',
          card: 'rgba(15, 23, 42, 0.75)',
          elevated: 'rgba(23, 34, 58, 0.85)',
          surface: 'rgba(30, 44, 72, 0.65)',
          border: 'rgba(255, 255, 255, 0.09)',
          'border-highlight': 'rgba(255, 255, 255, 0.22)',
          text: '#F1F5F9',
          muted: '#94A3B8',
          dim: '#64748B',
        },
        cyan: {
          glow: '#00D2FF',
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          light: '#67E8F9',
        },
        electric: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          active: '#1D4ED8',
          light: '#93C5FD',
          glow: 'rgba(59, 130, 246, 0.35)',
        },
        status: {
          success: '#10B981',
          emerald: '#05F292',
          warning: '#F59E0B',
          ai: '#8B5CF6',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '26px',
      },
      boxShadow: {
        '3d-glass': '0 20px 45px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.5)',
        '3d-elevated': '0 30px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.28)',
        '3d-button': '0 10px 25px -4px rgba(0, 210, 255, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.3)',
        'cyan-glow': '0 0 25px -3px rgba(0, 210, 255, 0.5)',
        'emerald-glow': '0 0 25px -3px rgba(5, 242, 146, 0.45)',
        'violet-glow': '0 0 25px -3px rgba(139, 92, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
