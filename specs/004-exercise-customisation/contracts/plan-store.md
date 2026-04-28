# Contract: PlanStore

## Component

`src/store/planStore.ts`

## Interface

```typescript
import type { WeeklyPlan, EquipmentProfile, ExerciseCompletion } from '../types';
import type { CustomExercise, CustomisationProfile } from '../types';

interface PlanState {
  plan: WeeklyPlan | null;

  generateFresh: (
    profile: EquipmentProfile,
    customisation: CustomisationProfile,
    customExercises: CustomExercise[]
  ) => void;

  applyCustomisation: (
    profile: EquipmentProfile,
    customisation: CustomisationProfile,
    customExercises: CustomExercise[],
    completions: ExerciseCompletion[],
    weekDates: string[]   // ISO date strings [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  ) => void;
}
```

## Behaviour

### `generateFresh`

- Builds the eligible pool from the merged exercise library filtered by `customisation.excludedExerciseIds` and `customisation.blockedCategories`
- Calls `generateWeeklyPlan(profile, currentWeekISO, customisation, customExercises)` to produce a fresh `WeeklyPlan`
- Replaces `state.plan` with the result

### `applyCustomisation`

Guards (trigger `generateFresh` instead if any apply):
- `plan === null`
- `plan.weekISO !== getCurrentISOWeek()`
- `plan.configVersion !== profile.configVersion`

For each `DayOfWeek` in `ALL_DAYS` (Mon–Sun), using `dayIndex` (0=Mon):
1. If `plan.days[day].isTrainingDay === false`: skip (rest day)
2. Get `dayDate = weekDates[dayIndex]`
3. Compute `completedIds = new Set(completions.filter(c => c.date === dayDate).map(c => c.exerciseId))`
4. Get `day.exercises` (array of `PlannedExercise`)
5. Determine coverage:
   - **Complete** (`completedIds.size >= day.exercises.length`): leave this day unchanged
   - **Empty** (`completedIds.size === 0`): regenerate the entire day using the new eligible pool
   - **Partial**: keep `PlannedExercise` entries where `completedIds.has(pe.exerciseId)`; regenerate remaining slots
6. Write updated `days` back to `state.plan` (immutable update pattern via Zustand `set`)

Partial/empty regeneration seed: `customisationVersion * 100000 + dayIndex * 1000 + slotIndex`

## Persistence

- Zustand `persist` middleware
- localStorage key: `advantage_plan`
- No migration needed — a `null` plan triggers fresh generation on first render

## Constraints

- `applyCustomisation` is the ONLY mutation path for partially regenerating a plan; components must never directly modify `plan.days`
- `generateFresh` always replaces the entire plan — call only when profile or week changes
- Both methods are synchronous; no async operations
