# Implementation Plan: Equipment Expansion

**Branch**: `005-equipment-expansion` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/005-equipment-expansion/spec.md`

## Summary

Extend the existing exercise and equipment system to support resistance bands (Light/Medium/Heavy/Extra-Heavy) and kettlebells (numeric kg), add an `aesthetics` secondary goal tag to exercises, implement per-session equipment availability (with a saved default), ship ~22 new built-in exercises across both new equipment types, and update all affected UI surfaces. The plan layer strategy layers on top of feature 004's `buildEligiblePool` architecture — equipment type filtering joins exclusion/block filtering as a composable pool constraint.

## Technical Context

**Language/Version**: TypeScript 5 (strict) + React 18  
**Primary Dependencies**: Vite 5, Zustand 5 (persist middleware), React  
**Storage**: localStorage only — no backend  
**Testing**: None requested  
**Target Platform**: Browser (static SPA)  
**Project Type**: Single-page web application  
**Performance Goals**: Sub-100ms plan regeneration; all localStorage reads synchronous  
**Constraints**: Offline-first, no auth, must survive app restarts; schema migration must be non-destructive  
**Scale/Scope**: Single user, ~75+ exercises post-feature

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Tennis-Performance-Led | ✅ | New exercises framed as tennis/athletic performance; aesthetics is secondary, opt-in |
| II. Offline-First, Zero Backend | ✅ | All new state in localStorage via Zustand persist |
| III. Sensible Defaults | ✅ | Bodyweight always available; no new equipment required to open app |
| IV. Visible Progress | ✅ | No changes to completion/progress tracking |
| V. Simplicity Over Completeness | ✅ | No 6th category; aesthetics is a tag, not a nav item; session availability is ≤3 taps |

**Gate**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-equipment-expansion/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code Changes

```text
src/
├── types.ts                          MODIFIED — new types, extended interfaces
├── utils/
│   ├── storage.ts                    MODIFIED — SCHEMA_VERSION 2→3, new key
│   └── migration.ts                  MODIFIED — v3 migration step
├── data/
│   └── exercises.ts                  MODIFIED — ~22 new exercises, goalTags field
├── engine/
│   ├── weightAssigner.ts             MODIFIED — handle resistance-band + kettlebell
│   └── planGenerator.ts             MODIFIED — equipment filter, aesthetics guarantee
├── store/
│   ├── customisationStore.ts         MODIFIED — addCustomExercise accepts aesthetics tag
│   ├── planStore.ts                  MODIFIED — pass equipment availability to generator
│   └── sessionEquipmentStore.ts     NEW — ephemeral session equipment with daily reset
├── hooks/
│   ├── useEquipment.ts               MODIFIED — expose new profile fields
│   └── useWeekPlan.ts               MODIFIED — read session equipment, pass to plan
└── components/
    ├── setup/
    │   ├── SettingsView.tsx           MODIFIED — add band/kettlebell/aesthetics sections
    │   ├── ResistanceBandInput.tsx    NEW — band level multi-select
    │   ├── KettlebellInput.tsx        NEW — kettlebell weight entry (reuses DumbbellInput pattern)
    │   ├── AestheticsDaySelector.tsx  NEW — day-of-week toggle for aesthetics days
    │   └── AddExerciseForm.tsx        MODIFIED — add optional aesthetics checkbox
    ├── main/
    │   └── SessionEquipmentBar.tsx    NEW — pre-workout equipment availability picker
    └── settings/
        └── ExerciseManagement.tsx     (auto-shows new exercises; no structural changes needed)
