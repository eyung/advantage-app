# Data Model: Rally — Tennis-Focused Personal Workout Tracker

**Phase 1 Output** | **Date**: 2026-04-27 | **Plan**: [plan.md](plan.md)

All entities are stored in `localStorage` under the `rally_*` key namespace.
See [contracts/storage-schema.md](contracts/storage-schema.md) for the full key/value layout.

---

## Entities

### TrainingProfile

Represents the user's configuration. There is exactly one profile per app instance.

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | `number` | Schema version for migration detection |
| `weekSchedule` | `DayType[7]` | Day type for each day (Mon–Sun): `tennis` \| `lifting` \| `cardio` \| `rest` |
| `sessionDurations` | `Record<ActivityType, number>` | Session duration in minutes per activity type |
| `exerciseWeights` | `Record<string, number>` | Current working weight (kg) keyed by exercise ID |
| `createdAt` | `string` | ISO 8601 date of first profile creation |
| `updatedAt` | `string` | ISO 8601 date of last profile update |

**Types**:
- `DayType`: `"tennis" | "lifting" | "cardio" | "rest"`
- `ActivityType`: `"tennis" | "lifting" | "cardio"`

**Defaults** (applied on first open):
- `weekSchedule`: `["lifting", "tennis", "lifting", "tennis", "cardio", "tennis", "rest"]` (Mon–Sun)
- `sessionDurations`: `{ tennis: 90, lifting: 60, cardio: 45 }`
- `exerciseWeights`: populated from `defaults.ts` with standard beginner starting weights

**Validation rules**:
- `weekSchedule` MUST have exactly 7 entries
- `sessionDurations` values MUST be > 0 and ≤ 240 (minutes)
- `exerciseWeights` values MUST be ≥ 0 and ≤ 500 (kg)

---

### Exercise (static, not persisted)

Lives in `src/data/exercises.ts`. Never written to localStorage — it is shipped with the app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique exercise identifier (slug, e.g. `lateral-band-walk`) |
| `name` | `string` | Display name |
| `dayType` | `DayType[]` | Which day types this exercise appears in |
| `tennisCategory` | `TennisCategory` | Tennis-performance classification |
| `muscleGroups` | `string[]` | Primary muscles targeted |
| `defaultSets` | `number` | Suggested set count |
| `defaultReps` | `string` | Suggested reps (e.g., `"10–12"`, `"30s"`) |
| `defaultWeight` | `number` | Starting weight suggestion in kg (0 for bodyweight) |
| `equipment` | `string[]` | Required equipment (e.g., `["barbell"]`, `["none"]`) |

**TennisCategory values**: `agility | explosiveness | shoulder | core | mobility | general`

---

### WorkoutPlan (derived, not persisted)

Generated at runtime from `TrainingProfile` + the static exercise library. Recalculated
when the profile changes or a new week begins. Not stored — it is always recomputed.

| Field | Type | Description |
|-------|------|-------------|
| `weekNumber` | `number` | ISO week number (used as generation seed) |
| `year` | `number` | Year |
| `days` | `PlannedDay[7]` | One entry per day of the week |

**PlannedDay**:

| Field | Type | Description |
|-------|------|-------------|
| `date` | `string` | ISO 8601 date string |
| `dayType` | `DayType` | Inherited from `weekSchedule` |
| `exercises` | `PlannedExercise[]` | Empty if day type is `rest` |

**PlannedExercise**:

| Field | Type | Description |
|-------|------|-------------|
| `exerciseId` | `string` | Reference to `Exercise.id` |
| `prescribedSets` | `number` | Sets from plan generator |
| `prescribedReps` | `string` | Reps from plan generator |
| `prescribedWeight` | `number` | Weight from `TrainingProfile.exerciseWeights` |

---

### WorkoutSession

A completed training session (lifting or cardio). Persisted to localStorage.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 |
| `date` | `string` | ISO 8601 date (YYYY-MM-DD) |
| `dayType` | `"lifting" | "cardio"` | Session type |
| `plannedExercises` | `PlannedExercise[]` | The plan that was loaded at session start |
| `logs` | `ExerciseLog[]` | Actual performance logged |
| `durationMinutes` | `number` | Total session duration in minutes |
| `completedAt` | `string` | ISO 8601 timestamp when session was finished |
| `notes` | `string \| null` | Optional user notes |

**State transitions**:
```
not started → in_progress (user opens session screen)
in_progress → completed (user taps "Finish session")
in_progress → abandoned (user navigates away without finishing — session is saved as partial)
```

---

### ExerciseLog

The actual performance record for one exercise within a session.

| Field | Type | Description |
|-------|------|-------------|
| `exerciseId` | `string` | Reference to `Exercise.id` |
| `sets` | `SetLog[]` | One entry per set performed |
| `completed` | `boolean` | Whether the user marked the exercise done |

**SetLog**:

| Field | Type | Description |
|-------|------|-------------|
| `setNumber` | `number` | 1-indexed |
| `reps` | `number` | Actual reps performed |
| `weightKg` | `number` | Actual weight used |

---

### TennisSession

A logged tennis session. Persisted to localStorage separately from WorkoutSession.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID v4 |
| `date` | `string` | ISO 8601 date (YYYY-MM-DD) |
| `durationMinutes` | `number` | Session duration in minutes |
| `notes` | `string \| null` | Optional user notes |
| `completedAt` | `string` | ISO 8601 timestamp |

---

## Relationships

```
TrainingProfile (1)
    ├── generates → WorkoutPlan (derived, 1 per week)
    │       └── contains → PlannedDay[7]
    │               └── contains → PlannedExercise[]
    │                       └── references → Exercise (static library)
    ├── informs weight for → ExerciseLog.sets[].weightKg
    └── weekSchedule → determines day type for WorkoutSession + TennisSession

WorkoutSession (many)
    └── contains → ExerciseLog[]
            └── contains → SetLog[]

TennisSession (many, independent from WorkoutSession)
```

---

## Progress Computation (derived)

Progress stats are computed from persisted session data at read time — not stored.

| Metric | Source | Calculation |
|--------|--------|-------------|
| Weekly consistency | `WorkoutSession` + `TennisSession` | Sessions completed / sessions planned (per week from profile) |
| Weight progression | `ExerciseLog.sets[].weightKg` | Max weight per exercise per week, over time |
| Weekly tennis sessions | `TennisSession` | Count grouped by ISO week |
| Total sessions | Both session types | Aggregate count |
| Current streak | Both session types | Consecutive days with a logged session (any type) |
