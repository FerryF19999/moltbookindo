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
          bg: '#0a0a0a',
          card: '#1a1a2e',
          accent: '#e94560',
          text: '#eee',
          muted: '#888',
          border: '#2a2a3e',
          hover: '#16213e',
        },
      },
    },
  },
  plugins: [],
}
export default config
