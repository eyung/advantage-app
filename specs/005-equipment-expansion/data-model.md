# Data Model: Equipment Expansion

## Modified Entities

### `Exercise` (modified)

```typescript
interface Exercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight' | 'resistance-band' | 'kettlebell';  // extended
  primaryMuscleGroup: 'legs' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full-body';
  movementPattern: MovementPattern;  // NEW (Session 2026-04-30) — required field
  defaultSets: number;
  defaultReps: number;
  goalTags?: ('aesthetics')[];  // optional secondary goal tags
}
```

**Changes**:
- `equipment` union adds `'resistance-band'` and `'kettlebell'`.
- `goalTags` field carries secondary goal identifiers. Backward compatible (treated as empty when absent).
- `movementPattern` is a **required** field added to support pull-preference bias (FR-017) and consecutive-day guard (FR-018). All 72 existing exercises must be tagged; all new exercises must include it.

### `CustomExercise` (modified)

```typescript
interface CustomExercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight';  // unchanged — custom exercises stay dumbbell/bodyweight
  primaryMuscleGroup: Exercise['primaryMuscleGroup'];
  defaultSets: number;
  defaultReps: number;
  createdAt: string;
  goalTags?: ('aesthetics')[];  // NEW — optional aesthetics tag at creation time
}
```

### `EquipmentProfile` (modified)

```typescript
interface EquipmentProfile {
  dumbbellWeights: number[];
  kettlebellWeights: number[];           // NEW — one or more kg values
  resistanceBandLevels: ResistanceBandLevel[];  // NEW — subset of all 4 levels
  trainingDays: DayOfWeek[];
  aestheticsDays: DayOfWeek[];           // NEW — which training days include aesthetics exercises
  defaultEquipmentTypes: EquipmentType[];  // NEW — persisted default for session availability
  configVersion: number;
  savedAt: string;
}
```

**Migration**: v3 migration adds `kettlebellWeights: []`, `resistanceBandLevels: []`, `aestheticsDays: []`, `defaultEquipmentTypes: ['dumbbells', 'bodyweight']` to existing stored profiles.

## New Types

### `MovementPattern` (Session 2026-04-30)

```typescript
type MovementPattern =
  | 'push-horizontal'   // bench press, push-ups, chest fly
  | 'push-vertical'     // overhead press, push press, KB press, thruster
  | 'pull-horizontal'   // rows, face pull, band seated row, inverted row
  | 'pull-vertical'     // band lat pulldown, band straight-arm pulldown
  | 'hinge'             // deadlift, RDL, KB swing, clean, snatch
  | 'squat'             // goblet squat, lunge, jump squat
  | 'rotation'          // woodchop, Russian twist, windmill, TGU
  | 'lateral'           // lateral shuffle, carioca, band walks
  | 'carry'             // suitcase carry
  | 'other';            // HIIT, isometric holds, uncategorised
```

**Pull/Push classification** used by engine bias logic:
- "pull" = `pull-horizontal | pull-vertical`
- "push" = `push-horizontal | push-vertical`

### `SessionSummary` (Session 2026-04-30)

Derived type — not persisted; computed from `ExerciseCompletion` records by `completionStore.getSessionSummary(date)`.

```typescript
interface SessionSummary {
  date: string;                                        // ISO date (YYYY-MM-DD)
  exerciseIds: string[];                               // IDs of completed exercises
  muscleGroups: Exercise['primaryMuscleGroup'][];      // unique muscle groups trained
}
```

**Purpose**: Phase 2 adaptive scheduling foundation. Enables the plan engine to query historical muscle group training without a separate persistence layer.

### `ResistanceBandLevel`

```typescript
type ResistanceBandLevel = 'Light' | 'Medium' | 'Heavy' | 'Extra-Heavy';
```

**Kg mapping** (display/weight-assignment only):

| Level | Kg Equivalent |
|-------|-------------|
| Light | 5 |
| Medium | 15 |
| Heavy | 30 |
| Extra-Heavy | 50 |

### `EquipmentType`

```typescript
type EquipmentType = 'dumbbells' | 'resistance-bands' | 'kettlebells' | 'bodyweight';
```

Maps to `Exercise.equipment`:
- `'dumbbells'` → `'dumbbell'`
- `'resistance-bands'` → `'resistance-band'`
- `'kettlebells'` → `'kettlebell'`
- `'bodyweight'` → always eligible (cannot be deselected)

## New Entities

### `SessionEquipmentAvailability`

```typescript
interface SessionEquipmentAvailability {
  availableTypes: EquipmentType[];
  date: string;  // ISO date (YYYY-MM-DD) — stale if ≠ today, resets to default
}
```

**Lifecycle**: Persisted in `advantage_session_equipment`. Ephemeral in behavior — the `sessionEquipmentStore` auto-resets to `profile.defaultEquipmentTypes` when `date` does not match today's ISO date. The default is always persisted in `EquipmentProfile.defaultEquipmentTypes`.

## Storage Keys (updated)

| Key | Description | Schema Version |
|-----|-------------|---------------|
| `advantage_schema_version` | Current schema version (3 after this feature) | existing |
| `advantage_equipment` | `EquipmentProfile` | extended (v3) |
| `advantage_completions` | `ExerciseCompletion[]` | unchanged |
| `advantage_customisation` | Zustand persist envelope for `CustomisationState` | unchanged |
| `advantage_plan` | Zustand persist envelope for `PlanState` | unchanged |
| `advantage_session_equipment` | `SessionEquipmentAvailability` | NEW (v3) |

## Derived Values (not stored)

- **Band kg array**: `resistanceBandLevels.map(level => BAND_KG_MAP[level]).sort()` — computed on demand for weight assignment
- **Eligible equipment filter**: computed from `SessionEquipmentAvailability.availableTypes` + always-available `'bodyweight'` — passed to `buildEligiblePool`
- **Is aesthetics day**: `profile.aestheticsDays.includes(dayOfWeek)` — computed in plan generator per day
