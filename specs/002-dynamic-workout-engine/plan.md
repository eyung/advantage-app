# Implementation Plan: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Branch**: `002-dynamic-workout-engine` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-dynamic-workout-engine/spec.md`

## Summary

Redesign Rally as a single-page app whose entire UI is a day-tab view of auto-generated, dumbbell-scaled weekly routines. A full-screen setup wizard gates first use; once equipment and training days are saved, a deterministic engine generates the weekly plan. Users tap cards to toggle completion; all completions are archived per ISO week and feed a Progress dashboard. Engine and completion history are strictly separated so reconfiguration regenerates the plan without touching history.

## Technical Context

**Language/Version**: TypeScript 5 / React 18  
**Primary Dependencies**: Vite 5, Zustand 4 (persist), Recharts 2, Tailwind CSS 3  
**Storage**: localStorage (no backend)  
**Testing**: N/A (not requested in spec)  
**Target Platform**: Modern browsers (desktop + mobile), SPA served from static host  
**Project Type**: Single-page web application  
**Performance Goals**: All UI interactions feel instantaneous; plan generation < 3 s  
**Constraints**: Offline-capable; all data local; single user, no auth  
**Scale/Scope**: ~10 screens/views; ~5 Zustand stores; exercise library ~50 exercises

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Technology stack matches constitution | PASS | Vite + React + TypeScript + Zustand + Tailwind — all specified |
| No backend introduced | PASS | localStorage only |
| No new external APIs | PASS | Pure client-side |
| Engine / data separation upheld | PASS | `engine/` is pure functions; stores are append-only |
| Progressive overload architecture included | PASS | FR-006a: ExerciseCompletion stores repsPerSet[] |
| No [NEEDS CLARIFICATION] remaining | PASS | All 5 clarifications resolved |
| Complexity justified | PASS | No violations detected |
| Single-user constraint respected | PASS | No account system |

**Post-design re-check**: engine/ is pure (no store imports); completionStore never deletes records; equipmentStore version-stamps config changes. All gates remain PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-dynamic-workout-engine/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── storage-schema.md
│   └── engine-interface.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── planGenerator.ts       # Pure fn: (EquipmentProfile) → WeeklyPlan
│   └── weightAssigner.ts      # Pure fn: assigns dumbbell weight per exercise
├── data/
│   └── exercises.ts           # Static exercise library (~50 tennis-focused exercises)
├── store/
│   ├── equipmentStore.ts      # Zustand: EquipmentProfile + config version
│   └── completionStore.ts     # Zustand: ExerciseCompletion[] (append-only)
├── hooks/
│   ├── useEquipment.ts        # Read/write equipment config
│   ├── useWeekPlan.ts         # Derives WeeklyPlan from equipmentStore
│   └── useCompletions.ts      # Current-week completions + toggle action
├── components/
│   ├── setup/
│   │   ├── SetupWizard.tsx    # Full-screen gate; cannot dismiss until saved
│   │   ├── DumbbellInput.tsx  # Add/remove dumbbell weights
│   │   └── DaySelector.tsx    # Toggle Mon–Sun; enforce 3–6 days
│   ├── main/
│   │   ├── DayTabBar.tsx      # Mon–Sun tabs; current day highlighted
│   │   └── DayRoutineView.tsx # Exercise cards for selected tab
│   ├── exercise/
│   │   ├── ExerciseCard.tsx   # Name, sets×reps, weight, category badge, Complete btn
│   │   └── CompletionBadge.tsx
│   └── progress/
│       ├── ProgressView.tsx
│       ├── PersonalBestList.tsx
│       └── ConsistencyChart.tsx
└── App.tsx                    # Conditional render: SetupWizard | MainView
```

**Structure Decision**: Single-project SPA. The `engine/` directory contains only pure functions (zero store imports) to enforce the engine/data separation mandated by the spec. The top-level `App.tsx` controls the setup wizard gate — it renders `SetupWizard` until `equipmentStore` reports a completed profile, then renders the main tab view.
