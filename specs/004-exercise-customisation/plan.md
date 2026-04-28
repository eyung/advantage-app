# Implementation Plan: Exercise Customisation

**Branch**: `004-exercise-customisation` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/004-exercise-customisation/spec.md`

## Summary

Adds per-exercise exclusion, per-category blocking, custom exercise creation, and exclusion-aware plan regeneration that only replaces incomplete training day slots. The plan generator gains an eligible pool abstraction; a new persistent plan store replaces the ephemeral computed plan so completed days are never altered retroactively.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: React 18, Zustand 5 (persist middleware), Vite 5, uuid (already installed)  
**Storage**: localStorage via Zustand `persist` middleware — new `advantage_customisation` and `advantage_plan` keys  
**Testing**: N/A — no tests requested in spec  
**Target Platform**: Browser SPA, same as existing app  
**Project Type**: React SPA feature extension  
**Performance Goals**: Partial regeneration completes synchronously (no noticeable lag); same performance profile as existing full-plan generation  
**Constraints**: offline-first, localStorage-only, no new npm dependencies required  
**Scale/Scope**: At most 50 built-in + N custom exercises; at most 7 training days/week

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-First, Tennis-Performance-Led | ✅ Pass | Per-exercise exclusion directly serves injury/recovery needs; custom exercises extend tennis-specific training |
| II. Offline-First, Zero Backend | ✅ Pass | All state in localStorage via Zustand persist; no network calls |
| III. Sensible Defaults, Optional Configuration | ✅ Pass | Existing plan works unchanged without any customisation; all features are opt-in |
| IV. Visible Progress | ✅ Pass | Exclusion state shown on card inline; completed workouts preserved |
| V. Simplicity Over Completeness | ✅ Pass | Minimal UI additions; no new npm dependencies; no weight/sets config for custom exercises |
| Technology: React SPA + localStorage | ✅ Pass | Follows existing patterns exactly |
| UI: no emoji, design system tokens | ✅ Pass | Will use existing Icon component and CSS custom properties |
| Migration: schema change requires helper | ✅ Pass | Schema v1→v2 migration added (see migration.ts plan) |

**No violations. All gates clear.**

## Project Structure

### Documentation (this feature)

```text
specs/004-exercise-customisation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # /speckit-tasks output
```

### Source Code Changes

```text
src/
├── types.ts                               [MODIFY] add CustomExercise, CustomisationProfile
├── data/
│   └── exercises.ts                       [MODIFY] add getExerciseLibrary() merge fn + category defaults
├── engine/
│   └── planGenerator.ts                   [MODIFY] eligible-pool abstraction + partial regen
├── store/
│   ├── customisationStore.ts              [NEW] exclusions, blocks, custom exercises
│   ├── planStore.ts                       [NEW] persisted WeeklyPlan + selective regen action
│   ├── completionStore.ts                 [UNMODIFIED]
│   └── equipmentStore.ts                  [UNMODIFIED]
├── hooks/
│   └── useWeekPlan.ts                     [MODIFY] read from planStore instead of computing
├── components/
│   ├── exercise/
│   │   └── ExerciseCard.tsx               [MODIFY] inline quick-exclude button
│   ├── settings/
│   │   ├── ExerciseManagement.tsx         [NEW] full management UI
│   │   └── AddExerciseForm.tsx            [NEW] custom exercise creation form
│   └── setup/
│       └── SettingsView.tsx               [MODIFY] add Exercise Management entry point
└── utils/
    ├── storage.ts                         [MODIFY] new keys + SCHEMA_VERSION bump to 2
    └── migration.ts                       [MODIFY] add v2 migration step