```

## Key Architecture Decisions

### Decision 1: Equipment type as Exercise field value (not separate flag)

**Chosen**: Extend `Exercise.equipment` union from `'dumbbell' | 'bodyweight'` to `'dumbbell' | 'bodyweight' | 'resistance-band' | 'kettlebell'`. No separate `equipmentType` array.

**Rationale**: The existing `buildEligiblePool` already filters by field values on `Exercise`. Adding two new union members is a direct extension of the existing pattern — zero new abstraction layers needed.

**Alternative rejected**: Separate `equipmentTypes: EquipmentType[]` array on Exercise — adds indirection for no benefit in this single-user context.

### Decision 2: Weight assignment — resistance bands use categorical→kg mapping

**Chosen**: Resistance band levels (Light/Medium/Heavy/Extra-Heavy) map to kg equivalents [5, 15, 30, 50]. These are passed as the `availableWeights` array to the existing `assignWeight` function when the exercise equipment is `'resistance-band'`. Displayed as "X kg (band)" to distinguish from dumbbell weights.

**Rationale**: The spec explicitly states this mapping and says these are display hints. Reusing `assignWeight` means no new weight selection logic. The display suffix clarifies the unit to the user.

**Alternative rejected**: Separate band weight assignment function — duplicates BANDS fraction table for no behavioral difference.

### Decision 3: Session equipment availability — Zustand persist with date guard

**Chosen**: New `sessionEquipmentStore` persisted in localStorage under `advantage_session_equipment`. Contains `{ availableTypes: EquipmentType[], date: string }`. On every read, if `date !== todayISO()`, the store auto-resets to `profile.defaultEquipmentTypes`.

**Rationale**: This achieves the spec requirement "per-session availability is stored ephemerally (reset to default on each new day) while the default preference is persisted." The store is always in a valid state — no stale equipment selection survives a calendar day change.

### Decision 4: Aesthetics guarantee — post-selection slot swap

**Chosen**: After `buildTrainingDayFromPool` selects its 5 exercises, if the day is an aesthetics day and no selected exercise has `goalTags: ['aesthetics']`, find the first category slot where an aesthetics-tagged exercise exists in the pool and swap it in. Selection is seeded (same seed formula as slot-indexed partial regen).

**Rationale**: Avoids coupling aesthetics logic into the per-category selection loop. The post-swap is deterministic (seeded) and only activates when needed, so non-aesthetics days are unchanged.

**Alternative rejected**: Separate "aesthetics slot" as a 6th exercise — spec explicitly says 5 exercises/day, aesthetics is within the 5.

### Decision 5: Schema bump 2→3; new KEYS entry

`SCHEMA_VERSION` bumps from 2 to 3. Migration v3 adds `resistanceBandLevels: []`, `kettlebellWeights: []`, `aestheticsDays: []`, and `defaultEquipmentTypes: ['dumbbells', 'bodyweight']` to the stored `EquipmentProfile`. Adds `advantage_session_equipment` key to KEYS.

### Decision 6: `buildEligiblePool` signature extended with available equipment types

Current signature: `buildEligiblePool(allExercises, customisation)`  
New signature: `buildEligiblePool(allExercises, customisation, availableEquipmentTypes)`

The filter adds: `e.equipment === 'bodyweight' || equipmentTypeToEquipmentField(availableEquipmentTypes).has(e.equipment)` — bodyweight is always eligible.

`generateWeeklyPlan`, `planStore.generateFresh`, and `planStore.applyCustomisation` all receive `availableEquipmentTypes` from the session equipment store via `useWeekPlan`.

### Decision 7: Custom exercises — aesthetics tag only (no new equipment types)

Per spec assumption: "The custom exercise creation flow is extended with an optional 'aesthetics' checkbox — no other changes to that flow are required." Custom exercises remain `'dumbbell' | 'bodyweight'` only. The `addCustomExercise` action gains an optional `goalTags?: ('aesthetics')[]` parameter.

## New Built-In Exercises (22 exercises)

### Resistance Band (~11 exercises)

| ID | Name | Category | Muscle Group | Aesthetics |
|----|------|----------|-------------|------------|
| `band-lateral-walk` | Band Lateral Walk | lateral-agility | legs | — |
| `band-monster-walk` | Band Monster Walk | lateral-agility | legs | — |
| `band-pull-apart` | Band Pull-Apart | shoulder-stability | shoulders | — |
| `band-external-rotation` | Band External Rotation | shoulder-stability | shoulders | — |
| `band-face-pull` | Band Face Pull | shoulder-stability | shoulders | — |
| `band-woodchop` | Band Woodchop | rotational-power | core | — |
| `band-rotational-row` | Band Rotational Row | rotational-power | core | — |
| `band-squat` | Band Squat | general-strength | legs | aesthetics |
| `band-bicep-curl` | Band Bicep Curl | general-strength | arms | aesthetics |
| `band-tricep-pushdown` | Band Tricep Pushdown | general-strength | arms | aesthetics |
| `band-sprint-resistance` | Band Sprint Resistance | hiit-stamina | full-body | — |

### Kettlebell (~11 exercises)

| ID | Name | Category | Muscle Group | Aesthetics |
|----|------|----------|-------------|------------|
| `kb-swing` | Kettlebell Swing | hiit-stamina | full-body | — |
| `kb-clean` | Kettlebell Clean | hiit-stamina | full-body | — |
| `kb-goblet-squat` | KB Goblet Squat | general-strength | legs | aesthetics |
| `kb-deadlift` | Kettlebell Deadlift | general-strength | legs | — |
| `kb-single-leg-deadlift` | KB Single-Leg Deadlift | lateral-agility | legs | — |
| `kb-windmill` | Kettlebell Windmill | rotational-power | core | — |
| `kb-turkish-get-up` | Turkish Get-Up | rotational-power | full-body | — |
| `kb-halo` | Kettlebell Halo | shoulder-stability | shoulders | — |
| `kb-press` | Kettlebell Press | shoulder-stability | shoulders | aesthetics |
| `kb-lateral-lunge` | KB Lateral Lunge | lateral-agility | legs | — |
| `kb-snatch` | Kettlebell Snatch | hiit-stamina | full-body | — |

**Total new**: 22 exercises across 5 categories.  
**Aesthetics-tagged**: `band-squat`, `band-bicep-curl`, `band-tricep-pushdown`, `kb-goblet-squat`, `kb-press` (5 exercises — at least 1 per category that's likely to appear).

## Complexity Tracking

No constitution violations to justify.
