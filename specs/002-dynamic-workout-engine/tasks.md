---
description: "Task list for Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines"
---

# Tasks: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Input**: Design documents from `/specs/002-dynamic-workout-engine/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/storage-schema.md ✅, contracts/engine-interface.md ✅, research.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4) — required for all story-phase tasks
- All paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Replace feature-001 shared infrastructure with feature-002 types and utilities

- [x] T001 Replace src/types.ts with feature-002 type definitions: `DayOfWeek`, `TennisCategory`, `Exercise`, `EquipmentProfile`, `WeeklyPlan`, `DayPlan`, `PlannedExercise`, `ExerciseCompletion` (exact shapes from data-model.md)
- [x] T002 [P] Update src/utils/dateUtils.ts — add `getCurrentISOWeek(): string` (returns `YYYY-Www`), `getISOWeekForDate(date: Date): string`, `getTodayISO(): string`; retain any existing helpers that are still needed
- [x] T003 [P] Update src/utils/storage.ts — typed `getItem`/`setItem` wrappers, schema version check on read using `rally_schema_version` key; ensure `rally_equipment` and `rally_completions` keys are recognised
- [x] T004 [P] Update src/utils/migration.ts — migration runner `migrate(storedVersion, currentVersion)`; v1 baseline writes empty `rally_completions: []` and sets `rally_schema_version: 1` if absent; does NOT touch existing completion records

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Exercise library, engine functions, stores, and hooks that ALL user stories depend on

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

### Cluster A — run in parallel immediately after Phase 1

- [x] T005 [P] Create src/data/exercises.ts — ~50 tennis-focused exercises covering all five `TennisCategory` values (`lateral-agility`, `rotational-power`, `shoulder-stability`, `hiit-stamina`, `general-strength`); each exercise has: `id`, `name`, `category`, `equipment` (`"dumbbell" | "bodyweight"`), `primaryMuscleGroup`, `defaultSets`, `defaultReps`; export default array and `exerciseMap` (Record<string, Exercise>) for O(1) lookup
- [x] T006 [P] Implement src/engine/weightAssigner.ts — `assignWeight(exercise: Exercise, availableWeights: number[]): number` per engine-interface.md contract: returns `0` for bodyweight, maps `primaryMuscleGroup` to percentage band of `max(availableWeights)`, returns nearest weight in `availableWeights` (round down on tie); NO imports from src/store/
- [x] T008 [P] Implement src/store/equipmentStore.ts — Zustand store with `persist` middleware to `rally_equipment` key; state: `profile: EquipmentProfile | null`; actions: `saveConfig(weights: number[], days: DayOfWeek[])` sorts weights, auto-increments `configVersion`, stamps `savedAt`; derived selector `isConfigured(): boolean` (≥1 weight AND 3–6 days)
- [x] T009 [P] Implement src/store/completionStore.ts — Zustand store with `persist` middleware to `rally_completions` key; state: `completions: ExerciseCompletion[]`; actions: `addCompletion(record)` appends UUID-stamped record, `removeCompletion(exerciseId, date)` deletes matching record (toggle-off); selector `getCompletionsForWeek(weekISO: string): ExerciseCompletion[]`; store is NEVER bulk-cleared

### Cluster B — after Cluster A complete

