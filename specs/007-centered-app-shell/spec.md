# Feature Specification: Centered App Shell Layout

**Feature Branch**: `007-centered-app-shell`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "Constrain main content width so activity cards look card-like; header, day tabs, and footer align to the same width; centered on desktop with backdrop contrast."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Feels Card-Like on Desktop (Priority: P1)

A user opening the app on a desktop or laptop browser sees the main content (activity cards, equipment buttons) constrained to a narrower column that is visually centred on screen, rather than stretching across the full browser width. The surrounding area provides a contrasting backdrop so the app shell clearly reads as a distinct surface.

**Why this priority**: The app was designed mobile-first. On wide screens, full-width cards lose their identity and the layout looks unpolished. Constraining to a centred shell restores the intentional app-like aesthetic.

**Independent Test**: Open the app in a desktop browser at ≥ 900px viewport width. Verify that the activity cards, equipment bar, header, and footer are visually centred and do not extend to the browser edges. Verify the page background outside the shell is a distinct (darker) tone.

**Acceptance Scenarios**:

1. **Given** a desktop browser at ≥ 900px wide, **When** the user opens the app, **Then** all primary UI surfaces (header, content, footer) are horizontally centred within a column noticeably narrower than the full window.
2. **Given** the same desktop view, **When** the user scrolls through activity cards, **Then** the cards remain within the centred column at all scroll positions.
3. **Given** a mobile browser at < 430px wide, **When** the user opens the app, **Then** the layout still fills the full screen width with no visual change from previous behaviour.
4. **Given** the centred shell, **When** the user navigates to the Progress tab, **Then** the progress content is also contained within the same centred column.

---

### Edge Cases

- What happens on viewport widths between 430px and 600px? (Expected: shell fills available width up to its maximum; no horizontal scroll or overflow)
- What if the device reports an unusual viewport width (e.g. split-screen tablet)? (Expected: same responsive behaviour — fill up to max, then centre)
- Does the Settings screen follow the same constraint? (Expected: yes, for visual consistency)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The primary app shell MUST have a maximum display width, beyond which it centres itself horizontally on the page.
- **FR-002**: The header bar (logo, day-tab strip, settings button) MUST be contained within the same maximum width as the content area.
- **FR-003**: The footer navigation MUST be contained within the same maximum width as the content area.
- **FR-004**: The page area outside the centred shell MUST display a visually distinct background tone to create contrast and depth.
- **FR-005**: On viewports narrower than the maximum width, the shell MUST fill the full available width (no change to the mobile experience).
- **FR-006**: The Settings screen MUST follow the same centred shell constraint for visual consistency.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At a 1280px-wide desktop viewport, the activity cards occupy no more than 430px of horizontal space and are horizontally centred.
- **SC-002**: At a 375px-wide mobile viewport, the layout fills 100% of the screen width with no horizontal gap or overflow.
- **SC-003**: The background colour outside the shell is visually distinguishable from the shell background in all supported colour schemes.
- **SC-004**: All interactive elements (buttons, tabs, cards) remain fully accessible and tappable within the centred shell on both desktop and mobile.

## Assumptions

- Maximum shell width is set to 430px — matching the iPhone 14 Plus logical width, the modern standard for mobile-first PWAs on desktop.
- The existing design system backdrop colour (`--bg-recessed`, `#efece2`) is used for the outer page background, introducing no new colours.
- The constraint applies to all top-level views: Today tab, Progress tab, and Settings.
- No changes are required to the exercise card layout itself; only the shell container width is affected.
- A subtle drop shadow is applied to the shell on desktop to reinforce depth and separation from the backdrop.
