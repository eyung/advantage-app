# Tasks: Tennis Hub Redesign — Dashboard & Gear

**Input**: Design documents from `specs/008-tennis-hub-redesign/`  
**Branch**: `008-tennis-hub-redesign`  
**Total tasks**: 28 | **Completed**: 28 | **Remaining**: 0

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 = Shell & Navigation, US2 = Dashboard, US3 = Gear Locker

---

## Phase 1: Foundational

**Purpose**: Types, persistence, and derivation logic every story builds on. No UI. Blocks all user stories.

- [X] T001 [P] Add `Racket` and `RestringRecord` interfaces (per data-model.md field tables) to `src/types.ts`
- [X] T002 Add `gear: 'advantage_gear'` to `KEYS` and bump `SCHEMA_VERSION` from 3 to 4 in `src/utils/storage.ts`
- [X] T003 Add `migrations[4]` seeding `advantage_gear` with `{ rackets: [], restrings: [] }` when absent (purely additive, no existing keys touched) in `src/utils/migration.ts`
- [X] T004 Create persisted Zustand `gearStore` — state (`rackets`, `restrings`), actions (`addRacket`, `updateRacket`, `setRacketStatus`, `deleteRacket` cascading its restrings, `addRestring`, `deleteRestring`), and pure selectors (`currentSetupFor`, `stringAgeDays`, `historyFor` sorted by date desc) with validation rules from data-model.md in `src/store/gearStore.ts`
- [X] T005 [P] Create `currentStreak(completions, trainingDays, today)` — consecutive scheduled training days completed; rest days never break the streak — in `src/utils/streak.ts`
- [X] T006 [P] Unit tests for gearStore: current-setup selection (latest date wins, backfill does not become current), cascade delete, validation bounds, in `src/store/gearStore.test.ts`
- [X] T007 [P] Unit tests for streak: rest-day gaps preserved, missed scheduled day breaks, empty history, in `src/utils/streak.test.ts`

**Checkpoint**: `npm run test` green, `npx tsc --noEmit` clean. No visible app change yet.

---

## Phase 2: User Story 1 — Redesigned Navigation & Modern Shell (Priority: P1)

**Goal**: Four-area responsive shell (Dashboard/Training/Gear/Settings); bottom tabs on mobile, sidebar on desktop; all existing features re-housed and functional; only forest/bone palette.

**Independent Test**: Traverse all four areas at 375px and 1280px; complete one full existing training flow (switch day, toggle equipment, complete exercise, change settings) inside the new design; existing localStorage data loads intact.

### Implementation

- [X] T008 [P] [US1] Create `BottomTabBar` — 4 items with icons + labels, active state, fixed bottom, 64px + `env(safe-area-inset-bottom)`, hidden ≥ 768px — in `src/components/shell/BottomTabBar.tsx`
- [X] T009 [P] [US1] Create `SideNav` — 240px fixed left sidebar with logo, 4 nav items (icon + label), active state, visible only ≥ 768px — in `src/components/shell/SideNav.tsx`
- [X] T010 [US1] Create `AppShell` — owns `activeArea` state (`'dashboard' | 'training' | 'gear' | 'settings'`, default `'dashboard'`), renders BottomTabBar/SideNav + active view in a content region capped at 1100px on desktop; temporary placeholder panels for Dashboard and Gear areas (replaced in US2/US3) — in `src/components/shell/AppShell.tsx`
- [X] T011 [US1] Create `TrainingView` re-housing existing `DayTabBar`, `DayRoutineView`, `SessionEquipmentBar`, and `ProgressView` (preserving the `isToday` vs `focused` behaviour and all existing flows) in `src/components/training/TrainingView.tsx`
- [X] T012 [US1] Adapt `SettingsView` to render as a tab destination: remove full-screen wrapper, back button, and `onClose` prop (save feedback stays inline); keep `ExerciseManagement` sub-navigation working in `src/components/setup/SettingsView.tsx`
- [X] T013 [US1] Update `App.tsx` to render `AppShell` when configured (SetupWizard gate unchanged) and delete the dissolved `src/components/main/MainView.tsx`
- [X] T014 [US1] Responsive layout CSS — remove fixed-430px shell remnants, keep `--bg-recessed` body backdrop, add any shared shell/layout styles needed at 375/768/1280px breakpoints — in `src/index.css`

**Checkpoint**: App fully navigable at mobile and desktop widths; every pre-redesign feature reachable in ≤ 2 taps; data intact (schema v4 migration ran).

---

## Phase 3: User Story 2 — Dashboard Homepage with Graphs (Priority: P1)

**Goal**: Dashboard as default landing view: 8-week consistency chart, today's progress + CTA, streak, string freshness — multi-column grid on desktop, stacked on mobile, designed empty states everywhere.

**Independent Test**: With seeded history, three+ visualisations render with correct numbers and the Today CTA lands in Training; with cleared storage, every panel shows an empty state with a call-to-action.

### Implementation

