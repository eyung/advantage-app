# Implementation Plan: Tennis Hub Redesign — Dashboard & Gear

**Branch**: `008-tennis-hub-redesign` | **Date**: 2026-06-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/008-tennis-hub-redesign/spec.md`

## Summary

Rebuild the app's information architecture around a four-area shell — **Dashboard (home), Training, Gear, Settings** — with fully responsive layout (single-column + bottom tab bar on mobile; sidebar + multi-column dashboard grid on desktop), replacing the fixed 430px frame. Keep only the forest/bone colour palette from the current design. Add a **Gear Locker** (rackets + restring history) backed by a new localStorage-persisted store with a schema migration. The dashboard surfaces training consistency (recharts), today's plan progress, streak, and string freshness — each with designed empty states. On-court session metrics are explicitly out of scope (future native iOS app).

## Technical Context

**Language/Version**: TypeScript 5.6 / React 18.3 (SPA)  
**Primary Dependencies**: Zustand 4 (state), recharts 2.13 (charts — already installed, already used by `ConsistencyChart`), Tailwind CSS 3.4 utilities + Advantage Design System tokens (`src/index.css`), uuid. `react-router-dom` is installed but unused — it stays unused (see research §1).  
**Storage**: `localStorage` only, via existing versioned helper (`src/utils/storage.ts`, `SCHEMA_VERSION` 3 → 4) with migration in `src/utils/migration.ts` (constitution requirement)  
**Testing**: Vitest + Testing Library (unit: gear store, streak derivation, migration); manual browser verification for all UI (constitution requirement)  
**Target Platform**: Browser SPA, static hosting (Vite 5 build; gh-pages/Vercel)  
**Project Type**: Mobile-first single-page web app, now responsive through desktop  
**Performance Goals**: Dashboard renders < 1s with 1 year of history + 30+ restrings (SC-008); no perceptible interaction lag  
**Constraints**: Offline-first, zero backend, no new colour tokens, no new runtime dependencies, existing user data must survive unchanged  
**Scale/Scope**: ~15 new components, 1 new store, 2 new types, 4 top-level views, 1 schema migration; single user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Tennis-Performance-Led | ✅ PASS | Dashboard centres training consistency and string freshness — both serve on-court performance. Gear Locker answers "is my racket match-ready?" |
| II. Offline-First, Zero Backend | ✅ PASS | New gear data in localStorage; recharts renders client-side; zero network calls, zero new dependencies |
| III. Sensible Defaults | ✅ PASS | No new required setup. Gear is opt-in; dashboard works immediately with designed empty states. Existing onboarding unchanged |
| IV. Visible Progress | ✅ PASS | Strongest alignment of any feature to date — progress becomes the homepage instead of a buried view |
| V. Simplicity Over Completeness | ✅ PASS | Scope cut via clarification: no session metrics, no non-racket gear, no reminders. Reuses installed chart lib; no router added |
| Workflow: schema migration | ✅ PASS | `SCHEMA_VERSION` 4 with migration step seeding empty gear state (see data-model.md) |

**All gates pass. No blockers. Re-checked after Phase 1 design: still passing.**

## Project Structure

### Documentation (this feature)

```text
specs/008-tennis-hub-redesign/
├── spec.md              ← feature specification (complete)
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output (manual verification scenarios)
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

No `contracts/` — the app exposes no external interface (no API, no CLI, no library surface). Its only contract is the localStorage schema, documented in `data-model.md`.

### Source Code (repository root)

