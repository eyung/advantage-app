# Data Model: Exercise Customisation

**Feature**: 004-exercise-customisation  
**Date**: 2026-04-28

## New Entities

### CustomExercise

A user-defined exercise stored in `customisationStore`.

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `string` | Required. Prefixed `'custom-'` + UUID v4 truncated to 8 chars. Globally unique. |
| `name` | `string` | Required. 1–60 chars. Must be unique (case-insensitive) within same category across all exercises (built-in + custom). |
| `category` | `TennisCategory` | Required. One of the 5 existing categories. |
| `equipment` | `'dumbbell' \| 'bodyweight'` | Always `'dumbbell'` (set at creation; not configurable by user). |
| `primaryMuscleGroup` | `Exercise['primaryMuscleGroup']` | Derived from `category` at creation time (see category defaults table). Never stored separately by user. |
| `defaultSets` | `number` | Derived from category at creation (see category defaults table). |
| `defaultReps` | `number` | Derived from category at creation (see category defaults table). |
| `createdAt` | `string` | ISO 8601 timestamp. Set at creation; immutable. |

**Category Defaults for Custom Exercises**:

| Category | primaryMuscleGroup | defaultSets | defaultReps |
|----------|--------------------|-------------|-------------|
| `lateral-agility` | `legs` | 3 | 12 |
| `rotational-power` | `core` | 3 | 12 |
| `shoulder-stability` | `shoulders` | 3 | 12 |
| `hiit-stamina` | `full-body` | 4 | 12 |
| `general-strength` | `full-body` | 3 | 10 |

---

### CustomisationState (persisted in `advantage_customisation`)

The shape of the Zustand `customisationStore` persisted slice.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `excludedExerciseIds` | `string[]` | `[]` | IDs of individual exercises (built-in or custom) that should not appear in generated plans. |
| `blockedCategories` | `TennisCategory[]` | `[]` | Categories that are entirely blocked; all exercises in them are treated as excluded. |
| `customExercises` | `CustomExercise[]` | `[]` | User-created exercises. |
| `customisationVersion` | `number` | `0` | Monotonically increasing counter; bumped on any mutation. Used as part of the partial-regen PRNG seed. |

**State transitions**:

```
excludeExercise(id)    → pushes id to excludedExerciseIds, bumps customisationVersion
includeExercise(id)    → removes id from excludedExerciseIds, bumps customisationVersion
blockCategory(cat)     → pushes cat to blockedCategories, bumps customisationVersion
unblockCategory(cat)   → removes cat from blockedCategories, bumps customisationVersion
addCustomExercise(...)  → creates CustomExercise, pushes to customExercises, bumps customisationVersion
deleteCustomExercise(id) → removes from customExercises, removes from excludedExerciseIds if present, bumps customisationVersion
```

---

### PlanState (persisted in `advantage_plan`)

The shape of the Zustand `planStore` persisted slice.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `plan` | `WeeklyPlan \| null` | `null` | The currently applied weekly plan. Null triggers fresh generation on first render. |

**WeeklyPlan** (existing type, unchanged):

```typescript
interface WeeklyPlan {
  weekISO: string;          // e.g. "2026-W18"
  configVersion: number;    // from EquipmentProfile
  days: Record<DayOfWeek, DayPlan>;
}
```

**Staleness rules** — the plan is considered stale and triggers full regeneration when:
- `plan === null`
- `plan.weekISO !== currentWeekISO` (new week started)
- `plan.configVersion !== profile.configVersion` (user changed equipment/days settings)

Otherwise, on `customisationVersion` change, `applyCustomisation` is called (partial regen).

---

## Modified Entities

### `Exercise` (existing, `src/types.ts`) — unchanged

No fields added. `CustomExercise` is a separate type that satisfies the same interface shape so it can be used interchangeably in the plan generator.

### Storage Keys (`src/utils/storage.ts`)

| Key | Store | Schema version | Status |
|-----|-------|----------------|--------|
| `advantage_schema_version` | schema metadata | — | Unchanged |
| `advantage_equipment` | `equipmentStore` | v1 | Unchanged |
| `advantage_completions` | `completionStore` | v1 | Unchanged |
| `advantage_customisation` | `customisationStore` | v2 (NEW) | Added in v2 migration |
| `advantage_plan` | `planStore` | v2 (NEW) | No migration needed; null triggers fresh gen |

### Schema Version: 1 → 2

Migration v2 adds an empty `advantage_customisation` entry. Existing data is untouched.

---

## Derived: ExerciseLibrary

Not persisted — computed at plan-generation time.

```
ExerciseLibrary = merge(builtInExercises, customExercises)
  .filter(e => !excludedExerciseIds.includes(e.id))
  .filter(e => !blockedCategories.includes(e.category))
```

Split into per-category buckets for use by the plan generator. If a category bucket is empty, the generator pulls from the "overflow" bucket (union of all non-empty buckets).
