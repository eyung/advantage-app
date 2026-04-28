# Tasks: Advantage Design System Implementation

**Input**: Design documents from `specs/003-ui-design-implementation/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1 = visual redesign, US2 = 3-day view, US3 = outlined chips)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Assets, fonts, design tokens, and the shared Icon component — everything downstream tasks depend on.

- [x] T001 Copy 15 SVG stroke icons from design bundle into `public/icons/`
- [x] T002 [P] Copy brand assets (`logo-mark.svg`, `logo-wordmark.svg`, `court-diagram.svg`) into `public/`
- [x] T003 Add Fraunces + JetBrains Mono to Google Fonts `<link>` in `index.html`; update `theme-color` to `#245236`
- [x] T004 Replace Tailwind color palette with forest/slate/bone tokens; add `fontFamily.display` (Fraunces) and `fontFamily.mono` (JetBrains Mono) in `tailwind.config.ts`
- [x] T005 Define all CSS custom properties (color, font, shadow, border tokens) in `src/index.css`; remove `court-bg` grid pattern; update `body` background to `var(--bg-app)`
- [x] T006 Create shared `Icon` component at `src/components/ui/Icon.tsx` per contract `contracts/icon-system.md`

**Checkpoint**: Assets served, fonts loading, tokens available, Icon renderable — all downstream tasks unblocked.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout components used by every screen.

**⚠️ CRITICAL**: US1/US2/US3 work cannot begin until this phase is complete.

- [x] T007 Update `MainView.tsx` header: replace 🎾 emoji with `logo-mark.svg` + Fraunces wordmark; replace ⚙️ with `<Icon name="settings">`; apply `var(--bg-surface)` + `var(--border-hairline)` header bar
- [x] T008 Update `MainView.tsx` bottom nav: replace 📅/📊 emoji with `<Icon name="calendar">` / `<Icon name="chart">`; active item colour `var(--brand)`; nav border `var(--border-hairline)`

**Checkpoint**: App shell (header + nav) matches design system — screens can now be restyled.

---

## Phase 3: User Story 1 — Visual Redesign (Priority: P1) 🎯 MVP

**Goal**: Every screen uses the bone canvas, forest green brand, Fraunces display, and JetBrains Mono numerics. Zero emoji remain.

**Independent Test**: Open Setup Wizard on a fresh install; confirm bone background (`#f7f5ee`), SVG logo, Fraunces heading, forest-green CTA button, no emoji anywhere.

- [x] T009 [P] [US1] Update `SetupWizard.tsx`: replace 🎾 with `logo-mark.svg`; apply Fraunces h1; CTA button → `var(--brand)` fill, label "Generate my plan"; card background `var(--bg-surface)` with `var(--shadow-card)` in `src/components/setup/SetupWizard.tsx`
- [x] T010 [P] [US1] Update `DumbbellInput.tsx`: "Add" button → `var(--brand)`; weight tags → `var(--brand-soft)` bg + `var(--color-forest-800)` text + `--font-mono`; "×" → `<Icon name="x" size={12}>` in `src/components/setup/DumbbellInput.tsx`
- [x] T011 [P] [US1] Update `DaySelector.tsx`: active day → `var(--brand)` bg; inactive → `var(--bg-recessed)`; count indicator uses `var(--color-success)` when valid in `src/components/setup/DaySelector.tsx`
- [x] T012 [P] [US1] Update `SettingsView.tsx`: back arrow → `<Icon name="chevron-left">`; header Fraunces; save button → `var(--brand)` / success green on saved; card `var(--shadow-card)` in `src/components/setup/SettingsView.tsx`
- [x] T013 [P] [US1] Update `ProgressView.tsx`: 💪/🏆 emoji → `<Icon name="bolt">` / `<Icon name="trophy">`; "This week" label → eyebrow style (11px Inter 600, 0.08em tracking, uppercase); big number → Fraunces 40px in `src/components/progress/ProgressView.tsx`
- [x] T014 [P] [US1] Update `ConsistencyChart.tsx`: planned bars → `var(--color-forest-200)`; completed bars → `var(--brand)`; remove Legend/Tooltip; axis ticks `--font-mono` 10px in `src/components/progress/ConsistencyChart.tsx`
- [x] T015 [P] [US1] Update `PersonalBestList.tsx`: 🏆 → `<Icon name="trophy">`; weight badge → `var(--brand-soft)` bg + `--font-mono`; empty state uses icon not emoji in `src/components/progress/PersonalBestList.tsx`
- [x] T016 [P] [US1] Update `DayTabBar.tsx`: active tab underline → `var(--brand)`; completed badge → `var(--color-success)` green; "rest" label → italic muted; day label uses `--font-mono` for badge count in `src/components/main/DayTabBar.tsx`
- [x] T017 [P] [US1] Update `CompletionBadge.tsx`: bg → `var(--color-success)`; "✓" text → `<Icon name="check" size={12}>` with brightness invert filter in `src/components/exercise/CompletionBadge.tsx`

**Checkpoint**: All screens render with forest/bone palette, Fraunces headings, no emoji. Verify visually in browser.

---

## Phase 4: User Story 2 — Three-Day Workout View (Priority: P2)

**Goal**: Today tab shows prev / selected / next day cards stacked vertically. Focused card is full opacity; adjacent cards are 50% opacity.

**Independent Test**: Select Wed; confirm Tue + Wed + Thu cards visible. Select Mon; confirm only Mon + Tue visible. Adjacent cards at 50% opacity.

