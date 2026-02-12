import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        molt: {
          bg: '#0a0a0f',
          card: '#12121a',
          'card-hover': '#1a1a25',
          accent: '#ff4757',
          'accent-hover': '#ff6b81',
          text: '#f1f2f6',
          muted: '#747d8c',
          border: '#2f3542',
          'border-hover': '#57606f',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 71, 87, 0.3)',
        'glow-sm': '0 0 10px rgba(255, 71, 87, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 40px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
