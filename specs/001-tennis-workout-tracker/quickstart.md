# Quickstart: Rally

**Phase 1 Output** | **Date**: 2026-04-27 | **Plan**: [plan.md](plan.md)

## Prerequisites

- Node.js 20+ and npm 10+
- Git

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
# → App opens at http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output: dist/ directory (static files ready for deployment)

# Preview the production build locally
npm run preview
```

## Deploy to Vercel

```bash
# One-time: install Vercel CLI
npm i -g vercel

# Deploy (first run creates a project)
vercel
```

Or connect the GitHub repo to Vercel via the Vercel dashboard for automatic deployments
on every push to `main`.

## Deploy to GitHub Pages

```bash
# Build the app
npm run build

# Push dist/ to the gh-pages branch
npm run deploy
# (Configured in package.json using the `gh-pages` package)
```

Configure the repo's GitHub Pages source to the `gh-pages` branch, root directory.

**Note**: The Vite config sets `base: "./"` for relative asset paths. React Router uses
hash-based routing (`createHashRouter`) so GitHub Pages serves all routes correctly
without a custom `404.html`.

## Running Tests

```bash
# Unit tests (plan generator, data utilities)
npm test

# Watch mode
npm run test:watch
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build tool config; sets `base: "./"` for static hosting |
| `tailwind.config.ts` | Custom tennis colour tokens |
| `src/theme/tokens.ts` | Design system constants (colours, spacing, fonts) |
| `src/data/exercises.ts` | Built-in exercise library — edit here to add/remove exercises |
| `src/data/defaults.ts` | Default schedule and starting weights |

## Adding Exercises

Open `src/data/exercises.ts` and add an entry following the `Exercise` interface:

```typescript
{
  id: "my-exercise",           // slug, must be unique
  name: "My Exercise",
  dayType: ["lifting"],
  tennisCategory: "core",      // agility | explosiveness | shoulder | core | mobility | general
  muscleGroups: ["core", "obliques"],
  defaultSets: 3,
  defaultReps: "12–15",
  defaultWeight: 0,            // 0 = bodyweight
  equipment: ["none"],
}
```

## Resetting App Data

Open the browser's developer console and run:

```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith("rally_"))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

This wipes all stored data and reloads the app with defaults.
