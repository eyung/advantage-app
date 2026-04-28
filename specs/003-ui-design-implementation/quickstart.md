# Quickstart: Advantage Design System

## Prerequisites

- Node.js 18+
- npm 9+

## Run locally

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Build

```bash
npm run build       # TypeScript check + Vite production build
npm run preview     # Serve the dist/ folder locally
```

## Type-check only

```bash
npx tsc --noEmit
```

## Design token reference

All design tokens are CSS custom properties in `src/index.css`.  
Full design system documentation: `specs/003-ui-design-implementation/`

## Icon usage

```tsx
import { Icon } from '@/components/ui/Icon';

<Icon name="calendar" size={22} />
<Icon name="check" size={12} style={{ filter: 'brightness(0) invert(1)' }} />
```

Available icons: `activity bolt calendar chart check chevron-down chevron-left chevron-right dumbbell moon plus settings spark trophy x`

## Key design tokens

```css
--bg-app:        #f7f5ee   /* bone canvas */
--bg-surface:    #ffffff   /* card surface */
--brand:         #245236   /* forest green 700 */
--brand-soft:    #ebf1ed   /* forest green 100 */
--fg-primary:    #0e1f17
--fg-tertiary:   #6f7a87
--font-display:  'Fraunces'
--font-mono:     'JetBrains Mono'
--shadow-card:   0 1px 0 rgba(20,48,31,0.04), 0 8px 22px -10px rgba(20,48,31,0.10)
```
