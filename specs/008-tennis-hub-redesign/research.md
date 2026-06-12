# Research: Tennis Hub Redesign — Dashboard & Gear

**Feature**: 008-tennis-hub-redesign  
**Date**: 2026-06-12

## 1. Navigation Architecture

**Decision**: State-based tab navigation owned by `AppShell` (a single `activeArea: 'dashboard' | 'training' | 'gear' | 'settings'` state). No URL routing.  
**Rationale**: The app is offline-first, single-user, and statically hosted — deep links, history, and shareable URLs provide no value. The current codebase already switches views by state (`App.tsx` conditionally renders `SetupWizard`/`MainView`); extending that pattern is the smallest change that satisfies FR-001. `react-router-dom` sits in `package.json` but is imported nowhere — it remains unused rather than becoming a new architectural commitment.  
**Alternatives considered**:
- `react-router-dom` (already installed) — adds URL state, route config, and gh-pages hash-routing workarounds for zero user value in this product
- Zustand `uiStore` for nav state — unnecessary; nav state has exactly one owner (`AppShell`) and no cross-store consumers

## 2. Chart Library

**Decision**: recharts 2.13 (already installed).  
**Rationale**: Already a dependency and already used by `src/components/progress/ConsistencyChart.tsx`. The dashboard's needs (weekly bar chart, simple trend display) are squarely within its sweet spot. Zero new dependencies keeps the constitution's small-footprint constraint honest.  
**Alternatives considered**:
- Hand-rolled SVG charts — more code to maintain for no gain given recharts is already in the bundle
- Chart.js / visx — new dependencies duplicating existing capability

## 3. Responsive Layout Strategy

**Decision**: Mobile-first Tailwind breakpoints with two navigation chromes:
- **< 768px**: single column, fixed bottom tab bar (4 items, 64px + `env(safe-area-inset-bottom)`), content full-width with 16px gutters
- **≥ 768px (`md`)**: fixed left sidebar (240px, icon + label), content area centred with `max-width: 1100px`
- **Dashboard grid**: 1 column on mobile; 2-column CSS grid at ≥ 1024px (`lg`), with the consistency chart spanning full width
- The `body` keeps `--bg-recessed` backdrop; content surfaces stay `--bg-surface` cards on `--bg-app`

**Rationale**: Bottom tabs are the dominant modern mobile pattern (thumb-reachable, always visible — satisfies FR-001's persistent navigation); a sidebar is the equivalent desktop idiom for dashboard products. A 1100px content cap keeps line lengths and card proportions intentional on large monitors. This supersedes feature 007's fixed 430px shell per clarification.  
**Alternatives considered**:
- Keep 430px phone frame everywhere — rejected by user in clarification
- Top horizontal nav on desktop — viable, but a sidebar scales better to the dashboard-grid layout and reads more "app-like"
- CSS container queries — browser support is fine but plain breakpoints are simpler and sufficient

## 4. Gear Persistence & Migration

**Decision**: New Zustand store `src/store/gearStore.ts` persisted under a new localStorage key `advantage_gear`, following the existing store patterns. `SCHEMA_VERSION` bumps 3 → 4; `migration.ts` gains a step that seeds an empty gear payload (`{ rackets: [], restrings: [] }`) when absent. All existing keys untouched.  
**Rationale**: Matches the established storage/migration architecture (`src/utils/storage.ts`, `src/utils/migration.ts`). The constitution mandates a migration helper whenever the schema changes; an additive migration is the lowest-risk kind. Restrings are stored flat (with `racketId` references) rather than nested inside rackets — simpler updates, and history survives racket retirement naturally.  
**Alternatives considered**:
- Nesting restring history inside each racket object — makes "current setup" trivial but every restring rewrites the racket record and deletion semantics get murky
- Reusing the `advantage_equipment` key — conflates training equipment (dumbbells/bands) with tennis gear; different lifecycles

## 5. String Tension Representation

**Decision**: Tension stored as a number in **lbs** (the dominant convention at stringing shops), one required mains value, optional cross value for hybrid setups. Free-text string names (e.g., "Luxilon ALU Power 1.25").  
**Rationale**: Single-unit storage keeps comparisons and display trivial; lbs is the convention the target user (NA-based) encounters. Free-text names avoid maintaining a string-product database — YAGNI.  
**Alternatives considered**:
- Dual-unit (kg/lbs) with a unit setting — configuration cost without user demand; can be added later without migration pain (additive field)
- Structured string product entity (brand/model/gauge) — over-modelling for a personal log

## 6. Streak Definition

**Decision**: Streak = consecutive **scheduled training days completed**, counted in days, computed on the fly from `completions` + the profile's training days (`src/utils/streak.ts`). Rest days and non-training days never break a streak.  
**Rationale**: Punishing users for rest days is wrong in a training app — the streak must measure adherence to *their* schedule, which is what serves on-court performance (Constitution I, IV). Derivation (not storage) means no new persisted state and no migration.  
**Alternatives considered**:
- Calendar-day streak — breaks on every rest day; demotivating and wrong
- Weekly streak (consecutive weeks hitting plan) — coarser; can complement later, but day-level is more immediate for the dashboard

## 7. Existing-Feature Re-housing

**Decision**: `MainView` is dissolved: its header gives way to the shell chrome; its day tabs / routine / session-equipment / progress content moves into `TrainingView` largely unchanged. `SettingsView` drops its own back-button header and renders as a normal tab destination. `SetupWizard` remains the pre-shell gate, restyled only.  
**Rationale**: FR-002/FR-004 demand zero functional regressions and untouched data. Reusing `DayRoutineView`, `DayTabBar`, `SessionEquipmentBar`, `ProgressView`, and all setup inputs as-is (with styling passes) confines risk to layout, not behaviour. The training engine, stores, and hooks are not modified at all.  
**Alternatives considered**:
- Ground-up rewrite of training screens — maximal regression risk for cosmetic gain; violates Simplicity principle
