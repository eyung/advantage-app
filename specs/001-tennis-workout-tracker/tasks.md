---
description: "Task list for Rally — Tennis-Focused Personal Workout Tracker"
---

# Tasks: Rally — Tennis-Focused Personal Workout Tracker

**Input**: Design documents from `/specs/001-tennis-workout-tracker/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/storage-schema.md ✅, research.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US4) — required for all story-phase tasks
- All paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Initialize project, toolchain, and shared infrastructure

- [x] T001 Initialize Vite 5 + React 18 + TypeScript 5 project (package.json, vite.config.ts, tsconfig.json, index.html) — configure `base: "./"` for static hosting
- [x] T002 [P] Configure Tailwind CSS 3 with tennis colour tokens: court-green `#4CAF50`/`#2E7D32`, clay-orange `#E65100`/`#FF6F00`, white `#FAFAFA` (tailwind.config.ts, src/theme/tokens.ts)
- [x] T003 [P] Configure React Router v6 hash-based routing with four routes: `/` Home, `/session` Session, `/progress` Progress, `/settings` Settings (src/App.tsx)
- [x] T004 [P] Set up Zustand 4 store scaffolding with `persist` middleware pointing to `rally_profile` and `rally_sessions` / `rally_tennis_sessions` keys (src/store/index.ts, src/store/profileStore.ts, src/store/sessionStore.ts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data, utilities, and state that ALL user stories depend on

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create built-in exercise library with ~60 exercises covering all `TennisCategory` values (agility, explosiveness, shoulder, core, mobility, general) — include all fields from data-model.md Exercise entity (src/data/exercises.ts)
- [x] T006 [P] Create default profile values: week schedule `[lifting, tennis, lifting, tennis, cardio, tennis, rest]`, session durations `{tennis:90, lifting:60, cardio:45}`, and starter weights keyed by exercise ID (src/data/defaults.ts)
- [x] T007 Implement `localStorage` storage utilities: schema version check on read, typed `getItem`/`setItem` wrappers, `rally_schema_version` key handling (src/utils/storage.ts)
- [x] T008 [P] Implement schema migration helper: sequential migration runner `migrate(storedVersion, currentVersion, rawData)`, v1 baseline (src/utils/migration.ts)
- [x] T009 [P] Implement date utilities: `getTodayISO()`, `getISOWeekNumber(date)`, `getDayOfWeekIndex(date)`, `formatDisplayDate(iso)` (src/utils/dateUtils.ts)
- [x] T010 Implement `TrainingProfile` Zustand store: hydrate from `rally_profile` key on load, write defaults if key missing, expose `updateSchedule`, `updateDurations`, `updateWeight` actions (src/store/profileStore.ts)
- [x] T011 Implement `WorkoutSession` + `TennisSession` Zustand store: hydrate from `rally_sessions` and `rally_tennis_sessions`, expose `addSession`, `addTennisSession`, `getSessionsInRange` selectors (src/store/sessionStore.ts)
- [x] T012 [P] Implement workout plan generator: rule-based, ISO-week-seeded, proportional category selection (agility 20%, explosiveness 20%, shoulder 20%, core 20%, general 20%), returns `WorkoutPlan` for current week (src/utils/planGenerator.ts)
- [x] T013 [P] Build common UI components: `Button` (primary/secondary/ghost variants), `Card`, `Badge` (tennis-category colour-coded), `ProgressBar` (src/components/common/)
- [x] T014 [P] Apply tennis theme to global styles: court-green nav accent, clay-orange CTAs, white backgrounds with subtle court-line texture, tennis ball icon as favicon (src/index.css, public/index.html)

**Checkpoint**: Foundation ready — user story implementation can begin in parallel

---

## Phase 3: User Story 1 — Configure Training Schedule (Priority: P1) 🎯 MVP

**Goal**: User can set their weekly day types, session durations, and working weights

**Independent Test**: Open Settings, configure 4 tennis + 3 lifting days, set lifting duration
to 75 min, set goblet squat weight to 24 kg, save — then verify Home shows the updated
schedule for today.

### Implementation for User Story 1

- [x] T015 [P] [US1] Create `useProfile` hook: exposes `profile`, `updateSchedule`, `updateDurations`, `updateWeight` from profileStore (src/hooks/useProfile.ts)
- [x] T016 [P] [US1] Build `WeekScheduleEditor` component: 7-day grid, each day cycles through `tennis | lifting | cardio | rest` on tap, shows day-type colour and icon (src/components/workout/WeekScheduleEditor.tsx)
- [x] T017 [P] [US1] Build `SessionDurationEditor` component: numeric slider or stepper (15–240 min range) per activity type (tennis, lifting, cardio) (src/components/workout/SessionDurationEditor.tsx)
- [x] T018 [P] [US1] Build `ExerciseWeightEditor` component: searchable list of all exercises from `exercises.ts`, inline numeric input for current weight (kg), shows `0 = bodyweight` label (src/components/workout/ExerciseWeightEditor.tsx)
- [x] T019 [US1] Build `Settings` page: assembles WeekScheduleEditor, SessionDurationEditor, ExerciseWeightEditor with Save button and success toast (src/pages/Settings.tsx)
- [x] T020 [US1] Wire Settings page to `profileStore` — load current values on mount, call store actions on save, verify Home re-renders with updated plan (src/pages/Settings.tsx + src/store/profileStore.ts)

**Checkpoint**: User Story 1 fully functional — Settings page saves and persists changes

---

## Phase 4: User Story 2 — View & Follow Today's Workout (Priority: P1) 🎯 MVP

**Goal**: User opens app and immediately sees today's workout with exercises listed

**Independent Test**: With default schedule (Monday = lifting), open app on a Monday —
verify the Home screen shows a lifting session with exercises distributed across tennis-
performance categories. Verify a rest day shows a recovery prompt instead.

### Implementation for User Story 2

- [x] T021 [P] [US2] Create `useWorkoutPlan` hook: calls `planGenerator` with current `profile` and today's date, memoises by ISO week number, returns `PlannedDay` for today (src/hooks/useWorkoutPlan.ts)
- [x] T022 [P] [US2] Build `WorkoutCard` component: displays a `PlannedExercise` with exercise name, prescribed sets × reps, weight, and tennis-category badge (src/components/workout/WorkoutCard.tsx)
- [x] T023 [P] [US2] Build `ExerciseItem` component: list item for a planned exercise — shows category badge, muscle groups, equipment tags; displays "Set starting weight" prompt if weight is 0 (src/components/workout/ExerciseItem.tsx)
- [x] T024 [P] [US2] Build `StreakBanner` component: reads sessionStore, calculates current consecutive-day streak, shows streak count + encouraging message; shows "Start your streak!" on zero (src/components/workout/StreakBanner.tsx)
- [x] T025 [US2] Build `Home` page: StreakBanner at top, today's workout heading (day type + duration), list of ExerciseItems, "Start Workout" CTA button; rest-day variant shows recovery card (src/pages/Home.tsx)
- [x] T026 [US2] Wire Home page to `useWorkoutPlan` + `sessionStore` — dynamically reflects profile changes, CTA navigates to `/session` passing today's `PlannedDay` (src/pages/Home.tsx + src/hooks/useWorkoutPlan.ts)

**Checkpoint**: User Stories 1 and 2 both independently functional

---

## Phase 5: User Story 3 — Log a Workout Session (Priority: P2)

**Goal**: User logs actual reps, sets, and weights during a session; data persists

**Independent Test**: Start a lifting session from Home, complete 3 exercises with real
weights, tap "Finish session" — verify session appears in sessionStore and streak
increments by 1 on the Home screen.

### Implementation for User Story 3

- [x] T027 [P] [US3] Create `useSessions` hook: exposes `addSession`, `addTennisSession`, session history selectors (src/hooks/useSessions.ts)
- [x] T028 [P] [US3] Build `SetLogInput` component: inline row with set number, reps stepper, weight stepper (± 2.5 kg), pre-filled from prescribed values (src/components/workout/SetLogInput.tsx)
- [x] T029 [P] [US3] Build `ExerciseLogger` component: exercise name + category, expandable set list using SetLogInput rows, "Mark complete" button with green check visual (src/components/workout/ExerciseLogger.tsx)
- [x] T030 [P] [US3] Build `SessionTimer` component: elapsed time display (MM:SS), auto-starts when Session page mounts, stops on "Finish" (src/components/workout/SessionTimer.tsx)
- [x] T031 [US3] Build `Session` page (lifting/cardio variant): SessionTimer header, ordered list of ExerciseLogger components, "Finish Session" button — assembles from PlannedDay passed via router state (src/pages/Session.tsx)
- [x] T032 [US3] Build `TennisSessionLogger` component and integrate into Session page for tennis day type: duration input, notes textarea, "Save Tennis Session" button (src/components/workout/TennisSessionLogger.tsx + src/pages/Session.tsx)
- [x] T033 [US3] Wire Session page to `sessionStore` via `useSessions` — on "Finish": build `WorkoutSession` object from logs, call `addSession`, navigate back to Home (src/pages/Session.tsx + src/store/sessionStore.ts)

**Checkpoint**: User Stories 1, 2, and 3 all independently functional; full session logging works

---

## Phase 6: User Story 4 — Track Progress Over Time (Priority: P3)

**Goal**: User sees consistency charts, weight progression, and tennis session counts

**Independent Test**: After logging 3+ sessions across different dates, open Progress —
verify consistency chart shows correct session counts per week, and weight-progression
chart shows data points for at least one exercise.

### Implementation for User Story 4

- [x] T034 [P] [US4] Build `ConsistencyChart` component: Recharts bar chart, x-axis = last 8 ISO weeks, y-axis = sessions completed vs planned, grouped bars for lifting/tennis/cardio (src/components/progress/ConsistencyChart.tsx)
- [x] T035 [P] [US4] Build `WeightProgressionChart` component: Recharts line chart, x-axis = date, y-axis = max weight (kg) per session, exercise selector dropdown above chart (src/components/progress/WeightProgressionChart.tsx)
- [x] T036 [P] [US4] Build `StatCard` component: compact card showing label + value + optional trend arrow; used for total sessions, current streak, total tennis sessions (src/components/progress/StatCard.tsx)
- [x] T037 [US4] Build `Progress` page: row of 3 StatCards (total sessions / current streak / total tennis), ConsistencyChart, WeightProgressionChart; empty state with encouragement when no sessions exist (src/pages/Progress.tsx)
- [x] T038 [US4] Wire Progress page to `sessionStore` — compute all derived metrics at render time (weekly consistency, weight series, totals), no caching needed for v1 (src/pages/Progress.tsx + src/store/sessionStore.ts)

**Checkpoint**: All 4 user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navigation, responsiveness, edge cases, and deployment validation

- [x] T039 [P] Build `NavBar` component: bottom navigation with icons for Home / Progress / Settings, active-route highlight in clay-orange, no nav bar shown on Session page (src/components/common/NavBar.tsx + src/App.tsx)
- [x] T040 [P] Implement responsive layout: max-width container centred on desktop, full-width on mobile, touch-friendly tap targets (min 44px), no horizontal scroll on 375px viewport (src/App.tsx + src/index.css)
- [x] T041 [P] Add `EmptyState` component: reusable card with tennis-ball illustration slot, heading, subtext, optional CTA button — used on Home (no sessions yet) and Progress (no history) (src/components/common/EmptyState.tsx)
- [x] T042 Handle duplicate session guard: in `sessionStore.addSession`, check if a session already exists for today's date — if yes, prompt user to update or append rather than silently overwriting (src/store/sessionStore.ts)
- [x] T043 Handle missing weight prompt: in `ExerciseItem` and `ExerciseLogger`, if `prescribedWeight === 0`, show inline "Set your starting weight" link that navigates to Settings (src/components/workout/ExerciseItem.tsx + src/components/workout/ExerciseLogger.tsx)
- [x] T044 [P] Add tennis-themed app metadata: favicon (tennis ball SVG), `<title>Rally</title>`, `<meta name="description">`, `<meta name="theme-color" content="#2E7D32">` (public/index.html)
- [x] T045 Run quickstart.md validation: confirm `npm run dev` loads app with default schedule, `npm run build` produces clean `dist/`, hash routing resolves `/settings` and `/progress` correctly after page refresh; document any issues found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — no inter-story dependencies
- **US2 (Phase 4)**: Depends on Foundational — no inter-story dependencies; can run in parallel with US1
- **US3 (Phase 5)**: Depends on Foundational; integrates with US2 (Session navigated from Home)
- **US4 (Phase 6)**: Depends on US3 (needs session data to display)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1**: Independent after Foundation
- **US2**: Independent after Foundation
- **US3**: Soft dependency on US2 (Home navigates to Session); can be stubbed
- **US4**: Depends on US3 data model (reads WorkoutSession records)

### Within Each User Story

- Hooks (T015, T021, T027, etc.) → can be written before or alongside components
- Components → before page assembly
- Page assembly → before store wiring
- Store wiring → before checkpoint verification

### Parallel Opportunities

All tasks marked `[P]` can run in parallel within their phase.

**Phase 2 parallel cluster** (after T007, T010, T011 complete):
```
T005 exercises.ts
T006 defaults.ts        → all three feed T010 profileStore
T008 migration.ts
T009 dateUtils.ts
T012 planGenerator.ts
T013 common components
T014 global theme
```

**US1 parallel cluster** (after Phase 2):
```
T015 useProfile hook
T016 WeekScheduleEditor    → all feed T019 Settings page
T017 SessionDurationEditor
T018 ExerciseWeightEditor
```

**US2 parallel cluster** (after Phase 2):
```
T021 useWorkoutPlan hook
T022 WorkoutCard            → all feed T025 Home page
T023 ExerciseItem
T024 StreakBanner
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Settings)
4. Complete Phase 4: User Story 2 (Home — view today's workout)
5. **STOP and VALIDATE**: User can open app, see today's workout, and change their schedule

### Incremental Delivery

1. Setup + Foundation → app scaffolding ready
2. US1 + US2 → MVP: configure and view workouts
3. US3 → log sessions; streak tracking becomes live
4. US4 → progress charts unlock
5. Polish → deployment-ready

---

## Notes

- `[P]` tasks = different files, no blocking dependencies within the phase
- `[US#]` label maps task to user story for traceability
- No test tasks generated (not requested in spec)
- Each user story phase ends with a checkpoint — validate independently before continuing
- Commit after each checkpoint at minimum
- Avoid editing the same file in parallel tasks within a phase — check the file paths
