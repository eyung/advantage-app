# Data Model: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Generated**: 2026-04-27  
**Feature**: [spec.md](./spec.md)

---

## Entities

### EquipmentProfile

The user's current configuration. Persisted in `equipmentStore` under the `rally_equipment` localStorage key.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `dumbbellWeights` | `number[]` | min length 1; each > 0; sorted ascending | Available weights in kg |
| `trainingDays` | `DayOfWeek[]` | length 3–6; each unique | e.g. `["Mon","Wed","Fri","Sat"]` |
| `configVersion` | `number` | integer ≥ 1; auto-increment on each save | Used as PRNG seed component |
| `savedAt` | `string` | ISO 8601 datetime | Timestamp of last save |

**Derived**: `isConfigured: boolean` — true when `dumbbellWeights.length ≥ 1` AND `trainingDays.length` is 3–6. Computed at query time; not persisted.

**State transitions**:
- Initial state: no record exists → `isConfigured = false` → SetupWizard shown
- After first save: record exists, `configVersion = 1` → `isConfigured = true`
- On reconfigure: same record updated, `configVersion` incremented → plan regenerates

---

### WeeklyPlan *(derived, not persisted)*

Generated on demand by `engine/planGenerator.ts`. Never stored; derived from the current EquipmentProfile + current ISO week number.

| Field | Type | Notes |
|-------|------|-------|
| `weekISO` | `string` | `YYYY-Www` format, e.g. `2026-W17` |
| `configVersion` | `number` | Snapshot of EquipmentProfile.configVersion at generation time |
| `days` | `Record<DayOfWeek, DayPlan>` | Keyed by Mon–Sun |

**DayPlan**:

| Field | Type | Notes |
|-------|------|-------|
| `isTrainingDay` | `boolean` | |
| `exercises` | `PlannedExercise[]` | Empty array when `isTrainingDay = false` |

---

### PlannedExercise *(derived, not persisted)*

One exercise within a training day, as returned by the engine.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `exerciseId` | `string` | Must exist in exercises.ts | |
| `category` | `TennisCategory` | One of 5 categories | |
| `sets` | `number` | 2–5 | |
| `reps` | `number` | 6–20 | |
| `weightKg` | `number` | Must be in EquipmentProfile.dumbbellWeights, or 0 for bodyweight | |

---

### ExerciseCompletion *(persisted)*

A record that the user completed (or toggled off) a specific exercise. Persisted in `completionStore` under the `rally_completions` localStorage key. **Never deleted.**

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `string` | UUID v4; unique | |
| `exerciseId` | `string` | Exercise reference; may not exist in current plan | |
| `date` | `string` | ISO date `YYYY-MM-DD` | Calendar date of completion |
| `weekISO` | `string` | `YYYY-Www` | ISO week for weekly-view scoping |
| `weightKg` | `number` | ≥ 0 (0 = bodyweight) | Weight actually used |
| `setsCompleted` | `number` | ≥ 1 | |
| `repsPerSet` | `number[]` | Length = setsCompleted; each ≥ 1 | Enables future progressive overload |
| `completedAt` | `string` | ISO 8601 datetime | Wall-clock timestamp |

**Toggle behaviour**: When the user taps "Complete" a second time within the current ISO week, the existing record is **removed** from the store (not soft-deleted). Only one completion record per `(exerciseId, date)` pair exists at any time.

---

### PersonalBest *(derived, not persisted)*

Computed at query time from ExerciseCompletion records.

| Field | Type | Notes |
|-------|------|-------|
| `exerciseId` | `string` | |
| `exerciseName` | `string` | Looked up from exercises.ts |
| `maxWeightKg` | `number` | MAX(weightKg) across all ExerciseCompletion for this exerciseId |
| `achievedOn` | `string` | Date of the completion that set the personal best |

---

## Types

```typescript
type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type TennisCategory =
  | "lateral-agility"
  | "rotational-power"
  | "shoulder-stability"
  | "hiit-stamina"
  | "general-strength";

interface Exercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: "dumbbell" | "bodyweight";
  primaryMuscleGroup: string;   // used by weightAssigner
  defaultSets: number;
  defaultReps: number;
}

interface EquipmentProfile {
  dumbbellWeights: number[];
  trainingDays: DayOfWeek[];
  configVersion: number;
  savedAt: string;
}

interface PlannedExercise {
  exerciseId: string;
  category: TennisCategory;
  sets: number;
  reps: number;
  weightKg: number;
}

interface DayPlan {
  isTrainingDay: boolean;
  exercises: PlannedExercise[];
}

interface WeeklyPlan {
  weekISO: string;
  configVersion: number;
  days: Record<DayOfWeek, DayPlan>;
}

interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  date: string;
  weekISO: string;
  weightKg: number;
  setsCompleted: number;
  repsPerSet: number[];
  completedAt: string;
}
```

---

## localStorage Schema

| Key | Type | Notes |
|-----|------|-------|
| `rally_equipment` | `EquipmentProfile \| null` | Null = first-time user |
| `rally_completions` | `ExerciseCompletion[]` | Append-only; never truncated |
| `rally_schema_version` | `number` | Schema migration sentinel; v1 baseline |

---

## Relationships

```
EquipmentProfile ──(input to)──▶ engine/planGenerator ──▶ WeeklyPlan
                                                                │
                                                         PlannedExercise[]
                                                                │
                                              user taps "Complete"
                                                                │
                                                         ExerciseCompletion (persisted)
                                                                │
                                            ┌───────────────────┤
                                            ▼                   ▼
                                    WeeklyView             PersonalBest
                                 (current weekISO)       (all history)
```

ExerciseCompletion references `exerciseId` from the static exercises library and is independent of WeeklyPlan. If a plan regeneration removes an exercise, its completions remain in history (they are "orphaned" from the active plan but still appear in Progress).
