/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'neon-blue': '#00d4ff',
        'neon-purple': '#a855f7',
        'neon-green': '#22c55e',
        'neon-pink': '#ec4899',
        'neon-orange': '#f97316',
        // Dark backgrounds
        'dark-900': '#0a0a0f',
        'dark-800': '#0f0f1a',
        'dark-700': '#151525',
        'dark-600': '#1a1a30',
        'dark-500': '#202040',
        // Glass
        'glass-white': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'game': ['Orbitron', 'monospace'],
        'ui': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-game': 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #151525 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
        'gradient-fire': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'neon-glow': '0 0 40px rgba(0, 212, 255, 0.15), 0 0 80px rgba(168, 85, 247, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(0, 212, 255, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
