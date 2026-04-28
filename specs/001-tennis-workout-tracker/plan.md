# Implementation Plan: Rally — Tennis-Focused Personal Workout Tracker

**Branch**: `001-tennis-workout-tracker` | **Date**: 2026-04-27 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-tennis-workout-tracker/spec.md`

## Summary

Build a single-page React + TypeScript application called Rally that acts as a personal
tennis-focused workout trainer. The app generates weekly workout plans biased toward
tennis-performance exercises, lets the user log sessions and track progress, and persists
all data in `localStorage`. It is deployable to Vercel, GitHub Pages, or served locally
with `npm run dev`. No backend, no authentication.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18  
**Primary Dependencies**: Vite 5 (build), Zustand 4 (state), Recharts 2 (charts), Tailwind CSS 3 (styling)  
**Storage**: `localStorage` — custom schema with versioned keys (migration helper on schema change)  
**Testing**: Vitest + React Testing Library (unit tests for plan generator and data utilities)  
**Target Platform**: Modern desktop and mobile browsers (Chrome/Firefox/Safari/Edge, last 2 major versions)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: Home screen interactive in < 2s on cold load; exercise logging interaction in < 15s  
**Constraints**: Zero backend, zero auth, offline-capable after first load, static hosting only  
**Scale/Scope**: Single user, ~5 screens, ~60 exercises in built-in library, up to 52 weeks of session history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-First, Tennis-Performance-Led | ✅ PASS | Exercise library and plan generator explicitly prioritize tennis-performance categories |
| II. Offline-First, Zero Backend | ✅ PASS | All persistence via `localStorage`; no API calls at runtime |
| III. Sensible Defaults, Optional Configuration | ✅ PASS | Default schedule (3 tennis / 2 lift / 1 cardio / 1 rest) ships on first open |
| IV. Visible Progress | ✅ PASS | Streak + last session shown on home screen; dedicated progress screen |
| V. Simplicity Over Completeness | ✅ PASS | No custom exercises, no nutrition, no auth, no push notifications in v1 |
| Tech: React SPA + localStorage | ✅ PASS | Vite + React + Zustand + localStorage only |
| Tech: Static hosting | ✅ PASS | `vite build` output is a pure static bundle |
| Tech: No authentication | ✅ PASS | Single-user app, no login |

**Gate result: PASS — proceeding to Phase 0**

## Project Structure

### Documentation (this feature)

```text
specs/001-tennis-workout-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── storage-schema.md
└── tasks.md             # Phase 2 output (/speckit-tasks - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/          # Button, Card, Badge, ProgressBar, Icon
│   ├── workout/         # WorkoutCard, ExerciseItem, SessionTimer
│   └── progress/        # ConsistencyChart, VolumeChart, StatCard
├── pages/
│   ├── Home.tsx         # Today's workout + streak banner
│   ├── Session.tsx      # Active workout session (log reps/sets/weight)
│   ├── Progress.tsx     # Charts and stats
│   └── Settings.tsx     # Schedule config + weight configuration
├── data/
│   ├── exercises.ts     # Built-in exercise library (~60 exercises)
│   └── defaults.ts      # Default schedule, session durations, starting weights
├── store/
│   ├── profileStore.ts  # TrainingProfile (Zustand slice)
│   ├── sessionStore.ts  # WorkoutSession + TennisSession history (Zustand slice)
│   └── index.ts         # Combined store export
├── hooks/
│   ├── useProfile.ts
│   ├── useSessions.ts
│   └── useWorkoutPlan.ts
├── utils/
│   ├── planGenerator.ts # Workout plan generation logic
│   ├── storage.ts       # localStorage read/write + schema version check
│   ├── migration.ts     # Schema migration helper
│   └── dateUtils.ts
├── theme/
│   └── tokens.ts        # Tennis colour tokens + typography
└── App.tsx              # Router + layout shell

public/
index.html

vite.config.ts
tailwind.config.ts
tsconfig.json
package.json
```

**Structure Decision**: Single SPA with no backend. Source lives entirely in `src/`. Static
output goes to `dist/` on `npm run build`. No `backend/` or `api/` directory needed.

## Complexity Tracking

> No Constitution Check violations — section not required.
