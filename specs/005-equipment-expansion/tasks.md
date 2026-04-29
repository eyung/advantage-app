# Tasks: Equipment Expansion

**Input**: Design documents from `specs/005-equipment-expansion/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1=equipment profile, US2=per-session availability, US3=aesthetics days, US4=exercise library)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New types, storage keys, and migration step — everything downstream depends on these.

- [x] T001 Add new types to `src/types.ts`: (a) `type ResistanceBandLevel = 'Light' | 'Medium' | 'Heavy' | 'Extra-Heavy'`; (b) `type EquipmentType = 'dumbbells' | 'resistance-bands' | 'kettlebells' | 'bodyweight'`; (c) extend `Exercise.equipment` to `'dumbbell' | 'bodyweight' | 'resistance-band' | 'kettlebell'`; (d) add `goalTags?: ('aesthetics')[]` to `Exercise` and `CustomExercise`; (e) extend `EquipmentProfile` with `kettlebellWeights: number[]`, `resistanceBandLevels: ResistanceBandLevel[]`, `aestheticsDays: DayOfWeek[]`, `defaultEquipmentTypes: EquipmentType[]`; (f) add `SessionEquipmentAvailability` interface `{ availableTypes: EquipmentType[]; date: string }`
- [x] T002 [P] Update `src/utils/storage.ts`: bump `SCHEMA_VERSION` from 2 to 3; add `sessionEquipment: 'advantage_session_equipment'` to the `KEYS` object
- [x] T003 [P] Add v3 migration step to `src/utils/migration.ts`: parse the existing `advantage_equipment` value; add missing fields `kettlebellWeights: []`, `resistanceBandLevels: []`, `aestheticsDays: []`, `defaultEquipmentTypes: ['dumbbells', 'bodyweight']` to its persisted state if absent; also initialise `advantage_session_equipment` to `{ availableTypes: ['dumbbells', 'bodyweight'], date: '' }` if absent

**Checkpoint**: Types available, KEYS updated, migration ready — all downstream tasks unblocked.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New exercises, engine updates, new store, and store/hook updates — required before any user story UI work.

**⚠️ CRITICAL**: US1/US2/US3/US4 UI work cannot begin until this phase is complete.

All T004–T008 can run in parallel (different files, all depend only on Phase 1 being complete). T009 depends on T007. T010 depends on T005 and T008.

- [x] T004 [P] Add 22 new built-in exercises to `src/data/exercises.ts` in their respective category sections; also add `goalTags: ['aesthetics']` to the 5 aesthetics-tagged exercises per plan.md §New Built-In Exercises table. Resistance band exercises (equipment: `'resistance-band'`): `band-lateral-walk` (lateral-agility/legs, 3×12), `band-monster-walk` (lateral-agility/legs, 3×12), `band-pull-apart` (shoulder-stability/shoulders, 3×15), `band-external-rotation` (shoulder-stability/shoulders, 3×12), `band-face-pull` (shoulder-stability/shoulders, 3×12), `band-woodchop` (rotational-power/core, 3×12), `band-rotational-row` (rotational-power/core, 3×12), `band-squat` (general-strength/legs, 3×12, aesthetics), `band-bicep-curl` (general-strength/arms, 3×15, aesthetics), `band-tricep-pushdown` (general-strength/arms, 3×15, aesthetics), `band-sprint-resistance` (hiit-stamina/full-body, 4×10). Kettlebell exercises (equipment: `'kettlebell'`): `kb-swing` (hiit-stamina/full-body, 4×15), `kb-clean` (hiit-stamina/full-body, 3×8), `kb-snatch` (hiit-stamina/full-body, 3×6), `kb-goblet-squat` (general-strength/legs, 4×10, aesthetics), `kb-deadlift` (general-strength/legs, 4×8), `kb-single-leg-deadlift` (lateral-agility/legs, 3×10), `kb-lateral-lunge` (lateral-agility/legs, 3×10), `kb-windmill` (rotational-power/core, 3×8), `kb-turkish-get-up` (rotational-power/full-body, 3×5), `kb-halo` (shoulder-stability/shoulders, 3×10), `kb-press` (shoulder-stability/shoulders, 3×10, aesthetics). Also update `exerciseMap` export (it uses `exercises.map` so updates automatically). No changes needed to `getExerciseLibrary` or `CATEGORY_DEFAULTS`.
- [x] T005 [P] Create `src/store/sessionEquipmentStore.ts`: Zustand + persist, key `advantage_session_equipment`; state `{ availableTypes: EquipmentType[], date: string }`; action `setAvailable(types: EquipmentType[])` sets `availableTypes` + `date: getTodayISO()`; selector `getAvailable(defaultTypes: EquipmentType[]): EquipmentType[]` — if `date !== getTodayISO()` return `defaultTypes` (and reset store to `{ availableTypes: defaultTypes, date: getTodayISO() }`); otherwise return `availableTypes`; import `getTodayISO` from `src/utils/dateUtils.ts`
- [x] T006 [P] Update `src/store/customisationStore.ts`: extend `addCustomExercise(name, category, goalTags?: ('aesthetics')[])` to persist `goalTags` on the created `CustomExercise`; no other changes
- [x] T007 [P] Update `src/store/equipmentStore.ts`: update `saveConfig` signature to `saveConfig(weights: number[], kettlebellWeights: number[], resistanceBandLevels: ResistanceBandLevel[], days: DayOfWeek[], aestheticsDays: DayOfWeek[], defaultEquipmentTypes: EquipmentType[]): void`; persist all new fields on `EquipmentProfile`; add `saveDefaultEquipment(types: EquipmentType[]): void` action that updates `defaultEquipmentTypes` + bumps `configVersion` on the stored profile
- [x] T008 [P] Update `src/engine/planGenerator.ts`: (a) add `const BAND_KG_MAP: Record<ResistanceBandLevel, number> = { Light: 5, Medium: 15, Heavy: 30, 'Extra-Heavy': 50 }` and import `ResistanceBandLevel, EquipmentType` from types; (b) add `function getWeightForExercise(exercise: Exercise, profile: EquipmentProfile): number` that switches on `exercise.equipment`: `'dumbbell'` → `assignWeight(exercise, profile.dumbbellWeights)`, `'kettlebell'` → `assignWeight(exercise, profile.kettlebellWeights ?? [])`, `'resistance-band'` → compute `bandKg = (profile.resistanceBandLevels ?? []).map(l => BAND_KG_MAP[l]).sort((a,b)=>a-b)` then `assignWeight(exercise, bandKg.length > 0 ? bandKg : [0])`, `'bodyweight'` → `0`; (c) update `buildEligiblePool` signature to `(allExercises, customisation, availableEquipmentTypes: EquipmentType[] = ['dumbbells', 'bodyweight'])` — add equipment filter: build `equipmentSet = new Set(['bodyweight', ...availableEquipmentTypes.map(t => t === 'dumbbells' ? 'dumbbell' : t === 'resistance-bands' ? 'resistance-band' : t === 'kettlebells' ? 'kettlebell' : 'bodyweight')])` then also include `e.equipment === 'bodyweight'` unconditionally; add `equipmentSet.has(e.equipment)` to the per-exercise filter; (d) replace `assignWeight(exercise, profile.dumbbellWeights)` with `getWeightForExercise(exercise, profile)` in both `buildTrainingDayFromPool` and `buildSlotsFromPool`; (e) update `generateWeeklyPlan` signature to accept `availableEquipmentTypes?: EquipmentType[]` and pass it to `buildEligiblePool`; (f) add aesthetics post-process in `generateWeeklyPlan`: after `buildTrainingDayFromPool` produces exercises for a training day, if `profile.aestheticsDays?.includes(day)` and no selected exercise has `goalTags?.includes('aesthetics')`, collect all aesthetics-tagged exercises from all pool buckets, if any exist pick one using `mulberry32((profile.configVersion * 10000 + weekNum * 100 + dayIndex * 10) >>> 0)()` and swap the last planned exercise slot with it (reassigning weight via `getWeightForExercise`)
- [x] T009 Update `src/hooks/useEquipment.ts`: expose `kettlebellWeights`, `resistanceBandLevels`, `aestheticsDays`, `defaultEquipmentTypes` from `profile`; update `save` to accept and forward these new fields to `equipmentStore.saveConfig`; expose `saveDefaultEquipment` from the store (depends on T007)
- [x] T010 Update `src/store/planStore.ts` and `src/hooks/useWeekPlan.ts`: in `planStore.ts` update `generateFresh` and `applyCustomisation` to accept `availableEquipmentTypes: EquipmentType[]` and pass it through to `buildEligiblePool`; in `useWeekPlan.ts` import `useSessionEquipmentStore` and call `sessionEquipmentStore.getAvailable(profile.defaultEquipmentTypes ?? ['dumbbells', 'bodyweight'])` to obtain `availableEquipmentTypes`; pass it to `generateFresh` and `applyCustomisation` (depends on T005, T008)

**Checkpoint**: Engine accepts new equipment types, weight assignment works for bands/kettlebells, aesthetics guarantee active, session equipment store ready.

---

## Phase 3: User Story 1 — Configure Equipment Profile (Priority: P1) 🎯 MVP

**Goal**: User can add resistance band levels and kettlebell weights in Settings; plan immediately uses these when regenerated.

**Independent Test**: In Settings add "Heavy" resistance band + 16 kg kettlebell. Save. Open today's workout. Confirm band and/or kettlebell exercises appear. Confirm band exercise shows "30 kg (band)" weight label.

- [x] T011 [US1] Create `src/components/setup/ResistanceBandInput.tsx` per contracts/equipment-settings-ui.md: props `{ selected: ResistanceBandLevel[], onChange: (levels: ResistanceBandLevel[]) => void }`; render 4 toggle buttons in order Light / Medium / Heavy / Extra-Heavy; active = `var(--brand)` bg + white text; inactive = `var(--bg-surface)` + `var(--border-hairline)` border + `var(--fg-secondary)` text; buttons are multi-select (toggle on/off); section label "Resistance Bands" + helper text "Select the resistance levels you own"; no emoji
- [x] T012 [P] [US1] Create `src/components/setup/KettlebellInput.tsx`: identical UI pattern to `src/components/setup/DumbbellInput.tsx` (pill chips + number input + Add button + × remove); section label "Kettlebells (kg)"; same validation (positive integer, no duplicates); props `{ weights: number[], onChange: (weights: number[]) => void }`
- [x] T013 [P] [US1] Update `src/components/exercise/ExerciseCard.tsx`: after looking up the exercise from `exerciseMap` or `customExercises`, check `exercise?.equipment === 'resistance-band'`; if so and `plannedExercise.weightKg > 0`, display the weight as `"${plannedExercise.weightKg} kg (band)"` instead of `"${plannedExercise.weightKg} kg"` — update the weight label rendering accordingly
- [x] T014 [US1] Update `src/components/setup/SettingsView.tsx`: (a) add local state for `kettlebellWeights`, `resistanceBandLevels`, `defaultEquipmentTypes` initialized from profile; (b) add `<ResistanceBandInput>` card between DumbbellInput and DaySelector; (c) add `<KettlebellInput>` card after ResistanceBandInput; (d) add a "Default Equipment" card (after DaySelector) showing toggle rows for each owned equipment type (show dumbbell row always, band row only if resistanceBandLevels.length > 0, kettlebell row only if kettlebellWeights.length > 0, bodyweight row always-checked disabled); (e) update `handleSave` to call the updated `saveConfig(weights, kettlebellWeights, resistanceBandLevels, days, aestheticsDays, defaultEquipmentTypes)`; (f) update `canSave` guard to still only require at least 1 dumbbell weight and 3–6 training days (bands/kettlebells remain optional)

**Checkpoint**: Resistance bands and kettlebells configurable; plan generates exercises using those equipment types; weight labels correct.

---

## Phase 4: User Story 2 — Per-Session Equipment Availability (Priority: P2)

**Goal**: User can toggle today's available equipment before a workout; plan uses only available equipment; selection resets to default next day.

**Independent Test**: Configure dumbbells + Heavy band + 16 kg kettlebell. In the workout view, deselect dumbbells and kettlebells (bands + bodyweight only). Confirm today's plan has zero dumbbell/kettlebell exercises. Reload the app next day (or change device date); confirm equipment bar resets to default.

- [x] T015 [US2] Create `src/components/main/SessionEquipmentBar.tsx` per contracts/session-equipment-ui.md: props `{ profile: EquipmentProfile }`; reads `sessionEquipmentStore.getAvailable(profile.defaultEquipmentTypes ?? ['dumbbells', 'bodyweight'])`; renders "Today's equipment" label (11px uppercase `var(--fg-tertiary)`) + horizontal pill row; pill per owned equipment type (dumbbell if dumbbellWeights > 0, band if resistanceBandLevels.length > 0, kettlebell if kettlebellWeights.length > 0, bodyweight always); active pill: `var(--brand)` bg + white; inactive pill: `var(--bg-surface)` + `var(--border-hairline)` + `var(--fg-tertiary)`; bodyweight pill always active + disabled (not tappable); on pill toggle call `sessionEquipmentStore.setAvailable(newTypes)` (bodyweight always included); show "Save as default" ghost button when `availableTypes` differs from `profile.defaultEquipmentTypes`; on "Save as default" call `useEquipmentStore(s => s.saveDefaultEquipment)(availableTypes)`; no emoji
- [x] T016 [US2] Update `src/components/main/MainView.tsx`: import `SessionEquipmentBar` and the `useEquipment` hook; render `<SessionEquipmentBar profile={profile} />` inside the "today" tab content, above the training day card list, only when `profile` is non-null (wrap with null guard); the bar's `setAvailable` call updates `sessionEquipmentStore` which causes `useWeekPlan` to react (via its dep on available equipment types) and regenerate the plan

**Checkpoint**: Equipment bar visible in workout view; toggling pills regenerates today's plan; "Save as default" persists.

---

## Phase 5: User Story 3 — Body Aesthetics Training Days (Priority: P3)

**Goal**: User designates specific training days as aesthetics days; plan guarantees at least one aesthetics-tagged exercise on those days; custom exercises can also be tagged.

**Independent Test**: Enable aesthetics on Wednesday in Settings. Navigate to Wednesday plan. Confirm at least one exercise is aesthetics-tagged (Band Squat, Band Bicep Curl, Band Tricep Pushdown, KB Goblet Squat, or KB Press — or a custom aesthetics exercise). Navigate to Monday; confirm no aesthetics-only exercises appear.

- [x] T017 [US3] Create `src/components/setup/AestheticsDaySelector.tsx` per contracts/equipment-settings-ui.md: props `{ trainingDays: DayOfWeek[], selected: DayOfWeek[], onChange: (days: DayOfWeek[]) => void }`; render only days in `trainingDays` as toggle buttons (same multi-select pill style as training day selector); active = `var(--brand)` fill; inactive = ghost `var(--border-hairline)`; section label "Aesthetics Days"; helper text "On these days, one exercise is aesthetics-focused"; if `trainingDays` is empty show muted text "Configure training days first"; no emoji
- [x] T018 [P] [US3] Update `src/components/settings/AddExerciseForm.tsx`: (a) add `goalTags: ('aesthetics')[]` to local state (default `[]`); (b) add checkbox row below category selector: label "Aesthetics exercise", unchecked default, `accent-color: var(--brand)`, helper "This exercise appears on aesthetics-focused training days"; (c) update `onSave` call to `onSave(name, category, goalTags)` where `goalTags = isAesthetics ? ['aesthetics'] : []`; (d) update `Props.onSave` type to `(name: string, category: TennisCategory, goalTags: ('aesthetics')[]) => void`
- [x] T019 [US3] Update `src/components/setup/SettingsView.tsx`: (a) add local state `aestheticsDays` initialized from `profile?.aestheticsDays ?? []`; (b) render `<AestheticsDaySelector trainingDays={days} selected={aestheticsDays} onChange={setAestheticsDays} />` in a new card after the DaySelector card; (c) ensure `handleSave` passes `aestheticsDays` to `saveConfig` (it already passes it after T014 update — verify the argument is wired)
- [x] T020 [US3] Update `src/components/settings/ExerciseManagement.tsx`: update the `onSave` handler for `AddExerciseForm` to accept the new 3-argument signature `(name, category, goalTags)` and call `customisationStore.addCustomExercise(name, category, goalTags)` (depends on T018)

**Checkpoint**: Aesthetics days configurable; plan guarantees aesthetics exercise on designated days; custom exercises can carry aesthetics tag.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type verification, build confirmation, and visual browser check.

- [x] T021 Run `npx tsc --noEmit` and fix any TypeScript errors across all new and modified files; then run `npm run build` and confirm clean production build
- [ ] T022 [P] Visual browser verification per `specs/005-equipment-expansion/quickstart.md`: open `npm run dev` and walk through all 7 quickstart scenarios; confirm band exercises show "(band)" suffix, session bar resets next day, aesthetics exercises appear on designated days, no emoji in any new UI

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T002 and T003 parallel after T001
- **Phase 2 (Foundational)**: Depends on Phase 1; T004–T008 parallel; T009 after T007; T010 after T005 + T008
- **Phase 3 (US1)**: Depends on Phase 2; T011 + T012 + T013 parallel; T014 after T011 + T012
- **Phase 4 (US2)**: Depends on Phase 2 + T014; T015 → T016 sequential
- **Phase 5 (US3)**: Depends on Phase 2 + T014; T017 + T018 parallel; T019 after T017; T020 after T018
- **Phase 6 (Polish)**: Depends on Phases 3–5 completion

### User Story Dependencies

- **US1 (P1)**: After Phase 2; T011/T012/T013 parallel, T014 after T011+T012
- **US2 (P2)**: After Phase 2 + T014; T015 → T016 sequential
- **US3 (P3)**: After Phase 2 + T014; T017/T018 parallel, T019 after T017, T020 after T018
- **US4 (P4)**: Completed in Phase 2 (T004 adds all exercises); ExerciseManagement shows them automatically; T013 handles weight display

---

## Parallel Opportunities

### Phase 1

```
T001: types.ts         ← first
T002: storage.ts       ← parallel after T001
T003: migration.ts     ← parallel after T001
```

### Phase 2

```
T004: exercises.ts            ← parallel
T005: sessionEquipmentStore   ← parallel
T006: customisationStore      ← parallel
T007: equipmentStore          ← parallel
T008: planGenerator           ← parallel
T009: useEquipment            ← after T007
T010: planStore+useWeekPlan   ← after T005 + T008
```

### Phase 3 (US1)

```
T011: ResistanceBandInput   ← parallel
T012: KettlebellInput       ← parallel
T013: ExerciseCard          ← parallel
T014: SettingsView          ← after T011 + T012
```

### Phase 5 (US3)

```
T017: AestheticsDaySelector  ← parallel
T018: AddExerciseForm        ← parallel
T019: SettingsView           ← after T017
T020: ExerciseManagement     ← after T018
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010)
3. Complete Phase 3: US1 equipment profile UI (T011–T014)
4. **STOP and VALIDATE**: run quickstart.md Scenarios 1 and 4
5. Ship if deadline requires — US2/US3 are enhancements

### Incremental Delivery

1. Phase 1 + 2 → engine accepts resistance bands + kettlebells + aesthetics guarantee
2. Phase 3 (US1) → band/kettlebell configurable in Settings ✅
3. Phase 4 (US2) → session equipment bar live ✅
4. Phase 5 (US3) → aesthetics days configurable; custom aesthetics exercises ✅
5. Phase 6 → verified, clean build ✅

---

## Notes

- [P] tasks = different files, safe to execute in parallel
- No tests requested in spec — no test tasks generated
- T014 and T019 both modify `SettingsView.tsx` — run strictly sequentially (T014 → T019)
- T018 (AddExerciseForm) and T020 (ExerciseManagement) are different files — can start in parallel with T017 then wire sequentially
- Visual verification (T022) requires `npm run dev` and a browser — not replaceable by `tsc --noEmit` alone
- `bodyweight` is always included in the equipment filter regardless of session settings (per spec Assumption §8)
- Aesthetics guarantee only fires when needed — non-aesthetics days are unaffected by this logic
