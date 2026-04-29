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

## `buildTrainingDayFromPool` / `buildSlotsFromPool` (modified weight selection)

Both functions currently call `assignWeight(exercise, profile.dumbbellWeights)`. Replace with a helper:

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
```

Both functions call `getWeightForExercise(exercise, profile)` instead of `assignWeight(exercise, profile.dumbbellWeights)`.
