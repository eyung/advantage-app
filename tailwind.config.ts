import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0e1f17',
          900: '#14301f',
          800: '#1c4029',
          700: '#245236',
          600: '#2f6644',
          500: '#3e7d56',
          400: '#6aa183',
          300: '#a7c8b5',
          200: '#d6e3dc',
          100: '#ebf1ed',
        },
        slate: {
          950: '#0c1115',
          900: '#161c22',
          800: '#232a32',
          700: '#3a444f',
          600: '#56616d',
          500: '#6f7a87',
          400: '#94a0ad',
          300: '#b9c2cc',
          200: '#d8dee5',
          100: '#ecf0f3',
          50:  '#f4f6f8',
        },
        bone: {
          DEFAULT: '#f7f5ee',
          soft:    '#fbf9f4',
          deep:    '#efece2',
        },
        court: '#d6e352',
        success: '#2f8f5d',
        'success-soft': '#dff0e6',
        'category-agility':    '#3e7d56',
        'category-rotational': '#c98a2b',
        'category-shoulder':   '#3f5d8c',
        'category-hiit':       '#a23a3a',
        'category-strength':   '#6e4e8c',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Inter', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card:       '0 1px 0 rgba(20,48,31,0.04), 0 8px 22px -10px rgba(20,48,31,0.10)',
        'card-hover':'0 1px 0 rgba(20,48,31,0.04), 0 14px 30px -12px rgba(20,48,31,0.18)',
        sm:         '0 1px 2px rgba(20,48,31,0.06), 0 1px 1px rgba(20,48,31,0.04)',
        md:         '0 6px 16px -6px rgba(20,48,31,0.10), 0 2px 4px rgba(20,48,31,0.05)',
      },
      borderRadius: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '18px',
        xl:   '24px',
        '2xl':'32px',
        pill: '999px',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2,0,0,1)',
        emphatic: 'cubic-bezier(0.3,0,0,1)',
      },
    },
  },
  plugins: [],
}

export default config