- [x] T007 Implement src/engine/planGenerator.ts — `generateWeeklyPlan(profile: EquipmentProfile, weekISO: string): WeeklyPlan` using Mulberry32 PRNG seeded by `profile.configVersion * 10000 + numericWeek(weekISO)`; assigns ≥3 `TennisCategory` values per training day (FR-005); uses `weightAssigner.assignWeight` for each dumbbell exercise; `getCurrentWeekPlan(profile)` convenience wrapper; throws `InvalidProfileError` for invalid inputs; NO imports from src/store/ (depends on T005, T006)
- [x] T010 [P] Implement src/hooks/useEquipment.ts — exposes `{ profile, isConfigured, saveConfig }` from equipmentStore; `saveConfig` validates locally before calling store action (depends on T008)
- [x] T011 [P] Implement src/hooks/useWeekPlan.ts — calls `getCurrentWeekPlan(profile)` memoised by `profile.configVersion`; returns `WeeklyPlan | null` (null when `!isConfigured`); re-derives automatically when configVersion changes (depends on T007, T008)
- [x] T012 [P] Implement src/hooks/useCompletions.ts — returns `{ completionsThisWeek, toggleCompletion }` for current ISO week; `toggleCompletion(exerciseId, weightKg, sets, repsPerSet)` adds a new `ExerciseCompletion` or removes an existing one for the same `(exerciseId, todayISO)` pair (depends on T009)

**Checkpoint**: Foundation ready — user story implementation can begin in parallel

---

## Phase 3: User Story 1 — First-Time Setup: Define Equipment & Training Days (Priority: P1) 🎯 MVP

**Goal**: New user can configure dumbbell weights and training days; app immediately generates a weekly plan

**Independent Test**: Open app in a private tab (fresh localStorage), enter weights [8 kg, 12 kg, 16 kg], toggle Mon/Wed/Fri/Sat as training days, tap Save — confirm the wizard disappears, the weekly view shows 4 training-day tabs and 3 rest-day tabs, and every weighted exercise uses only 8, 12, or 16 kg.

### Implementation for User Story 1

- [x] T013 [P] [US1] Build src/components/setup/DumbbellInput.tsx — numeric input + "Add" button; displays sorted list of added weights as removable chips; prevents duplicate entries; minimum 1 weight required before proceeding
- [x] T014 [P] [US1] Build src/components/setup/DaySelector.tsx — 7-button Mon–Sun toggle grid; selected days visually distinct (clay-orange); Save button disabled when selection count < 3 or > 6; selection count shown (e.g., "3 / 6 days selected")
- [x] T015 [US1] Build src/components/setup/SetupWizard.tsx — full-screen overlay, no close/dismiss button; assembles DumbbellInput and DaySelector; Save button disabled until ≥1 weight and 3–6 days are valid; on Save calls `useEquipment.saveConfig()` (depends on T013, T014)
- [x] T016 [US1] Wire SetupWizard into app gate in src/App.tsx — render `<SetupWizard />` when `!isConfigured`; render main view when `isConfigured`; uses `useEquipment` hook; no router needed (depends on T010, T015)

**Checkpoint**: User Story 1 fully functional — setup wizard saves config, main view appears immediately

---

## Phase 4: User Story 2 — View Week at a Glance and Log Completions (Priority: P1) 🎯 MVP

**Goal**: User opens app and sees today's routine; can mark exercises complete; completions persist across reloads

**Independent Test**: With a saved config, open the app — today's tab is selected; exercises are listed; tap "Complete" on two exercises; reload the page and confirm both are still marked done; navigate to a rest-day tab and confirm a recovery message is shown instead of exercises.

### Implementation for User Story 2

- [x] T017 [P] [US2] Build src/components/exercise/CompletionBadge.tsx — small icon/chip showing "Done" state; green fill when complete, neutral border when not; accessible aria-label
- [x] T018 [P] [US2] Build src/components/exercise/ExerciseCard.tsx — card displaying exercise name, `TennisCategory` badge (colour-coded: one colour per category), sets × reps, weight (or "Bodyweight"), and a "Complete" toggle button with `CompletionBadge`; completed card has distinct background tint; "Complete" tap fires a callback (depends on T017)
- [x] T019 [P] [US2] Build src/components/main/DayTabBar.tsx — horizontal scrollable row of 7 day tabs (Mon–Sun); current day highlighted on mount; selected tab underlined in clay-orange; training-day tabs show exercise count badge; rest-day tabs show "Rest" label
- [x] T020 [US2] Build src/components/main/DayRoutineView.tsx — renders list of ExerciseCards for the selected DayPlan when `isTrainingDay: true`; renders rest-day recovery message card when `isTrainingDay: false`; passes `isCompleted` and `onToggle` props to each ExerciseCard (depends on T017, T018)
- [x] T021 [US2] Wire DayTabBar + DayRoutineView to useWeekPlan + useCompletions in src/components/main/MainView.tsx — selected tab state (`useState` defaulting to today); passes `WeeklyPlan.days[selectedDay]` to DayRoutineView; maps completion records to ExerciseCard isCompleted; routes card toggle through `useCompletions.toggleCompletion` (depends on T011, T012, T019, T020)

