# Research: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Generated**: 2026-04-27  
**Feature**: [spec.md](./spec.md)

---

## Decision 1: State Management — Zustand with Persist

**Decision**: Retain Zustand 4 with `persist` middleware, splitting into two stores: `equipmentStore` (config) and `completionStore` (history).

**Rationale**: Already in use for feature 001; the engine/data separation maps cleanly to two independent stores. `equipmentStore` persists the active EquipmentProfile (including a `configVersion` integer that increments on each save); `completionStore` is append-only and never cleared on reconfiguration. Zustand's subscribe selector makes it trivial for `useWeekPlan` to regenerate the plan when `configVersion` changes.

**Alternatives considered**:
- Single combined store: rejected — creates tight coupling between engine inputs and completion history, violating FR-011.
- IndexedDB: overkill for single-user local data with no query complexity; localStorage is sufficient at this scale.

---

## Decision 2: Plan Generation — Deterministic Seeded PRNG per ISO Week

**Decision**: Reuse the Mulberry32 PRNG approach from feature 001. Seed = `equipmentProfile.configVersion * 10000 + isoWeekNumber`. Same config + same week always produces the same plan.

**Rationale**: Determinism is required by the spec ("same config always produces the same plan for a given week"). Seeding on configVersion ensures regeneration after a config change even within the same ISO week.

**Alternatives considered**:
- Truly random per generation: rejected — spec explicitly requires determinism.
- Stored plan (persisted after generation): rejected — adds unnecessary data layer; derive on demand from config.

---

## Decision 3: Weight Assignment Strategy

**Decision**: `weightAssigner.ts` maps each exercise's muscle group to a fraction of the user's heaviest dumbbell. Strength level thresholds (beginner ≤10 kg, intermediate 11–20 kg, advanced >20 kg) from the spec assumptions are used to pick a percentage band per exercise type, then the nearest available weight is selected.

**Rationale**: The spec defines these thresholds explicitly. The nearest-available-weight approach guarantees FR-004 (all weights from user's list). Pure function: inputs = exercise + available weights + heaviest weight; output = prescribed weight in kg.

**Alternatives considered**:
- Fixed percentage lookup table: simpler but produces identical weight for all exercises regardless of muscle group. Rejected for lack of tennis-specific nuance.
- User-entered per-exercise weights (feature 001 approach): rejected — feature 002 explicitly removes manual weight entry in favour of auto-assignment.

---

## Decision 4: Completion Scoping — ISO Week Key

**Decision**: Each ExerciseCompletion record includes a `weekISO` field (`YYYY-Www` format, e.g., `2026-W17`). The `useCompletions` hook filters to the current ISO week for the weekly view; all records feed the Progress dashboard.

**Rationale**: The spec clarified that completions reset each ISO week (checkmarks start fresh Monday). The `weekISO` field is a free-form archive tag — no data is deleted. Querying by `weekISO` is O(n) across all completions, acceptable for local single-user data.

**Alternatives considered**:
- Delete old completions on week rollover: rejected — spec explicitly requires history preservation for Progress (SC-006, FR-012, FR-013).
- Store completions by week bucket in a map: more complex serialization; linear scan is sufficient at this scale.

---

## Decision 5: Exercise Library — Tennis-Specific, Dumbbell-Only

**Decision**: Build a new exercise library in `src/data/exercises.ts` (~50 exercises) categorised into the five feature-002 categories: `lateral-agility`, `rotational-power`, `shoulder-stability`, `hiit-stamina`, `general-strength`. All weighted exercises use dumbbells only; bodyweight exercises have `equipment: "bodyweight"`.

**Rationale**: Feature 002 replaces the 6-category feature-001 library. The plan generator must cover ≥3 of the 5 categories per training day (FR-005). Bodyweight exercises guarantee valid plans even when only one dumbbell weight is available (edge case in spec).

**Alternatives considered**:
- Reuse feature-001 exercise library: category taxonomy differs (6 vs 5 categories, different naming); reuse would require a mapping shim and add coupling. Clean replacement is simpler.

---

## Decision 6: Routing — Conditional Rendering, No React Router

**Decision**: Remove React Router from feature 002. `App.tsx` renders `SetupWizard` or the main view based on `equipmentStore.isConfigured`. Within the main view, the selected day tab is local state (`useState`). The Progress section is a bottom-tab toggle in local state.

**Rationale**: The spec describes a one-page app. Hash routing added navigation complexity without user benefit in this design. Browser back-button expectations don't apply to a single-screen fitness tracker used on mobile.

**Alternatives considered**:
- Keep React Router: adds dependency complexity, router state management, and deep-link setup for no user-visible benefit. Rejected.

---

## Decision 7: Setup Wizard Gate Pattern

**Decision**: `App.tsx` reads `equipmentStore.isConfigured` (boolean derived from having ≥1 dumbbell weight and 3–6 training days saved). If false, renders `SetupWizard` full-screen. SetupWizard calls `equipmentStore.saveConfig()` on submit; `isConfigured` becomes true; `App.tsx` re-renders to main view. No dismissal mechanism exists in `SetupWizard`.

**Rationale**: Spec clarification Q5 mandated a full-screen setup wizard that cannot be dismissed until both fields are saved. Conditional render in App.tsx is the simplest implementation.

---

## Decision 8: Progressive Overload Architecture (Forward Compatibility)

**Decision**: `ExerciseCompletion` stores `repsPerSet: number[]` (one entry per set completed). The completion store exposes a `getCompletionHistory(exerciseId)` selector that returns all historical records sorted by date. A future progressive overload module can read this history to decide when to increase volume or weight.

**Rationale**: FR-006a requires the architecture to support future auto-progression. Storing repsPerSet[] now costs nothing but unlocks the capability. The field must be written even in v1 (set to actual reps logged by the user when they mark complete).

**v1 behaviour**: On "Complete" tap, the system records the prescribed reps for each set as the default (since v1 does not prompt for actual reps). The data structure is correct; actual per-rep logging can be added without schema migration.
