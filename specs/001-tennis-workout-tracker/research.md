# Research: Rally — Tennis-Focused Personal Workout Tracker

**Phase 0 Output** | **Date**: 2026-04-27 | **Plan**: [plan.md](plan.md)

## Decision Log

### 1. Build Tool

**Decision**: Vite 5  
**Rationale**: Zero-config React + TypeScript setup, fastest local dev server, produces
optimised static bundles compatible with Vercel and GitHub Pages out of the box. The
`vite-plugin-react` handles JSX transform without CRA overhead.  
**Alternatives considered**: Create React App (deprecated, heavy), Parcel (less ecosystem
support), Next.js (adds SSR complexity that violates Principle II — Zero Backend)

---

### 2. State Management

**Decision**: Zustand 4  
**Rationale**: Minimal boilerplate, first-class `localStorage` persistence via
`zustand/middleware/persist`, no Provider wrapping needed, TypeScript-friendly. The app
has two simple state domains (profile + sessions) — Redux Toolkit would be overkill.  
**Alternatives considered**: React Context + useReducer (no persistence middleware, verbose
for cross-component reads), Redux Toolkit (too much boilerplate for a single-user app),
Jotai (atom model less natural for structured entity stores)

---

### 3. Charts Library

**Decision**: Recharts 2  
**Rationale**: Built for React (SVG-based), zero dependency on Canvas API (better
accessibility), composable API matches the two chart types needed (line chart for weight
progression, bar chart for consistency). Bundle size ~90kB gzipped — acceptable.  
**Alternatives considered**: Chart.js + react-chartjs-2 (Canvas-based, less accessible),
Victory (larger bundle, more complex API for simple charts), D3 directly (too low-level for
the scope)

---

### 4. Styling

**Decision**: Tailwind CSS 3  
**Rationale**: Utility-first approach works well with a custom design token set. The tennis
colour palette (court green, clay orange, white) maps directly to Tailwind custom colours
in `tailwind.config.ts`. JIT mode keeps the final CSS bundle small.  
**Alternatives considered**: CSS Modules (verbose for theming), Styled Components (runtime
CSS-in-JS has unnecessary overhead for a static app), plain CSS (hard to maintain consistent
design tokens)

---

### 5. Tennis-Performance Exercise Library

**Decision**: Built-in static library of ~60 exercises categorised by type and tennis relevance  
**Rationale**: A curated static library ships with the app and requires no network call.
Exercises are tagged with:
- `tennisCategory`: `agility` | `explosiveness` | `shoulder` | `core` | `mobility` | `general`
- `dayType`: `lifting` | `cardio` | `tennis-conditioning`
- `muscleGroups`: array of target muscles

Tennis-performance exercises to include (minimum, by category):
- **Agility**: Lateral band walks, cone drills, shuffle steps, T-drill, Box jumps
- **Explosiveness**: Medicine ball slams, Jump squats, Power cleans (light), Broad jumps
- **Shoulder stability**: Face pulls, External rotation, YTW raises, Band pull-aparts, Prone Y/T/W
- **Core/Rotational**: Pallof press, Woodchops, Cable rotation, Dead bugs, Side planks
- **General strength** (tennis-supportive): Romanian deadlifts, Bulgarian split squats,
  Goblet squats, Dumbbell rows, Push-ups, Pull-ups/Lat pulldown

**Alternatives considered**: User-defined exercise library (out of scope for v1 per spec
Assumptions section)

---

### 6. Plan Generation Algorithm

**Decision**: Rule-based weighted assignment  
**Rationale**: For a single-user app with a fixed exercise library, a deterministic
rule-based generator is simpler and more predictable than ML-based scheduling. The algorithm:

1. Read `TrainingProfile.weekSchedule` (7 slots, each assigned a day type)
2. For a `lifting` day: select exercises by picking from each tennis category proportionally
   (agility 20%, explosiveness 20%, shoulder 20%, core 20%, general 20%) to fill the
   configured session duration (assume 45–60 min per exercise circuit)
3. For a `cardio` day: select cardio conditioning exercises + optional short agility circuit
4. For a `tennis` day: generate a structured on-court session plan (warm-up, drills, match
   play, cool-down) based on hours available
5. Shuffle within categories each week to avoid repetition, seeded by ISO week number
   (deterministic per week, changes weekly)

**Alternatives considered**: AI-generated plans (requires network/LLM, violates Principle II),
pure random selection (poor exercise balance over time)

---

### 7. localStorage Schema Versioning

**Decision**: Version key `rally_schema_version` with migration module  
**Rationale**: Storing a schema version key alongside data keys allows detecting stale data
on app startup. A `migration.ts` module maps version numbers to upgrade functions. If a
breaking schema change occurs, old data is migrated automatically rather than silently lost.  
**Schema key namespace**: `rally_*` prefix on all keys to avoid collisions.

**Alternatives considered**: No versioning (violates Development Workflow principle —
"migration helper MUST be provided"), IndexedDB (heavier API, unnecessary for this data volume)

---

### 8. Routing

**Decision**: React Router v6 (hash-based routing for GitHub Pages compatibility)  
**Rationale**: Hash routing (`/#/settings`) works without server-side redirects, making
GitHub Pages deployment seamless. Vercel supports path-based routing but hash routing
works on both without configuration.  
**Routes**: `/` (Home), `/session` (Active Session), `/progress` (Progress), `/settings` (Settings)
