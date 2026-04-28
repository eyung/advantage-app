import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        court: {
          green: '#4CAF50',
          'green-dark': '#2E7D32',
          'green-light': '#81C784',
          'green-faint': '#E8F5E9',
        },
        clay: {
          DEFAULT: '#E65100',
          light: '#FF6F00',
          dark: '#BF360C',
          faint: '#FFF3E0',
        },
        'court-white': '#FAFAFA',
        'court-line': '#E8F5E9',
        'category-agility':    '#84CC16',
        'category-rotational': '#F97316',
        'category-shoulder':   '#3B82F6',
        'category-hiit':       '#EF4444',
        'category-strength':   '#8B5CF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
