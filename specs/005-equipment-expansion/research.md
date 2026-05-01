# Research: Equipment Expansion

## 1. Resistance Band Weight Representation

**Decision**: Map categorical levels to numeric kg equivalents for internal weight display: Light→5 kg, Medium→15 kg, Heavy→30 kg, Extra-Heavy→50 kg. Display suffix "(band)" distinguishes from dumbbell weights.

**Rationale**: The existing `assignWeight(exercise, availableWeights[])` function takes a numeric array and applies the BANDS fraction table. By converting band levels to this array, the same function handles band weight selection without modification. The kg values are display hints only (per spec assumption §Assumptions), not physiological targets.

**Alternatives considered**:
- Separate band weight selector function — rejected (duplication; BANDS table already encodes muscle-group-appropriate fractions)
- Storing only the categorical label in PlannedExercise — rejected (breaks the existing numeric `weightKg` contract on PlannedExercise; UI would need special-casing everywhere)

## 2. Kettlebell Weight Assignment

**Decision**: Reuse `assignWeight(exercise, profile.kettlebellWeights)` exactly as dumbbells. The `BANDS` fraction table applies identically since kettlebell exercises target the same muscle groups.

**Rationale**: Kettlebells are numeric kg (same model as dumbbells per spec). The `assignWeight` function is equipment-agnostic — it only cares about the weight array and muscle group. No changes required.

**Alternatives considered**: None — the symmetry with dumbbells is explicit in the spec.

## 3. Equipment Filter in `buildEligiblePool`

**Decision**: Add `availableEquipmentTypes: EquipmentType[]` parameter to `buildEligiblePool`. Inside: build a `Set<Exercise['equipment']>` from the parameter. Bodyweight is always in the set. Filter condition: `e.equipment === 'bodyweight' || equipmentSet.has(e.equipment)`.

**Mapping** (`EquipmentType` → `Exercise['equipment']`):
- `'dumbbells'` → `'dumbbell'`
- `'resistance-bands'` → `'resistance-band'`
- `'kettlebells'` → `'kettlebell'`
- `'bodyweight'` → always present (cannot be deselected)

**Rationale**: This is a pure additive constraint alongside the existing `excludedExerciseIds` and `blockedCategories` filters. The overflow fallback (fill empty buckets from non-empty ones) remains unchanged — if a category has no eligible exercises after equipment filtering, it uses the overflow pool (which may still have bodyweight exercises).

## 4. Aesthetics Day Guarantee

**Decision**: After `buildTrainingDayFromPool` produces the 5-exercise plan for a day, apply a post-process if the day is in `profile.aestheticsDays`:
1. Check if any `plannedExercise.exerciseId` maps to an exercise with `goalTags.includes('aesthetics')`.
2. If none do, collect all aesthetics-tagged exercises from the eligible pool (across all categories).
3. Seed a PRNG with `(configVersion * 10000 + weekNum * 100 + dayIndex * 10)` and pick one.
4. Swap the last slot with this exercise.

**Rationale**: Separating the guarantee from the selection loop keeps `buildTrainingDayFromPool` simple. The swap only fires when needed. The dedicated seed formula ensures the swap is deterministic without interfering with the main day PRNG stream.

**Alternative rejected**: Reserving a fixed "aesthetics slot" in the category order — would break the existing category-rotation logic and force aesthetics exercises into one category.

## 5. Session Equipment Availability — Daily Reset Pattern

**Decision**: `sessionEquipmentStore` stores `{ availableTypes: EquipmentType[], date: string }` in `advantage_session_equipment`. A `getAvailable(defaultTypes: EquipmentType[]): EquipmentType[]` selector compares `date` to `todayISO()`: if stale, returns `defaultTypes` (and resets the stored value); otherwise returns `availableTypes`.

**Rationale**: This implements the spec requirement "Per-session availability resets to default on each new day" without a background timer. The check is lazy (on-read), which is safe for a single-user browser app — the user cannot be mid-session across a calendar day boundary in a meaningful way.

**Alternatives considered**:
- React `useEffect` with a daily-reset timer — over-engineered for a single-user SPA; unnecessary complexity
- Storing session availability in component state only — would lose the selection if the user navigates away

## 6. `CustomExercise` — Aesthetics Tag Only

**Decision**: Add `goalTags?: ('aesthetics')[]` to `CustomExercise`. `addCustomExercise` gains an optional `goalTags` parameter. No new equipment types for custom exercises.