- [X] T015 [P] [US2] Create shared `EmptyPanel` (icon, message, call-to-action button) in `src/components/dashboard/EmptyPanel.tsx`
- [X] T016 [P] [US2] Create `TodayPanel` — today's plan progress (completed/total exercises from completion + plan stores) with one-tap CTA navigating to Training; rest-day and empty states — in `src/components/dashboard/TodayPanel.tsx`
- [X] T017 [P] [US2] Create `ConsistencyPanel` — last-8-weeks completed-vs-planned visualisation reusing/adapting `src/components/progress/ConsistencyChart.tsx` (recharts); empty state for no history — in `src/components/dashboard/ConsistencyPanel.tsx`
- [X] T018 [P] [US2] Create `StreakPanel` — current streak via `currentStreak()` with celebratory presentation and zero-state copy — in `src/components/dashboard/StreakPanel.tsx`
- [X] T019 [P] [US2] Create `GearPanel` — active racket(s) with days-since-restring from gearStore selectors; "Add your first racket" empty state CTA navigating to Gear — in `src/components/dashboard/GearPanel.tsx`
- [X] T020 [US2] Create `DashboardView` — greeting header + responsive panel grid (1-col mobile, 2-col ≥ 1024px with consistency chart spanning full width); replace the placeholder in `AppShell` — in `src/components/dashboard/DashboardView.tsx`

**Checkpoint**: Opening the app lands on a working dashboard; SC-001 (2-tap reach), SC-004 (3+ visualisations), SC-006 (no blank panels) verifiable.

---

## Phase 4: User Story 3 — Gear Locker: Rackets, Strings & Restring History (Priority: P2)

**Goal**: Full racket CRUD with restring history — add/edit/retire/delete rackets, record restrings (hybrid support), view history newest-first, string freshness surfaced.

**Independent Test**: Add two rackets, record three restrings (one hybrid, one backfilled), retire one racket, delete one — verify list, current setup, history ordering, warnings, and dashboard GearPanel reflect every change.

### Implementation

- [X] T021 [P] [US3] Create `RacketForm` — add/edit with brand + model required, optional weight/head size/grip/notes, validation messages — in `src/components/gear/RacketForm.tsx`
- [X] T022 [P] [US3] Create `RestringForm` — date (no future), mains string + tension (30–80 lbs) required, optional cross string/tension (hybrid), stringer, cost, notes — in `src/components/gear/RestringForm.tsx`
- [X] T023 [US3] Create `RacketDetail` — specs, current string setup with age, reverse-chronological restring history, retire/reactivate toggle, delete with history-loss warning — in `src/components/gear/RacketDetail.tsx`
- [X] T024 [US3] Create `GearView` — active racket cards (current strings + age at a glance), collapsed retired section, add-racket entry point, navigation into `RacketDetail`; replace the placeholder in `AppShell` — in `src/components/gear/GearView.tsx`

**Checkpoint**: SC-002 (racket + restring < 60s) and SC-003 (last-strung answer < 10s) verifiable; GearPanel on dashboard shows live data.

---

## Phase 5: Polish & Verification

**Purpose**: Design-language pass on the remaining pre-shell screen, then full manual verification per constitution.

- [X] T025 [P] Restyle `SetupWizard` to the new design language (layout/typography only — flow and validation unchanged) in `src/components/setup/SetupWizard.tsx`
- [X] T026 [P] Sweep restyled-but-reused components (`DayTabBar`, `DayRoutineView`, `SessionEquipmentBar`, `ProgressView`, `ExerciseManagement`) for visual consistency with the new shell (spacing, radii, card shadows — palette tokens only) in `src/components/`
- [X] T027 Run all quickstart.md scenarios A–E in the browser at 375px, 768px, and 1280px, including fresh-profile empty states and offline check
- [X] T028 Complete the quickstart.md regression checklist (SC-005): all existing flows + `npm run test` green + `npx tsc --noEmit` clean

---

## Dependencies & Execution Order

```
Phase 1 (Foundational) ──► Phase 2 (US1 shell) ──► Phase 3 (US2 dashboard) ──► Phase 5 (Polish)
                                              └──► Phase 4 (US3 gear)      ──┘
```

- **T001 → T004** (types before store); **T002 → T003** (key before migration)
- **US1 (T008–T014)** requires Phase 1 complete (migration must run before any view loads gear state)
- **US2 (T015–T020)** requires US1's `AppShell` (T010) for navigation wiring; panels T015–T019 are mutually parallel; T020 composes them
- **US3 (T021–T024)** requires US1's `AppShell`; independent of US2 — Phases 3 and 4 can be built in either order or in parallel
- **Polish (T025–T028)** last; T027/T028 require everything prior

## Parallel Opportunities

```
Phase 1:  T001 ─┐                       Phase 2:  T008 ─┐
          T005 ─┼─ (then T004, T006)              T009 ─┼─► T010 ─► T011…T014
          T007 ─┘                                       ─┘

Phase 3:  T015 T016 T017 T018 T019 ─► T020
Phase 4:  T021 T022 ─► T023 ─► T024        (Phase 3 ∥ Phase 4 after T010)
```

## Implementation Strategy

1. **MVP = Phase 1 + Phase 2 (US1)**: the app works end-to-end in the new shell with placeholder Dashboard/Gear panels — every existing feature intact. This is the riskiest slice (re-housing), so it lands first.
2. **Phase 3 (US2)** turns the landing view into the real dashboard — biggest visible payoff.
3. **Phase 4 (US3)** adds the Gear Locker and lights up the dashboard's gear panel with real data.
4. **Phase 5** polish + full manual verification, then commit and push.
