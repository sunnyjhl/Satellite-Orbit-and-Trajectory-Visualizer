/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': '#0a0a1a',
        'space-dark': '#1a1a2e',
        'space-light': '#2a2a4e',
        'cyan-electric': '#00d4ff',
        'orange-accent': '#ff6b35',
        'purple-accent': '#7b2cbf',
        'green-leo': '#00ff88',
        'cyan-meo': '#00d4ff',
        'orange-geo': '#ff6b35',
        'magenta-polar': '#ff00ff',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        }
      }
    },
  },
  plugins: [],
}