**Checkpoint**: User Stories 1 and 2 both independently functional — full weekly view with completion tracking works

---

## Phase 5: User Story 3 — Reconfigure Without Losing History (Priority: P2)

**Goal**: User can update dumbbell weights or training days; plan regenerates; all completion history is preserved

**Independent Test**: Log completions for at least two exercises. Open settings, add a new dumbbell weight, save — confirm the weekly plan updates (new exercises may appear). Navigate to Progress — confirm all previously logged completions are still visible.

### Implementation for User Story 3

- [x] T022 [P] [US3] Build src/components/setup/SettingsView.tsx — reuses DumbbellInput and DaySelector; pre-populates with current `useEquipment.profile` values on mount; Save button calls `useEquipment.saveConfig()` with the updated values; accessible from main view via a gear/settings icon
- [x] T023 [US3] Wire SettingsView into main view in src/components/main/MainView.tsx — settings icon in header opens SettingsView overlay; on save, `useWeekPlan` auto-regenerates (because `configVersion` incremented); `completionStore` is not touched; confirm plan updates without data loss (depends on T010, T022)

**Checkpoint**: User Story 3 functional — reconfiguring generates a new plan while history is intact

---

## Phase 6: User Story 4 — Progress Dashboard: Personal Bests and Consistency (Priority: P3)

**Goal**: Progress tab shows personal best weight per exercise and weekly consistency chart over 8 weeks

**Independent Test**: After logging completions across 3+ different ISO weeks, open Progress — personal bests show the highest weight per exercise from all history; consistency chart shows bar pairs (completed vs planned) for each past week; empty state shows encouragement message when no completions exist.

### Implementation for User Story 4

- [x] T024 [P] [US4] Build src/components/progress/PersonalBestList.tsx — reads all completions from completionStore; groups by `exerciseId`; computes `max(weightKg)` per exercise; renders a list of rows showing exercise name, best weight, and date achieved; shows encouraging empty state when no completions exist
- [x] T025 [P] [US4] Build src/components/progress/ConsistencyChart.tsx — Recharts bar chart; x-axis = last 8 ISO weeks (derived from current date); y-axis = sessions completed vs planned; planned count comes from `WeeklyPlan.trainingDays.length` for each week (use current plan for weeks without archived plan data); shows empty state when no history
- [x] T026 [US4] Build src/components/progress/ProgressView.tsx — assembles PersonalBestList and ConsistencyChart; header row showing this-week session count (completed vs planned); encouragement message when both sections are empty (depends on T024, T025)
- [x] T027 [US4] Wire ProgressView to completionStore in src/App.tsx tab routing — bottom-nav "Progress" tab renders ProgressView; ProgressView receives completions from completionStore via props or direct hook; PersonalBest derivation is computed at render time (no caching needed in v1) (depends on T009, T026)

**Checkpoint**: All 4 user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: App shell wiring, visual polish, edge-case handling, and deployment validation