**Rationale**: Spec assumption explicitly limits the custom exercise form change to an aesthetics checkbox. Allowing custom band/kettlebell exercises would require the session equipment filter to also check profile ownership (does the user have bands configured?), adding complexity that the spec defers.

## 7. Schema Migration v3

**Decision**: Migration step v3 updates the persisted `EquipmentProfile` in `advantage_equipment` to add missing fields: `resistanceBandLevels: []`, `kettlebellWeights: []`, `aestheticsDays: []`, `defaultEquipmentTypes: ['dumbbells', 'bodyweight']`. Also initialises `advantage_session_equipment` if absent.

**Rationale**: Non-destructive migration preserves existing user weights and training days. The defaults give existing users the pre-feature behavior (dumbbell + bodyweight only) without requiring reconfiguration.

---

## 8. Movement Pattern Taxonomy (Session 2026-04-30)

**Decision**: Add a `movementPattern` field to the `Exercise` interface. Values use the union type `MovementPattern` covering 10 patterns present in the current library.

**Rationale**: The pull-preference bias (FR-017) and consecutive-day guard (FR-018) both require a reliable classification of exercises as "pull" vs "push" at selection time. Deriving pattern from `primaryMuscleGroup` alone is ambiguous (`back` exercises span hinge deadlifts, horizontal rows, and carries). Hardcoded exercise ID lists break silently as exercises are added.

**Alternatives Considered**:
- Hardcode pull exercise ID set — rejected: breaks whenever an exercise is renamed or added
- Derive from `primaryMuscleGroup + category` heuristic — rejected: `back` spans hinge, pull, and carry; not reliably differentiable
- Secondary `tags` array (e.g., `tags: ['pull']`) — rejected: union type is clearer at the call site and avoids parsing

**MovementPattern values**:

| Value | Examples |
|-------|---------|
| `push-horizontal` | Bench Press, Push-Ups, Chest Fly |
| `push-vertical` | Overhead Press, Push Press, KB Press, Thruster |
| `pull-horizontal` | Single-Arm Row, Band Face Pull, Band Seated Row, Inverted Row |
| `pull-vertical` | Band Lat Pulldown, Band Straight-Arm Pulldown |
| `hinge` | Deadlift, RDL, KB Swing, KB Clean, KB Snatch |
| `squat` | Goblet Squat, Jump Squat, Lateral Lunge |
| `rotation` | Woodchop, Russian Twist, Windmill, TGU |
| `lateral` | Lateral Shuffle, Carioca, Band Monster Walk |
| `carry` | Suitcase Carry |
| `other` | Burpees, High Knees, Mountain Climbers, Wall Slide |

For FR-017/FR-018: "pull" = `pull-horizontal | pull-vertical`; "push" = `push-horizontal | push-vertical`.

**Pre-addition push:pull audit** (72 existing exercises):

| Pattern | Count |
|---------|-------|
| push-horizontal | 3 |
| push-vertical | 14 |
| **Total Push** | **17** |
| pull-horizontal | 9 |
| pull-vertical | 0 |
| **Total Pull** | **9** |
| Push:Pull ratio | **1.89:1** ← target ≤ 1.25:1 |

Deficit: need ≥ 7 more pull exercises to reach ≤ 1.25:1.

---

## 9. New Pull Exercises (7 additions)

All placed to fill the vertical pull gap and improve horizontal pull coverage.

### In `general-strength` — 5 exercises

| ID | Name | Equipment | movementPattern |
|----|------|-----------|----------------|
| `band-lat-pulldown` | Band Lat Pulldown | resistance-band | `pull-vertical` |
| `band-straight-arm-pulldown` | Band Straight-Arm Pulldown | resistance-band | `pull-vertical` |
| `inverted-row` | Inverted Row | bodyweight | `pull-horizontal` |
| `dumbbell-bent-over-row` | Dumbbell Bent-Over Row | dumbbell | `pull-horizontal` |
| `kb-single-arm-row` | KB Single-Arm Row | kettlebell | `pull-horizontal` |

All: `primaryMuscleGroup: 'back'`, `defaultSets: 3`, `defaultReps: 10–12`. No `goalTags` (primary performance exercises).

### In `shoulder-stability` — 2 exercises

| ID | Name | Equipment | movementPattern |
|----|------|-----------|----------------|
| `band-seated-row` | Band Seated Row | resistance-band | `pull-horizontal` |
| `dumbbell-chest-supported-row` | Dumbbell Chest-Supported Row | dumbbell | `pull-horizontal` |