```

---

## Phase 0: Research

### Decision 1: Plan Storage Strategy

**Decision**: Persist the weekly plan in localStorage via a new `planStore` (Zustand + persist).

**Rationale**: Selective regeneration requires knowing the prior plan for each day so completed exercises can be preserved. Without persistence, a full regeneration on every render would overwrite completed day structure. The stored plan is the single source of truth; the plan generator only writes to it via explicit actions.

**Alternatives considered**:
- *Re-derive from completions + seed*: Theoretically possible but requires matching PRNG stream positions to individual exercises, which is fragile and couples generator internals to the store.
- *Freeze completed days in customisationStore*: Mixes concerns; the plan store is a cleaner separation.

### Decision 2: PRNG for Partial Regeneration

**Decision**: For incomplete slots in a partially-completed day, use a new seed per regen event: `customisationVersion * 100000 + dayIndex * 1000 + slotIndex`. This seed is derived from the `customisationStore.customisationVersion` counter, which is bumped on every exclusion/block/custom-exercise change.

**Rationale**: The original full-plan PRNG is a sequential stream — re-using it for partial slot picks is impossible without replaying the full stream. A slot-indexed seed gives deterministic but independent picks per slot per regen event.

**Alternatives considered**:
- *Replay full stream and skip completed positions*: Brittle if exercises are added/removed mid-stream.
- *Random (non-deterministic)*: Violates the existing determinism principle.

### Decision 3: Custom Exercise Defaults

**Decision**: When adding a custom exercise, `equipment` defaults to `'dumbbell'` and `primaryMuscleGroup` is derived from category:

| Category | Default primaryMuscleGroup | defaultSets | defaultReps |
|----------|---------------------------|-------------|-------------|
| `lateral-agility` | `legs` | 3 | 12 |
| `rotational-power` | `core` | 3 | 12 |
| `shoulder-stability` | `shoulders` | 3 | 12 |
| `hiit-stamina` | `full-body` | 4 | 12 |
| `general-strength` | `full-body` | 3 | 10 |

**Rationale**: weightAssigner.ts needs `primaryMuscleGroup` and `equipment` to compute a weight. Category-based defaults match the dominant muscle group of each category in the existing library. Sets/reps are per-category averages. This requires zero UI from the user.

**Alternatives considered**:
- *Ask user for muscle group*: Unnecessary complexity; users just want to add an exercise by name and movement type.
- *Always bodyweight*: Misses the dumbbell exercises the user most likely wants to customise.

### Decision 4: Eligible Pool Construction

**Decision**: The eligible pool is computed as:
```
eligiblePool[cat] = [...builtInExercises, ...customExercises]
  .filter(e => !excludedExerciseIds.has(e.id))
  .filter(e => !blockedCategories.has(e.category))
  .filter(e => e.category === cat)
```

When a category slot has an empty eligible pool, substitute from the union of all non-empty category pools (pick the fullest non-blocked category, then draw randomly from it).

**Rationale**: Matches FR-007 and edge case handling. The substitution prevents empty days when a category is fully blocked.

### Decision 5: "Day Complete" Determination

**Decision**: A training day (identified by its DayOfWeek index) is considered "complete" if every `PlannedExercise.exerciseId` in the stored plan has a completion record with the matching ISO date. It is "partially complete" if at least one (but not all) exercise IDs have completions. The ISO date for each DayOfWeek is derived via `getWeekDates(new Date())`.

**Rationale**: Completions already store `exerciseId + date`; we cross-reference against the stored plan's exercise list to determine lock status. No new fields needed.

---

## Phase 1: Design & Contracts

See `data-model.md`, `contracts/`, and `quickstart.md` in this directory.

---

## Implementation Details

### New Type: `CustomExercise` (`src/types.ts`)

```typescript
export interface CustomExercise {
  id: string;                       // 'custom-' + uuid4 prefix
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight';
  primaryMuscleGroup: Exercise['primaryMuscleGroup'];
  defaultSets: number;
  defaultReps: number;
  createdAt: string;                // ISO timestamp
}

export interface CustomisationProfile {
  excludedExerciseIds: string[];    // built-in or custom IDs
  blockedCategories: TennisCategory[];
  customisationVersion: number;     // bumped on every change; drives regen seed
}
```

### New Store: `customisationStore.ts`

```typescript
// Zustand + persist, key: 'advantage_customisation'
interface CustomisationState {
  excludedExerciseIds: string[];
  blockedCategories: TennisCategory[];
  customExercises: CustomExercise[];
  customisationVersion: number;
  // Actions
  excludeExercise: (id: string) => void;
  includeExercise: (id: string) => void;
  blockCategory: (cat: TennisCategory) => void;
  unblockCategory: (cat: TennisCategory) => void;
  addCustomExercise: (name: string, category: TennisCategory) => void;
  deleteCustomExercise: (id: string) => void;
}
```

Every mutating action bumps `customisationVersion`. The `planStore` subscribes to this store and triggers partial regeneration on version change.

### New Store: `planStore.ts`

```typescript
// Zustand + persist, key: 'advantage_plan'
interface PlanState {
  plan: WeeklyPlan | null;
  generateFresh: (profile: EquipmentProfile, customisation: CustomisationProfile, customExercises: CustomExercise[]) => void;
  applyCustomisation: (
    profile: EquipmentProfile,
    customisation: CustomisationProfile,
    customExercises: CustomExercise[],
    completions: ExerciseCompletion[],
    weekDates: string[]        // Mon=weekDates[0] … Sun=weekDates[6]
  ) => void;
}
```

`applyCustomisation` logic:
1. If `plan === null` or `plan.weekISO !== currentWeek`: call `generateFresh` and return.
2. For each training day: determine `dayDate = weekDates[dayIndex]`.
3. Compute `completedIds = new Set(completions.filter(c => c.date === dayDate).map(c => c.exerciseId))`.
4. If `completedIds.size === day.exercises.length`: day is complete → skip.
5. If `completedIds.size === 0`: day is incomplete → regenerate entirely.
6. Else: day is partial → keep completed PlannedExercise entries; replace the rest from eligible pool.

### Plan Generator Refactor (`planGenerator.ts`)

New exports:
```typescript
// Build the filtered pool per category
export function buildEligiblePool(
  allExercises: Exercise[],           // built-in + custom merged
  customisation: CustomisationProfile
): Record<TennisCategory, Exercise[]>

