/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
        retro: ['"Chakra Petch"', 'sans-serif'],
        gothic: ['"UnifrakturMaguntia"', 'cursive'],
        script: ['"Great Vibes"', 'cursive'],
        cinzel: ['"Cinzel"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },
      colors: {
        retro: {
          bg: '#253443',
          panel: '#2c3e50',
          panelDark: '#1e2b37',
          border: '#111827',
          blueHeader: '#38bdf8',
          blueHeaderDark: '#0284c7',
          cream: '#fef3c7',
          yellow: '#fbbf24',
          yellowDark: '#d97706',
          pink: '#ec4899',
          pinkDark: '#be185d',
          teal: '#14b8a6',
          tealDark: '#0f766e',
          green: '#22c55e',
          greenDark: '#15803d',
          red: '#ef4444',
          redDark: '#b91c1c',
          sky: '#67e8f9',
          skyDark: '#0891b2',
        }
      },
      boxShadow: {
        'retro-sm': '0 3px 0 #111827',
        'retro': '0 5px 0 #111827',
        'retro-lg': '0 8px 0 #111827',
        'retro-inset': 'inset 0 3px 0 rgba(255, 255, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