```text
src/
├── App.tsx                                  # MODIFIED: SetupWizard gate → AppShell
├── types.ts                                 # MODIFIED: + Racket, RestringRecord
├── components/
│   ├── shell/                               # NEW: responsive app shell
│   │   ├── AppShell.tsx                     #   nav state owner; renders active view
│   │   ├── BottomTabBar.tsx                 #   mobile (< 768px) navigation
│   │   └── SideNav.tsx                      #   desktop (≥ 768px) navigation
│   ├── dashboard/                           # NEW: homepage
│   │   ├── DashboardView.tsx                #   responsive panel grid
│   │   ├── TodayPanel.tsx                   #   today's plan progress + CTA → Training
│   │   ├── ConsistencyPanel.tsx             #   8-week chart (adapts existing ConsistencyChart)
│   │   ├── StreakPanel.tsx                  #   current streak stat
│   │   ├── GearPanel.tsx                    #   string freshness for active rackets
│   │   └── EmptyPanel.tsx                   #   shared designed empty state
│   ├── gear/                                # NEW: Gear Locker
│   │   ├── GearView.tsx                     #   racket list (active + retired)
│   │   ├── RacketForm.tsx                   #   add/edit racket
│   │   ├── RacketDetail.tsx                 #   specs, current strings, history
│   │   └── RestringForm.tsx                 #   record a restring
│   ├── training/                            # NEW HOME for existing training UI
│   │   └── TrainingView.tsx                 #   day tabs + routine + session equipment + progress
│   ├── main/                                # MODIFIED: MainView dissolved into shell/training
│   │   ├── DayRoutineView.tsx               #   reused as-is (restyled)
│   │   ├── DayTabBar.tsx                    #   reused (restyled)
│   │   └── SessionEquipmentBar.tsx          #   reused (restyled)
│   ├── progress/                            #   ConsistencyChart reused by dashboard
│   ├── setup/                               # MODIFIED: SettingsView becomes a tab (no own header)
│   └── ui/                                  #   Icon etc. reused
├── store/
│   └── gearStore.ts                         # NEW: rackets + restrings (Zustand, persisted)
├── utils/
│   ├── storage.ts                           # MODIFIED: + gear key, SCHEMA_VERSION → 4
│   ├── migration.ts                         # MODIFIED: + migration step 4
│   └── streak.ts                            # NEW: streak derivation from completions
└── index.css                                # MODIFIED: responsive layout tokens; remove fixed-shell remnants
```

**Structure Decision**: Single Vite SPA project (existing). New top-level component folders per area (`shell/`, `dashboard/`, `gear/`, `training/`); existing `main/` components are reused inside `TrainingView` rather than rewritten — the redesign re-skins and re-houses them, preserving behaviour (FR-002).

## Phase 0: Research

See [research.md](research.md). Key decisions:

1. **Navigation = state-based tabs, no router** — `AppShell` owns an `activeArea` state; react-router stays unused (no deep links needed in an offline single-user app)
2. **Charts = recharts** — already installed and in use; dashboard reuses it
3. **Responsive = Tailwind breakpoints, mobile-first** — bottom tab bar < 768px; 240px sidebar ≥ 768px; dashboard grid 1-col → 2-col (≥ 1024px); content max-width 1100px on desktop
4. **Gear persistence = new `advantage_gear` key** — Zustand store matching existing store patterns; schema v4 migration seeds empty state
5. **String tension recorded in lbs** (number), optional separate cross tension for hybrids

## Phase 1: Design Artifacts

- [data-model.md](data-model.md) — `Racket`, `RestringRecord` entities, gear store shape, validation rules, derived values (current setup, string age), migration step
- [quickstart.md](quickstart.md) — manual browser verification scenarios per user story (constitution requires visual testing)
- Agent context: `CLAUDE.md` SPECKIT marker updated to point at this plan

## Implementation Outline (input to /speckit-tasks)

1. **Foundations**: types + gear store + storage key + schema v4 migration + streak util (unit-testable, no UI)
2. **Shell (US1)**: `AppShell` + `BottomTabBar` + `SideNav`; `App.tsx` mounts shell; `TrainingView` re-houses existing main components; `SettingsView` adapts to tab context; remove fixed 430px wrappers; responsive `index.css` updates
3. **Dashboard (US2)**: `DashboardView` grid + four panels + empty states; reuse `ConsistencyChart`
4. **Gear (US3)**: `GearView`, `RacketForm`, `RacketDetail`, `RestringForm`; wire `GearPanel` to real data
5. **Polish**: visual pass at 375px / 768px / 1280px, empty-state pass with cleared storage, regression checklist of existing flows (SC-005), unit tests green

## Complexity Tracking

No constitution violations to justify.

| Dimension | Assessment |
|---|---|
| Logic changes | Low — new gear CRUD + streak derivation; training engine untouched |
| State changes | One new persisted store; one schema version bump with migration |
| New dependencies | None (recharts + zustand already installed) |
| Schema changes | `SCHEMA_VERSION` 3 → 4, additive only (new key), existing keys untouched |
| Files touched | ~25 (15 new, ~10 modified) |
| Risk | Main risk is regression while re-housing MainView — mitigated by reusing components as-is and the SC-005 regression checklist |
