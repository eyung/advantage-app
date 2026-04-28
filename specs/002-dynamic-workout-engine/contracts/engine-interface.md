# Contract: Workout Engine Interface

**Feature**: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines  
**Version**: 1  
**Date**: 2026-04-27

---

## Overview

The workout engine is a collection of **pure functions** in `src/engine/`. They accept configuration as input and return a derived plan as output. They have no side effects and no imports from `src/store/`. This contract defines the function signatures and behavioural guarantees.

---

## `planGenerator.ts`

### `generateWeeklyPlan(profile: EquipmentProfile, weekISO: string): WeeklyPlan`

Generates a complete weekly routine for the given equipment profile and ISO week.

**Inputs**:
- `profile` — a valid EquipmentProfile (dumbbellWeights non-empty, trainingDays 3–6)
- `weekISO` — ISO week string in `YYYY-Www` format (e.g. `2026-W17`)

**Output**: A `WeeklyPlan` where:
- Every `DayOfWeek` entry is present
- Training days (`profile.trainingDays`) have `isTrainingDay: true` and a non-empty `exercises` array
- Rest days have `isTrainingDay: false` and an empty `exercises` array
- Every training day covers ≥ 3 distinct `TennisCategory` values (FR-005)
- Every `PlannedExercise.weightKg` is either `0` (bodyweight) or a member of `profile.dumbbellWeights` (FR-004)

**Determinism guarantee**: Calling this function with the same `profile` (including `configVersion`) and the same `weekISO` always returns an identical `WeeklyPlan`. Seed = `profile.configVersion * 10000 + numericWeekNumber(weekISO)`.

**Error conditions**:
- Throws `InvalidProfileError` if `profile.dumbbellWeights` is empty
- Throws `InvalidProfileError` if `profile.trainingDays.length < 3` or `> 6`

---

### `getCurrentWeekPlan(profile: EquipmentProfile): WeeklyPlan`

Convenience wrapper — calls `generateWeeklyPlan` with `profile` and the current ISO week derived from `new Date()`.

---

## `weightAssigner.ts`

### `assignWeight(exercise: Exercise, availableWeights: number[]): number`

Selects the most appropriate weight from `availableWeights` for the given exercise.

**Inputs**:
- `exercise` — an Exercise record from exercises.ts (includes `equipment` and `primaryMuscleGroup`)
- `availableWeights` — sorted ascending list of available dumbbell weights in kg (non-empty)

**Output**: A weight in kg. Guaranteed to be a member of `availableWeights`, or `0` if `exercise.equipment === "bodyweight"`.

**Algorithm**:
1. If `exercise.equipment === "bodyweight"`, return `0`
2. Determine strength level from `max(availableWeights)`: beginner (≤10), intermediate (11–20), advanced (>20)
3. Map `exercise.primaryMuscleGroup` to a target-percentage band (e.g., legs → 60–80% of max, shoulders → 40–60%)
4. Compute target weight = midpoint of band × max weight
5. Return the element of `availableWeights` closest to the target weight (round down when tie)

**Guarantee**: Returned value is always in `availableWeights` (or `0` for bodyweight). Never returns a weight not in the user's list.

---

## Engine Boundary Rules

The following are hard constraints enforced by code review and architecture:

1. **No store imports**: Files in `src/engine/` MUST NOT import from `src/store/`.
2. **No side effects**: Engine functions MUST NOT write to localStorage, call external APIs, or mutate their inputs.
3. **No React imports**: Engine files are plain TypeScript — no JSX, no hooks.
4. **Stable IDs**: `exerciseId` values in `PlannedExercise` MUST match IDs in `src/data/exercises.ts`. The engine never generates ad-hoc exercise IDs.

---

## Versioning

The engine interface is versioned implicitly through `EquipmentProfile.configVersion`. A future progressive overload module that modifies prescribed weights must:

1. Accept `ExerciseCompletion[]` as an additional input parameter
2. Return a modified `WeeklyPlan` (not mutate the base plan)
3. Still satisfy all determinism and boundary guarantees above

No changes to this contract are required in v1 to support that future extension.
