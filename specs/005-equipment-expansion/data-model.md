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
  defaultSets: number;
  defaultReps: number;
  goalTags?: ('aesthetics')[];  // NEW — optional secondary goal tags
}
```

**Change**: `equipment` union adds `'resistance-band'` and `'kettlebell'`. New optional `goalTags` field carries secondary goal identifiers. Backward compatible — existing exercises gain no `goalTags` field (treated as empty).

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