All: `primaryMuscleGroup: 'back'`, `defaultSets: 3`, `defaultReps: 10–12`.

**Post-addition push:pull ratio**: 17 push : 16 pull = **1.06:1 ✅** (target ≤ 1.25:1)

---

## 10. Pull-Preference Bias Algorithm (FR-017)

**Decision**: Implement per-day selection bias inside `buildTrainingDayFromPool`. Track running push/pull counts across the 5 category slots. When a slot's pool contains pull exercises AND `dayPullCount < dayPushCount`, select exclusively from the pull sub-pool.

**Pseudocode**:
```
function buildTrainingDayFromPool(rand, pool, profile, avoidMuscleGroup?):
  shuffledCategories = shuffle(rand, ALL_CATEGORIES)
  dayPushCount = 0, dayPullCount = 0, planned = []

  for cat in shuffledCategories:
    categoryPool = pool[cat]

    // Consecutive-day guard (applied first)
    guardedPool = avoidMuscleGroup
      ? categoryPool.filter(e => e.primaryMuscleGroup !== avoidMuscleGroup)
      : categoryPool
    effectivePool = guardedPool.length > 0 ? guardedPool : categoryPool  // fallback

    // Pull-preference bias
    pullPool = effectivePool.filter(e => isPull(e.movementPattern))
    selectionPool =
      (dayPullCount < dayPushCount && pullPool.length > 0) ? pullPool : effectivePool

    exercise = randChoice(rand, selectionPool)

    if isPull(exercise.movementPattern): dayPullCount++
    if isPush(exercise.movementPattern): dayPushCount++
    planned.push(buildPlannedExercise(exercise, ...))

  return { isTrainingDay: true, exercises: planned }
```

**Graceful fallback**: if `pullPool` is empty (constrained equipment pool), falls back to `effectivePool` — plan generation never fails (FR-017 requirement).

---

## 11. Consecutive-Day Muscle Group Guard Algorithm (FR-018)

**Decision**: In `generateWeeklyPlan`, track `prevTrainingDay` and its index. When the next training day immediately follows (no rest day between), pass `dominantMuscleGroup(prevTrainingDay)` as `avoidMuscleGroup` to `buildTrainingDayFromPool`.

**Pseudocode**:
```
prevTrainingDay = null, prevTrainingDayIdx = null

for dayIndex, day in ALL_DAYS:
  if !trainingSet.has(day):
    days[day] = { isTrainingDay: false, exercises: [] }
    prevTrainingDay = null        // rest day resets the guard
    prevTrainingDayIdx = null
    continue

  avoidMuscleGroup =
    (prevTrainingDay !== null && prevTrainingDayIdx === dayIndex - 1)
      ? dominantMuscleGroup(prevTrainingDay)
      : undefined

  dayPlan = buildTrainingDayFromPool(rand, pool, profile, avoidMuscleGroup)
  prevTrainingDay = dayPlan
  prevTrainingDayIdx = dayIndex
```

Where `dominantMuscleGroup(dayPlan)` = the mode `primaryMuscleGroup` across a day's planned exercises (first-encountered on tie).

**Graceful fallback**: if all exercises in the guarded pool share the avoided group, `guardedPool` is empty → falls back to `categoryPool`. Plan never fails.

**Scope**: guard applies only between immediately adjacent training days; ≥ 1 rest day between sessions = no guard applied.

---

## 12. Session Summary Derivation (FR-019)

**Decision**: Satisfy FR-019 without a new `localStorage` key. Add `getSessionSummary(date: string): SessionSummary` to `completionStore`, deriving data from existing `ExerciseCompletion` records.

```ts
interface SessionSummary {
  date: string;
  exerciseIds: string[];
  muscleGroups: Exercise['primaryMuscleGroup'][];
}

// In completionStore:
getSessionSummary(date: string): SessionSummary {
  const dayCompletions = get().completions.filter(c => c.date === date);
  const exerciseIds = dayCompletions.map(c => c.exerciseId);
  const muscleGroups = [...new Set(
    exerciseIds.map(id => exerciseLibrary.get(id)?.primaryMuscleGroup).filter(Boolean)
  )];
  return { date, exerciseIds, muscleGroups };
}
```

**Result**: `SCHEMA_VERSION` stays at 3. No migration step needed. All data already persisted in `advantage_completions`. Phase 2 adaptive scheduling reads this selector directly.

**Alternative rejected**: New `WorkoutSessionLog` store + new localStorage key → migration to SCHEMA_VERSION 4, extra store boilerplate, no Phase 1 benefit.
