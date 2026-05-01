# Contract: Plan Generator — Equipment & Aesthetics Extensions

## `buildEligiblePool` (modified signature)

```typescript
export function buildEligiblePool(
  allExercises: Exercise[],
  customisation: CustomisationProfile,
  availableEquipmentTypes: EquipmentType[]   // NEW parameter
): Record<TennisCategory, Exercise[]>
```

**Filter logic** (applied before blocked-category check):
1. `excludedSet` from `customisation.excludedExerciseIds`
2. `blockedSet` from `customisation.blockedCategories`
3. `equipmentSet` derived from `availableEquipmentTypes`: always includes `'bodyweight'`; maps each EquipmentType to Exercise.equipment string
4. Per exercise: include iff `!excludedSet.has(e.id) && !blockedSet.has(e.category) && equipmentSet.has(e.equipment)`
5. Empty bucket overflow: unchanged from 004 — filled from all non-empty buckets

**Default**: when called from existing code without the 3rd arg (backward compat), default to `['dumbbells', 'bodyweight']` — preserves existing behavior.

## `generateWeeklyPlan` (modified signature)

```typescript
export function generateWeeklyPlan(
  profile: EquipmentProfile,
  weekISO: string,
  customisation?: CustomisationProfile,
  customExercises?: CustomExercise[],
  availableEquipmentTypes?: EquipmentType[]   // NEW optional parameter
): WeeklyPlan
```

**Aesthetics guarantee** (applied per training day):
- After selecting 5 exercises via `buildTrainingDayFromPool`, check `isAestheticsDay = profile.aestheticsDays.includes(day)`
- If `isAestheticsDay` and no selected exercise has `goalTags?.includes('aesthetics')`:
  1. Find all aesthetics-tagged exercises in the pool (across all categories)
  2. If any exist: seed = `(configVersion * 10000 + weekNum * 100 + dayIndex * 10) >>> 0`; pick one; swap last planned slot
  3. Weight is reassigned for the swapped exercise using the appropriate weight array

## `assignWeight` (modified to handle new equipment types)

```typescript
export function assignWeight(
  exercise: Exercise,
  availableWeights: number[]  // already numeric — caller provides correct array
): number
```

**No signature change** — callers are responsible for providing the right weight array:
- `'dumbbell'` → `profile.dumbbellWeights`
- `'kettlebell'` → `profile.kettlebellWeights`
- `'resistance-band'` → `profile.resistanceBandLevels.map(l => BAND_KG_MAP[l]).sort((a,b)=>a-b)`
- `'bodyweight'` → always returns 0

`BAND_KG_MAP` constant: `{ Light: 5, Medium: 15, Heavy: 30, 'Extra-Heavy': 50 }`

**Display in ExerciseCard**: When `PlannedExercise.weightKg > 0` and the underlying exercise has `equipment === 'resistance-band'`, display as `"${weightKg} kg (band)"`. This requires the exercise lookup in ExerciseCard to check `equipment`.

## `buildTrainingDayFromPool` / `buildSlotsFromPool` (modified weight selection + new parameters)

Updated signature (Session 2026-04-30):

```typescript
export function buildTrainingDayFromPool(
  rand: () => number,
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile,
  avoidMuscleGroup?: Exercise['primaryMuscleGroup']  // NEW — consecutive-day guard
): DayPlan
```

**Selection logic** (applied per category slot):
1. **Consecutive-day guard**: filter pool to exercises where `primaryMuscleGroup !== avoidMuscleGroup`. If filtered pool is empty, use full category pool (graceful fallback).
2. **Pull-preference bias**: from the effective pool, build `pullPool = exercises.filter(isPull)`. If `dayPullCount < dayPushCount && pullPool.length > 0`, select from `pullPool` only. Otherwise select from effective pool.
3. Track `dayPullCount` / `dayPushCount` using `isPull()` / `isPush()` helpers.

**Helper**:

```typescript
function getWeightForExercise(exercise: Exercise, profile: EquipmentProfile): number {
  switch (exercise.equipment) {
    case 'dumbbell': return assignWeight(exercise, profile.dumbbellWeights);
    case 'kettlebell': return assignWeight(exercise, profile.kettlebellWeights);
    case 'resistance-band':
      const bandKg = profile.resistanceBandLevels.map(l => BAND_KG_MAP[l]).sort((a,b)=>a-b);
      return assignWeight(exercise, bandKg.length > 0 ? bandKg : [0]);
    case 'bodyweight': return 0;
  }
}

const isPull = (p: MovementPattern) => p === 'pull-horizontal' || p === 'pull-vertical';
const isPush = (p: MovementPattern) => p === 'push-horizontal' || p === 'push-vertical';
```

## `generateWeeklyPlan` — consecutive-day guard threading (Session 2026-04-30)

The existing `generateWeeklyPlan` loop gains tracking variables:

```typescript
let prevTrainingDay: DayPlan | null = null;
let prevTrainingDayIdx: number | null = null;

// Inside the ALL_DAYS loop:
if (!trainingSet.has(day)) {
  days[day] = { isTrainingDay: false, exercises: [] };
  prevTrainingDay = null;   // rest day clears the guard
  prevTrainingDayIdx = null;
  continue;
}

const avoidMuscleGroup =
  prevTrainingDay !== null && prevTrainingDayIdx === dayIndex - 1
    ? dominantMuscleGroup(prevTrainingDay, exerciseMap)
    : undefined;

let dayPlan = buildTrainingDayFromPool(rand, pool, profile, avoidMuscleGroup);
prevTrainingDay = dayPlan;
prevTrainingDayIdx = dayIndex;
```

Where `dominantMuscleGroup` computes the mode `primaryMuscleGroup` across a day's planned exercises.

## `completionStore.getSessionSummary` (new, Session 2026-04-30)

```typescript
getSessionSummary(date: string): SessionSummary
```

Derives session muscle group data from existing `ExerciseCompletion` records — no new persistence. See `research.md §12` for full implementation.
