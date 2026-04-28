# Tasks: Exercise Customisation

**Input**: Design documents from `specs/004-exercise-customisation/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1=inline quick-exclude, US2=category block, US3=custom exercises, US4=incomplete-day regen)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New types, storage keys, and migration step — everything downstream depends on these.

- [x] T001 Add `CustomExercise` interface and `CustomisationProfile` interface to `src/types.ts` per data-model.md (id: `'custom-' + uuid`, name, category, equipment, primaryMuscleGroup, defaultSets, defaultReps, createdAt)
- [x] T002 [P] Add `advantage_customisation` and `advantage_plan` keys to `src/utils/storage.ts`; bump `SCHEMA_VERSION` from 1 to 2
- [x] T003 [P] Add v2 migration step to `src/utils/migration.ts`: if `advantage_customisation` key absent, initialise with Zustand persist envelope `{ state: { excludedExerciseIds: [], blockedCategories: [], customExercises: [], customisationVersion: 0 }, version: 0 }`; also add `advantage_customisation` and `advantage_plan` to the `KEYS` object iterated by the migration runner

**Checkpoint**: Types available, storage keys registered, migration ready — all downstream tasks unblocked.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Exercise library merge, plan generator refactor, new Zustand stores, and updated hook — required before any user story work.

**⚠️ CRITICAL**: US1/US2/US3/US4 work cannot begin until this phase is complete.

- [x] T004 [P] Add `CATEGORY_DEFAULTS` constant and `getExerciseLibrary(customExercises: CustomExercise[]): Exercise[]` function to `src/data/exercises.ts`; `CATEGORY_DEFAULTS` maps each `TennisCategory` to `{ primaryMuscleGroup, defaultSets, defaultReps, equipment: 'dumbbell' }` per plan.md Decision 3 table; `getExerciseLibrary` returns `[...exercises, ...customExercises]` where each `CustomExercise` satisfies the `Exercise` interface shape
- [x] T005 Refactor `src/engine/planGenerator.ts`: (a) add `buildEligiblePool(allExercises, customisation)` that returns `Record<TennisCategory, Exercise[]>` filtered by `excludedExerciseIds` and `blockedCategories`, with overflow logic for empty category buckets; (b) add `buildTrainingDayFromPool(rand, pool, profile)` replacing the existing `buildTrainingDay`; (c) add `buildSlotsFromPool(customisationVersion, dayIndex, pool, profile, existingDay, completedIds)` for partial-day regen using slot-indexed seed `customisationVersion * 100000 + dayIndex * 1000 + slotIndex`; (d) update `generateWeeklyPlan` to accept optional `customisation?: CustomisationProfile` and `customExercises?: CustomExercise[]` and use the eligible pool when provided
- [x] T006 [P] Create `src/store/customisationStore.ts`: Zustand + persist, key `advantage_customisation`; state: `{ excludedExerciseIds, blockedCategories, customExercises, customisationVersion }`; actions: `excludeExercise`, `includeExercise`, `blockCategory`, `unblockCategory`, `addCustomExercise(name, category)` (uses `CATEGORY_DEFAULTS` to fill defaults, generates `id = 'custom-' + crypto.randomUUID().slice(0,8)`), `deleteCustomExercise(id)` (also removes from excludedExerciseIds); every action bumps `customisationVersion`; helper selectors: `isExcluded(id)`, `isCategoryBlocked(cat)`, `getProfile()`
- [x] T007 Create `src/store/planStore.ts`: Zustand + persist, key `advantage_plan`; state: `{ plan: WeeklyPlan | null }`; action `generateFresh(profile, customisation, customExercises)` calls `generateWeeklyPlan` with the eligible pool and sets `state.plan`; action `applyCustomisation(profile, customisation, customExercises, completions, weekDates)` — guards: if plan null/stale (weekISO mismatch or configVersion mismatch) calls `generateFresh`; otherwise for each training day determines completedIds from `completions.filter(c => c.date === weekDates[dayIndex])`, then: if completedIds covers all exercises → skip; if completedIds is empty → regenerate day entirely; if partial → keep completed PlannedExercise entries and call `buildSlotsFromPool` for the rest
- [x] T008 Rewrite `src/hooks/useWeekPlan.ts`: read `plan` from `usePlanStore`; in a `useEffect` with deps `[profile?.configVersion, customisationVersion, weekISO]` — if profile invalid return null; if plan null/stale call `generateFresh`; otherwise call `applyCustomisation(profile, customisationProfile, customExercises, completions, getWeekDates(new Date()))`; return `plan`

**Checkpoint**: Plan generation is customisation-aware, persisted, and selective — user story UI can now be built.

---

## Phase 3: User Story 1 — Per-Exercise Disable & Inline Quick-Exclude (Priority: P1) 🎯 MVP

**Goal**: User can tap × on any exercise card to exclude it; incomplete days regenerate without that exercise; user can re-enable in Settings → Exercise Management.

**Independent Test**: Tap the quick-exclude button on any card; the card dims; navigate to another incomplete training day and confirm the exercise does not appear. Open Settings → Exercise Management; find the exercise with a restore icon; tap it; confirm the exercise can reappear in future regenerations.

- [x] T009 [US1] Update `src/components/exercise/ExerciseCard.tsx`: add a ghost quick-exclude button in the card header (top-right, 32×32 tap target, `aria-label="Exclude exercise"`); read `isExcluded = useCustomisationStore(s => s.isExcluded(exerciseId))`; when not excluded show `<Icon name="x" size={14}>` in `var(--fg-tertiary)`; when excluded show `<Icon name="plus" size={14}>` in `var(--brand)`; on click call `excludeExercise` or `includeExercise`; when excluded apply `opacity: 0.5` to card content area and add a muted "Excluded" label below the exercise name
- [x] T010 [US1] Create `src/components/settings/ExerciseManagement.tsx`: full-screen panel with `onBack` prop; render one accordion section per `TennisCategory` (display labels: "Lateral Agility", "Rotational Power", "Shoulder Stability", "HIIT Stamina", "General Strength"); within each section list all exercises from `getExerciseLibrary(customExercises)` for that category; each row shows exercise name + exclude/include toggle (`<Icon name="x" size={16}>` in `var(--fg-tertiary)` / `<Icon name="plus" size={16}>` in `var(--brand)`); call `excludeExercise`/`includeExercise` on toggle; use design tokens `var(--bg-surface)`, `var(--shadow-card)`, `var(--font-display)` for category headers per contracts/exercise-management-ui.md
- [x] T011 [US1] Update `src/components/setup/SettingsView.tsx`: add an "Exercise Management" section card below the existing equipment settings; card shows a chevron-right row with label "Exercise Management" and `<Icon name="dumbbell" size={20}>`; clicking sets local state `showExerciseManagement: true`; when true render `<ExerciseManagement onBack={() => setShowExerciseManagement(false)}>` in place of (or above) the settings content

**Checkpoint**: Inline quick-exclude fully functional; ExerciseManagement accessible from Settings; re-enable available.

---

## Phase 4: User Story 2 — Per-Category Block (Priority: P2)

**Goal**: User can block an entire exercise category from Settings → Exercise Management; all exercises in that category are excluded in bulk; incomplete days regenerate with replacements from other categories.

**Independent Test**: Block "HIIT Stamina" in Exercise Management; navigate to any incomplete training day; confirm zero HIIT Stamina exercises appear; confirm total exercise count is still 5 (filled by other categories). Unblock HIIT Stamina; confirm exercises can reappear.

- [x] T012 [US2] Update `src/components/settings/ExerciseManagement.tsx`: add a block/unblock toggle button in each category section header (right side of header row); show `<Icon name="x" size={16}>` + "Block" label when unblocked; show `<Icon name="plus" size={16}>` + "Unblock" label when blocked, with the section label and exercise list dimmed (`var(--fg-tertiary)`, exercises hidden); call `blockCategory`/`unblockCategory`; when all 5 categories are blocked display a warning banner: "No exercises available — unblock at least one category to generate workouts" in `var(--color-forest-100)` bg with `<Icon name="spark" size={16}>`

**Checkpoint**: Category-level blocking works; blocked sections collapse; all-blocked warning shown.

---

## Phase 5: User Story 3 — Add Custom Exercises (Priority: P3)

**Goal**: User can add a new exercise (name + category) from Exercise Management; it appears in the library immediately and is eligible for plan regeneration; user can delete it.

**Independent Test**: Add a custom exercise "Bulgarian Split Squat" in Lateral Agility; confirm it appears in the Exercise Management list with a [Custom] badge; trigger plan regeneration for an incomplete day; confirm it can appear. Delete it; confirm it is removed.

- [x] T013 [US3] Create `src/components/settings/AddExerciseForm.tsx`: props `{ initialCategory?: TennisCategory; onSave: (name, category) => void; onCancel: () => void }`; renders a name text input (max 60 chars) and a 5-button category selector; submit button disabled when name empty; on submit: validate name not blank and not duplicate (case-insensitive) in same category against `getExerciseLibrary(customExercises)`; show inline error messages on failure; call `onSave(name, category)` on success; use design tokens per contracts/exercise-management-ui.md
- [x] T014 [US3] Update `src/components/settings/ExerciseManagement.tsx`: add an "Add exercise" button at the bottom of each unblocked category section (label + `<Icon name="plus" size={16}>`); clicking opens `AddExerciseForm` with `initialCategory` pre-set; on `AddExerciseForm.onSave` call `customisationStore.addCustomExercise(name, category)` and close form; custom exercises in the exercise list show a `[Custom]` badge (`var(--brand-soft)` bg, `var(--color-forest-800)` text, 10px, JetBrains Mono) and a delete button (`<Icon name="x" size={12}>` in muted red); on delete tap call `deleteCustomExercise(id)` with confirmation (inline "Are you sure?" expand, not a native dialog)

**Checkpoint**: Custom exercises fully manageable; [Custom] badge visible; deletion with confirmation.

---

## Phase 6: User Story 4 — Regenerate Only Incomplete Days (Priority: P4)

**Goal**: Completed workout days are never altered when exclusions change; only incomplete or partial days are regenerated.

**Independent Test**: Mark all exercises on a training day complete; exclude one of those exercises; confirm the completed day is unchanged. On another incomplete day, confirm the excluded exercise does not appear. Mark only 2 of 5 exercises complete on a day; exclude a third; confirm the 2 completed remain and only the incomplete slots change.

- [x] T015 [US4] Add `getWeekDayISO(weekISO: string, day: DayOfWeek): string` to `src/utils/dateUtils.ts`: computes the ISO date string (YYYY-MM-DD) for a given day within the week identified by `weekISO` (e.g., `"2026-W18"` + `"Wed"` → `"2026-04-29"`); used by `planStore.applyCustomisation` to map each DayOfWeek to its concrete date for completion lookup; implement using the ISO week standard (Monday = day 0 of the week)
- [x] T016 [US4] Update `src/components/main/DayRoutineView.tsx`: add an "empty pool" state — if a training day has `exercises.length === 0` (FR-008 placeholder state), render a full-card message with `<Icon name="spark" size={28}>` + heading "No exercises available" + body "All exercises in this category are excluded. Visit Settings → Exercise Management to restore some." using `var(--fg-tertiary)` text and same opacity/focused behaviour as a normal training day card

**Checkpoint**: Completed days immutable after exclusion changes; empty-pool state visible to user.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Type verification, build confirmation, and visual browser check.

- [x] T017 Run `npx tsc --noEmit` and fix any TypeScript errors across all new and modified files; then run `npm run build` and confirm clean production build
- [ ] T018 [P] Visual browser verification per quickstart.md: open `npm run dev`, walk through all 5 quickstart scenarios (inline quick-exclude, category block, add custom exercise, completed day preserved, partial day preserved); confirm no emoji appear in any new UI

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T002 and T003 can run in parallel
- **Phase 2 (Foundational)**: Depends on Phase 1; T004 and T006 can run in parallel; T005 depends on T004; T007 depends on T004, T005, T006; T008 depends on T006, T007
- **Phase 3 (US1)**: Depends on Phase 2; T009–T011 are sequential (T010 needed before T011)
- **Phase 4 (US2)**: Depends on T010 (extends ExerciseManagement); single task T012
- **Phase 5 (US3)**: Depends on T010 (extends ExerciseManagement); T013 → T014
- **Phase 6 (US4)**: Depends on Phase 2; T015 → update planStore if needed; T016 independent of T015
- **Phase 7 (Polish)**: Depends on Phases 3–6 completion

### User Story Dependencies

- **US1 (P1)**: After Phase 2; T009–T011 sequential (T010 creates the component T011 uses)
- **US2 (P2)**: After T010 (ExerciseManagement created); T012 extends same file
- **US3 (P3)**: After T010; T013 creates AddExerciseForm, T014 wires it in
- **US4 (P4)**: After Phase 2 (core logic in planStore/useWeekPlan); T015 and T016 are independent of each other

---

## Parallel Opportunities

### Phase 1

```
T002: Update storage.ts   ← parallel
T003: Update migration.ts ← parallel
T001: Update types.ts     ← sequential first (T002/T003 can start after T001)
```

### Phase 2

```
T004: exercises.ts (getExerciseLibrary)  ← parallel with T006
T006: customisationStore.ts             ← parallel with T004
T005: planGenerator.ts                  ← after T004
T007: planStore.ts                      ← after T004, T005, T006
T008: useWeekPlan.ts                    ← after T006, T007
```

### Phase 5 (US3) — T013 and T010/T012 are separate files

```
T013: AddExerciseForm.tsx  ← can start in parallel with T012
T014: ExerciseManagement.tsx (wire in form)  ← after T013 and T012
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008)
3. Complete Phase 3: US1 inline quick-exclude (T009–T011)
4. **STOP and VALIDATE**: test via quickstart.md Scenario 1
5. Ship if deadline requires — US2/US3/US4 are enhancements

### Incremental Delivery

1. Phase 1 + 2 → customisation-aware plan generator live
2. Phase 3 (US1) → inline quick-exclude + Exercise Management re-enable ✅
3. Phase 4 (US2) → category blocking ✅
4. Phase 5 (US3) → custom exercises ✅
5. Phase 6 (US4) → empty-pool feedback + day-ISO utility ✅
6. Phase 7 → verified, clean build ✅

---

## Notes

- [P] tasks = different files, safe to execute in parallel
- No tests requested in spec — no test tasks generated
- T010/T012/T014 all modify the same `ExerciseManagement.tsx` file — run them strictly sequentially
- T015 (`getWeekDayISO`) is a pure utility function; implement and verify separately before trusting `planStore.applyCustomisation` day-mapping correctness
- Visual verification (T018) requires `npm run dev` and a browser — not replaceable by `tsc --noEmit` alone
