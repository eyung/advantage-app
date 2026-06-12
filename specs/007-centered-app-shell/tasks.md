# Tasks: Centered App Shell Layout

**Input**: Design documents from `specs/007-centered-app-shell/`  
**Branch**: `007-centered-app-shell`  
**Total tasks**: 5 | **Completed**: 5 | **Remaining**: 0

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[X]**: Already complete

---

## Phase 1: Foundational

**Purpose**: Page-level backdrop colour — prerequisite for all component changes.

- [X] T001 Set `body` background-color to `var(--bg-recessed)` in `src/index.css`

**Checkpoint**: Body background is now `#efece2` (recessed tone). Shell backgrounds will visually lift off the page.

---

## Phase 2: User Story 1 — App Feels Card-Like on Desktop (Priority: P1)

**Goal**: Constrain all top-level views to a centred 430px shell; full-width on mobile.

**Independent Test**: Open app in desktop browser at ≥ 900px. Verify header, cards, and footer are centred in a ~430px column with the recessed backdrop visible on both sides. Resize to 375px — full width, no gaps.

### Implementation

- [X] T002 [US1] Wrap `MainView` root in centred 430px shell with `--bg-recessed` outer backdrop and box-shadow in `src/components/main/MainView.tsx`
- [X] T003 [P] [US1] Wrap `SettingsView` root in the same centred 430px shell pattern (matching MainView structure) in `src/components/setup/SettingsView.tsx`
- [X] T004 [P] [US1] Change `max-w-md` → `max-w-[430px]` on the inner content div of `SetupWizard` in `src/components/setup/SetupWizard.tsx` (outer `fixed inset-0` wrapper stays unchanged)

**Checkpoint**: All three top-level views (MainView, SettingsView, SetupWizard) align to 430px on desktop. Mobile layout unchanged.

---

## Phase 3: Polish & Verification

**Purpose**: Manual browser validation per constitution requirement.

- [X] T005 Visually verify in browser: desktop ≥ 900px (shell centred, backdrop visible, header/tabs/footer aligned), mobile 375px (full-width, no gaps), Settings and SetupWizard consistent

---

## Dependencies & Execution Order

- **T001** → must complete before any component work (backdrop colour change is foundational)
- **T002** → complete (was implemented alongside T001)
- **T003, T004** → can run in parallel (different files, both depend only on T001 ✓)
- **T005** → depends on T003 + T004 complete

---

## Parallel Opportunities

```
T003 [SettingsView.tsx]  ─┐
                           ├─► T005 [browser verify]
T004 [SetupWizard.tsx]  ──┘
```

---

## Implementation Strategy

**Remaining work** (T003 + T004 + T005) is < 30 minutes total.

1. Apply shell wrapper to `SettingsView.tsx` — copy the two-div pattern from `MainView.tsx`
2. Tighten `SetupWizard.tsx` inner content width from `max-w-md` to `max-w-[430px]`
3. Run dev server, verify visually in browser
4. Commit and push
