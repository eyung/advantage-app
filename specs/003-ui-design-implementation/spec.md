# Feature Specification: Advantage Design System Implementation

**Feature Branch**: `003-ui-design-implementation`
**Created**: 2026-04-28
**Status**: Implemented
**Input**: Apply the Advantage Design System handoff bundle to the React codebase

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Visual redesign matches design system (Priority: P1)

A returning user opens the app and sees the new Deep Forest Green / Cool Slate Gray / Off-White palette instead of the old clay-orange and bright-green scheme. All emoji are replaced with geometric SVG icons. The app feels "tennis club" rather than "fitness app".

**Why this priority**: The design system is the entire scope of this feature — every other story depends on the colour and type tokens being applied first.

**Independent Test**: Open Setup Wizard; confirm bone background, Fraunces heading, forest-green CTA button, no emoji visible anywhere.

**Acceptance Scenarios**:

1. **Given** a fresh install, **When** the user opens the app, **Then** the background is `#f7f5ee` (bone), the logo is an SVG mark, and no emoji are visible.
2. **Given** the header is rendered, **When** inspected, **Then** it shows `logo-mark.svg` and the Advantage wordmark in Fraunces, not a 🎾 emoji.

---

### User Story 2 — Three-day workout view (Priority: P2)

A user on the Today tab sees three day cards — yesterday, today, and tomorrow — stacked vertically. The focused card (today) is full opacity; adjacent cards are dimmed to 50%. Tapping a different day on the tab bar shifts the trio.

**Why this priority**: Core UX departure from the single-day view. Provides session context and removes the need to navigate back/forward one day at a time.

**Independent Test**: Select any day other than Mon or Sun; confirm three cards render with the middle one full opacity and the outer two at 50%.

**Acceptance Scenarios**:

1. **Given** Wed is selected, **When** the Today tab is active, **Then** Tue, Wed, Thu cards are shown; Wed is full opacity, Tue/Thu are 50% opacity.
2. **Given** Mon is selected, **When** the Today tab is active, **Then** only Mon and Tue cards appear (no wrapping to the previous week).

---

### User Story 3 — Category chips use outlined pills (Priority: P3)

Exercise cards display category labels as transparent-background capsules with a 1px category-coloured stroke, not filled chips.

**Why this priority**: Visual refinement that aligns with the design system's "outline capsules" rule for all chip-type elements.

**Independent Test**: Render any exercise card; inspect the category badge — background must be transparent, border must be 1px solid in the category colour.

**Acceptance Scenarios**:

1. **Given** a Lateral Agility exercise, **When** its card is rendered, **Then** the chip has `border: 1px solid #3e7d56` and `background: transparent`.
2. **Given** a completed exercise card, **When** inspected, **Then** the card background is `--color-forest-100`, a 3px inset left border in `--brand` is visible, and the exercise name has strikethrough styling.

---

### Edge Cases

- Mon selected: only Mon + Tue visible (no prev card).
- Sun selected: only Sat + Sun visible (no next card).
- Rest day card shows moon SVG icon and recovery copy, no exercise list.
- Empty progress view shows chart icon (not emoji) with placeholder copy.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: App MUST load Google Fonts for Inter, Fraunces, and JetBrains Mono.
- **FR-002**: All emoji in the codebase (🎾 ⚙️ 📅 📊 🏆 💪 😴) MUST be replaced with the corresponding SVG icons from `public/icons/`.
- **FR-003**: The primary background MUST be `#f7f5ee` (bone) across all screens.
- **FR-004**: All primary CTA buttons MUST use `--brand` (`#245236`) fill with white text.
- **FR-005**: Category chips MUST be outlined (1px category-colour border, transparent background).
- **FR-006**: Completed exercise cards MUST show `--color-forest-100` background with a 3px inset left `--brand` border.
- **FR-007**: Sets/reps/weight values on exercise cards MUST use JetBrains Mono.
- **FR-008**: Weight tags MUST use `--brand-soft` background with `--color-forest-800` text in JetBrains Mono.
- **FR-009**: The Today screen MUST show three consecutive day cards (prev / selected / next).
- **FR-010**: Non-focused day cards MUST render at 50% opacity.
- **FR-011**: The header MUST show `logo-mark.svg` plus the wordmark in Fraunces, not an emoji.
- **FR-012**: Bottom nav MUST use `calendar.svg` and `chart.svg`; active item colour is `--brand`.
- **FR-013**: The Consistency Chart MUST use `--color-forest-200` for planned bars and `--brand` for completed bars.
- **FR-014**: Personal best weight badges MUST use `--brand-soft` background, `--color-forest-800` text, JetBrains Mono.

### Key Entities

- **Design Tokens**: CSS custom properties defined in `src/index.css` that map to the Advantage Design System colour and typography scales.
- **SVG Icon Set**: 15 stroke icons in `public/icons/`, rendered via the `Icon` component at `src/components/ui/Icon.tsx`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero emoji characters remain in any rendered UI element.
- **SC-002**: TypeScript compilation reports zero errors (`tsc --noEmit` exits 0).
- **SC-003**: Production build completes successfully (`npm run build` exits 0).
- **SC-004**: All five category types render with correctly coloured outlined chips (visually verified in browser).
- **SC-005**: The three-day window renders correctly for all seven day selections (Mon through Sun).

---

## Assumptions

- Tailwind CSS continues to be used; design tokens are expressed as CSS custom properties and referenced in inline styles for precise design-system fidelity.
- Google Fonts CDN is available at runtime; no offline font bundling is required for v1.
- The Icon component renders SVG files as `<img>` tags from `/public/icons/`; no inline SVG sprite system is needed at this stage.
- The `CompletionBadge` component is retained but its styling is updated in line with `ExerciseCard`'s done state — both show the same green badge.