// Build a full training day from a pool (replaces buildTrainingDay)
export function buildTrainingDayFromPool(
  rand: () => number,
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile
): DayPlan

// Build only specified slots (for partial regen)
export function buildSlotsFromPool(
  seeds: { dayIndex: number; slotIndex: number; customisationVersion: number }[],
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile,
  existingDay: DayPlan,
  completedIds: Set<string>
): DayPlan
```

`generateWeeklyPlan` signature unchanged externally; internally calls `buildTrainingDayFromPool`.

A new overload accepts `customisation + customExercises`:
```typescript
export function generateWeeklyPlan(
  profile: EquipmentProfile,
  weekISO: string,
  customisation?: CustomisationProfile,
  customExercises?: CustomExercise[]
): WeeklyPlan
```

### `useWeekPlan` Hook Rewrite

```typescript
export function useWeekPlan(): WeeklyPlan | null {
  const profile = useEquipmentStore(s => s.profile);
  const plan = usePlanStore(s => s.plan);
  const generateFresh = usePlanStore(s => s.generateFresh);
  const applyCustomisation = usePlanStore(s => s.applyCustomisation);
  const customisation = useCustomisationStore(s => s.getProfile());
  const customExercises = useCustomisationStore(s => s.customExercises);
  const customisationVersion = useCustomisationStore(s => s.customisationVersion);
  const completions = useCompletionStore(s => s.completions);
  const weekISO = getCurrentISOWeek();
  const weekDates = useMemo(() => getWeekDates(new Date()), [weekISO]);

  useEffect(() => {
    if (!profile || !profile.dumbbellWeights.length) return;
    if (!plan || plan.weekISO !== weekISO || plan.configVersion !== profile.configVersion) {
      generateFresh(profile, customisation, customExercises);
    } else {
      applyCustomisation(profile, customisation, customExercises, completions, weekDates);
    }
  }, [profile?.configVersion, customisationVersion, weekISO]);

  return plan;
}
```

### Inline Quick-Exclude on ExerciseCard

Add a secondary action button to `ExerciseCard`:
- Position: top-right corner of card header area (alongside the existing completion badge)
- Icon: `<Icon name="x" size={14}>` with `aria-label="Exclude exercise"`
- Color: `var(--fg-tertiary)` by default; `var(--color-forest-700)` when excluded (showing re-include icon or different state)
- On click: calls `customisationStore.excludeExercise(exerciseId)` and triggers `planStore.applyCustomisation`
- When excluded: card shows a muted "excluded" state with `<Icon name="plus" size={14}>` to re-include

### SettingsView Exercise Management Entry

Add an "Exercise Management" section card to `SettingsView.tsx` that navigates to (or expands inline) the `ExerciseManagement` component.

### ExerciseManagement Component

Full-screen or modal-style panel with:
1. **Category sections**: Each of the 5 TennisCategories shows a toggle (block/unblock). Blocked categories are visually muted.
2. **Exercise list per category**: Each exercise shows its name + an exclude/include toggle icon.
3. **Custom exercises**: Tagged with a `[Custom]` badge; have a delete (trash) icon.
4. **Add Exercise button**: Opens `AddExerciseForm`.
5. **Empty state**: If all categories blocked, shows warning message.

### AddExerciseForm Component

Inline form or modal:
- Text input: "Exercise name" (required, max 60 chars)
- Category selector: 5 radio/button options (TennisCategory)
- Confirm button: disabled if name is empty or duplicates existing name in same category (case-insensitive)
- Cancel button

### Storage Keys and Migration

`storage.ts` additions:
```typescript
export const SCHEMA_VERSION = 2;

export const KEYS = {
  schemaVersion: 'advantage_schema_version',
  equipment: 'advantage_equipment',
  completions: 'advantage_completions',
  customisation: 'advantage_customisation',   // NEW
  plan: 'advantage_plan',                     // NEW
} as const;
```

`migration.ts` v2 step: initialise `advantage_customisation` to empty defaults if not present. `advantage_plan` has no migration (empty plan is fine; it will regenerate on first render).

```typescript
2: (data) => {
  if (!data[KEYS.customisation]) {
    data[KEYS.customisation] = JSON.stringify({
      state: { excludedExerciseIds: [], blockedCategories: [], customExercises: [], customisationVersion: 0 },
      version: 0,
    });
  }
  return data;
},
```
