/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        primary: {
          DEFAULT: '#ededed',
          foreground: '#171717',
        },
        secondary: {
          DEFAULT: '#262626',
          foreground: '#ededed',
        },
        muted: {
          DEFAULT: '#262626',
          foreground: '#a3a3a3',
        },
        accent: {
          DEFAULT: '#4A6572',
          hover: '#344955',
          glow: 'rgba(74, 101, 114, 0.4)',
        },
        glass: {
          bg: 'rgba(74, 101, 114, 0.05)',
          border: 'rgba(74, 101, 114, 0.2)',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f8fafc',
        },
        border: '#262626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'in': 'in 0.2s ease-out',
        'out': 'out 0.2s ease-in',
      },
      keyframes: {
        in: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        out: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}
