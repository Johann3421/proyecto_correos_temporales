/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm zinc neutrals — not cold slate, not crema
        surface: {
          0: '#FFFFFF',
          50: '#FAFAF9',
          100: '#F4F4F3',
          200: '#E4E4E2',
          300: '#D4D4D1',
          400: '#A1A19C',
          500: '#71716B',
          600: '#52524D',
          700: '#3F3F3B',
          800: '#2C2C29',
          900: '#1C1C1A',
          950: '#131312',
        },
        // Accent — teal/cyan with warmth (IA never picks this)
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Functional — semantic, not brand
        ok: { light: '#16A34A', DEFAULT: '#22C55E', dark: '#4ADE80' },
        fail: { light: '#DC2626', DEFAULT: '#EF4444', dark: '#FCA5A5' },
        warn: { light: '#D97706', DEFAULT: '#F59E0B', dark: '#FCD34D' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'md': '0 2px 6px -1px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