- [x] T028 Build final src/App.tsx — top-level conditional: `<SetupWizard />` when `!isConfigured`, else `<MainView />` with bottom navigation tabs for "Today" (default) and "Progress"; SettingsView accessible via header icon; no React Router; call `migrate()` on app init before store hydration
- [x] T029 [P] Update tailwind.config.ts — add 5 TennisCategory colour tokens: `category-agility` (yellow-green), `category-rotational` (orange), `category-shoulder` (blue), `category-hiit` (red), `category-strength` (purple); update src/theme/tokens.ts to export these values
- [x] T030 [P] Update src/main.tsx — call `migrate()` from storage utils before `ReactDOM.createRoot`; ensure `uuid` dependency is available for ExerciseCompletion ID generation
- [x] T031 [P] Add day-complete badge to DayTabBar tab — in DayTabBar.tsx: when all exercises for a training day have completion records in current ISO week, show a small green checkmark badge on that tab; rest-day tabs are unchanged
- [x] T032 Run quickstart.md validation — open app in private tab (fresh localStorage), complete full first-time setup, mark exercises done, reload to verify persistence, change config and confirm plan updates, verify completions appear in Progress; confirm `npm run build` produces clean `dist/` and no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — independent of other stories
- **US2 (Phase 4)**: Depends on Foundational — independent of US1 (can run in parallel)
- **US3 (Phase 5)**: Depends on Foundational; integrates with US1 (reuses DumbbellInput + DaySelector)
- **US4 (Phase 6)**: Depends on Foundational; reads from completionStore (T009)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1**: Independent after Foundational
- **US2**: Independent after Foundational — can run in parallel with US1
- **US3**: Soft dependency on US1 (reuses setup components)
- **US4**: Reads completionStore; independent of US1/US2/US3 data flow

### Within Each User Story

- Leaf components (DumbbellInput, DaySelector, CompletionBadge) → before composite components
- Composite components → before view assembly
- View assembly → before store wiring
- Store wiring → before checkpoint verification

### Parallel Opportunities

All tasks marked `[P]` can run in parallel within their phase.

**Phase 1 parallel cluster**:
```
T001 types.ts
T002 dateUtils.ts    → all independent
T003 storage.ts
T004 migration.ts
```

**Phase 2 Cluster A** (start together after Phase 1):
```
T005 exercises.ts
T006 weightAssigner.ts    → all independent files
T008 equipmentStore.ts
T009 completionStore.ts
```

**Phase 2 Cluster B** (after Cluster A):
```
T007 planGenerator.ts     → needs T005 + T006
T010 useEquipment.ts      → needs T008
T011 useWeekPlan.ts       → needs T007 + T008
T012 useCompletions.ts    → needs T009
```

**US1 parallel cluster** (after Foundational):
```
T013 DumbbellInput.tsx    → both feed T015 SetupWizard
T014 DaySelector.tsx
```

**US2 parallel cluster** (after Foundational):
```
T017 CompletionBadge.tsx
T018 ExerciseCard.tsx     → feeds T020 DayRoutineView
T019 DayTabBar.tsx        → feeds T021 wire
```

**US4 parallel cluster** (after Foundational):
```
T024 PersonalBestList.tsx    → both feed T026 ProgressView
T025 ConsistencyChart.tsx
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (setup wizard)
4. Complete Phase 4: User Story 2 (weekly view + completion)
5. **STOP and VALIDATE**: User can configure equipment, see their weekly plan, mark exercises complete, and persist completions

### Incremental Delivery

1. Setup + Foundational → engine and data layer ready
2. US1 + US2 → MVP: configure equipment, view and log workouts
3. US3 → reconfiguration without data loss
4. US4 → progress charts and personal bests
5. Polish → deployment-ready build

---

## Notes

- `[P]` tasks = different files, no blocking dependencies within the cluster
- `[US#]` label maps task to user story for traceability
- No test tasks generated (not requested in spec)
- Each user story phase ends with a checkpoint — validate independently before continuing
- Commit after each checkpoint at minimum
- Engine boundary rule: no file in `src/engine/` may import from `src/store/` — enforce during code review of T006, T007
- `completionStore` is append-only: never add bulk-clear logic; toggle-off removes a single record only