- [x] T018 [US2] Add 3-day window logic to `MainView.tsx`: compute `visibleDays = [idx-1, idx, idx+1]` clamped to `ALL_DAYS` bounds; render `DayRoutineView` for each with `focused={day === selectedDay}` prop in `src/components/main/MainView.tsx`
- [x] T019 [US2] Update `DayRoutineView.tsx` props: add `focused: boolean`; apply `opacity: focused ? 1 : 0.5` and `transition: opacity 200ms` to card wrapper; rest-day card also respects opacity in `src/components/main/DayRoutineView.tsx`
- [x] T020 [US2] Update rest-day card in `DayRoutineView.tsx`: replace 😴 with `<Icon name="moon" size={28}>`; header row shows day label (uppercase eyebrow) + "Rest day" label; recovery copy from design spec in `src/components/main/DayRoutineView.tsx`
- [x] T021 [US2] Add focused-day label to training day header in `DayRoutineView.tsx`: eyebrow shows `{dayLabel} · Today` in `var(--brand)` when focused, plain `var(--fg-tertiary)` otherwise; done count uses `--font-mono` in `src/components/main/DayRoutineView.tsx`

**Checkpoint**: Three-day window renders correctly for all 7 day selections. Opacity transitions on day tab change.

---

## Phase 5: User Story 3 — Outlined Category Chips (Priority: P3)

**Goal**: Category pills on exercise cards have a 1px category-colour border and transparent background. Completed card state uses brand-soft bg + inset left border.

**Independent Test**: Render any exercise card; verify chip has `border: 1px solid {categoryColor}`, `background: transparent`. Tap Complete; verify card bg is `--color-forest-100` with 3px inset left `--brand` border.

- [x] T022 [US3] Update `ExerciseCard.tsx` category chip: change from filled `bg-category-*/15` Tailwind classes to inline style `border: 1px solid {cat.color}`, `background: transparent`, `color: cat.color`, `border-radius: 999px` in `src/components/exercise/ExerciseCard.tsx`
- [x] T023 [US3] Update `ExerciseCard.tsx` completed state: bg → `var(--color-forest-100)`; box-shadow → `var(--shadow-card), inset 3px 0 0 var(--brand)`; exercise name strikethrough + `var(--color-slate-400)` in `src/components/exercise/ExerciseCard.tsx`
- [x] T024 [US3] Update `ExerciseCard.tsx` sets/reps/weight row: use `--font-mono` for all three values; weight tag → `var(--brand-soft)` bg pill with `var(--color-forest-800)` text + `--font-mono`; Complete/Undo button → `var(--brand)` / `var(--bg-recessed)` in `src/components/exercise/ExerciseCard.tsx`

**Checkpoint**: All five category types render with correctly coloured outlined chips (verify in browser). Complete toggle switches card between paper and forest-100 states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, constitution amendment, and any remaining details.

- [x] T025 Run `npx tsc --noEmit` and fix any TypeScript errors across all updated files
- [x] T026 Run `npm run build` and confirm clean production build
- [x] T027 [P] Amend constitution Styling clause: update `#4CAF50`/`#E65100`/`#FAFAFA` → forest-700/slate/bone; bump version to 1.0.1 in `.specify/memory/constitution.md`
- [ ] T028 [P] Visual browser verification per constitution §Development Workflow: open `npm run dev`, confirm Setup Wizard → Today (3-day) → Progress → Settings all render correctly with no emoji

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion (needs Icon component + tokens)
- **Phase 3 (US1)**: Depends on Phase 2; all US1 tasks marked [P] can run in parallel
- **Phase 4 (US2)**: Depends on Phase 2; T018–T021 are sequential (T019/T020/T021 update same file)
- **Phase 5 (US3)**: Depends on Phase 2; T022–T024 are sequential (same file)
- **Phase 6 (Polish)**: Depends on Phases 3–5 completion

### User Story Dependencies

- **US1 (P1)**: After Phase 2; all 9 tasks [P] (different files)
- **US2 (P2)**: After Phase 2; T018 → T019 → T020/T021 (T020/T021 same file, run sequentially)
- **US3 (P3)**: After Phase 2; T022 → T023 → T024 (same file, run sequentially)

---

## Parallel Opportunities

### Phase 1 — T001 and T002 in parallel (different asset types)

```
T001: Copy icons/        ← parallel
T002: Copy brand assets  ← parallel
T003: Update index.html
T004: Update tailwind.config.ts
T005: Update index.css
T006: Create Icon.tsx
```

### Phase 3 (US1) — all 9 tasks in parallel (all different files)

```
T009: SetupWizard.tsx        T010: DumbbellInput.tsx     T011: DaySelector.tsx
T012: SettingsView.tsx       T013: ProgressView.tsx      T014: ConsistencyChart.tsx
T015: PersonalBestList.tsx   T016: DayTabBar.tsx         T017: CompletionBadge.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T008)
3. Complete Phase 3: US1 visual redesign (T009–T017)
4. **STOP and VALIDATE**: open browser, confirm no emoji, bone palette, forest brand
5. Ship if deadline requires — US2/US3 are enhancements

### Incremental Delivery

1. Phase 1 + 2 → shell is design-system compliant
2. Phase 3 (US1) → full visual redesign live ✅
3. Phase 4 (US2) → 3-day workout context ✅
4. Phase 5 (US3) → refined chip styling ✅
5. Phase 6 → verified and constitution updated ✅

---

## Notes

- [P] tasks = different files, safe to execute in parallel
- No tests requested in spec — no test tasks generated
- T027 (constitution amendment) is independent of implementation correctness; can be done any time after Phase 3
- Visual verification (T028) requires `npm run dev` and a browser — not replaceable by `tsc --noEmit` alone
