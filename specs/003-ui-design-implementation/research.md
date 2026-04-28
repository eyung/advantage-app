# Research: Advantage Design System Implementation

## Decision 1: Styling approach — CSS custom properties + Tailwind vs. alternatives

**Decision**: CSS custom properties for design tokens, with Tailwind used for layout utilities; component-level styling via inline `style` props where design-system precision is required.

**Rationale**: The design system specifies exact pixel values, custom easing curves, and non-standard box shadows that don't map neatly to Tailwind's default scale. CSS custom properties (defined in `index.css`) allow the design token values to be referenced both in Tailwind's extended theme config and in inline styles, giving exact fidelity without fighting the utility-class model. Pure Tailwind extension alone would have required dozens of arbitrary values (`shadow-[0_1px_0_rgba(20,48,31,0.04)...]`) which are verbose and hard to maintain.

**Alternatives considered**:
- *Pure Tailwind arbitrary values*: Verbose, no central token source, hard to update.
- *CSS Modules*: Would require migrating the entire component tree away from Tailwind; too disruptive.
- *Styled-components / Emotion*: Runtime CSS-in-JS; adds bundle weight and complicates the static build.

---

## Decision 2: Icon system — SVG `<img>` tags vs. inline SVG vs. SVG sprite

**Decision**: `Icon` component renders `<img src="/icons/{name}.svg">` from the `public/` directory.

**Rationale**: The design system ships standalone SVG files. Loading them as static assets via `<img>` requires zero bundler configuration, the files are cached by the browser independently, and the approach is trivially portable. The icons are decorative (filled with `currentColor` simulation via CSS filter where needed), so accessibility is served by `alt=""` on the img element.

**Alternatives considered**:
- *Inline SVG (import as component)*: Gives true `currentColor` support and smaller HTTP requests at cost of bundle size and build complexity (needs `@svgr/rollup` or similar). Premature for 15 icons.
- *SVG sprite sheet*: Good for large icon sets; overkill for 15 icons and adds a build step.
- *Lucide CDN (unpkg)*: The design README flags this as an option; avoided because it adds a CDN dependency for every icon render and is harder to cache-control.

---

## Decision 3: Three-day window — index-based slice vs. CSS scroll snap vs. swipe carousel

**Decision**: Computed slice from `ALL_DAYS` array based on `selectedIdx`; rendered as three stacked `DayRoutineView` cards with opacity 1 / 0.5 / 0.5.

**Rationale**: The design calls for a vertically stacked layout where the user scrolls to see all three cards — not a horizontal swipe carousel. Computing `[idx-1, idx, idx+1]` and clamping to array bounds is four lines of logic with zero new dependencies. The 50% opacity on non-focused cards is a CSS property change, not an animation.

**Alternatives considered**:
- *CSS scroll snap horizontal carousel*: Implies horizontal swipe gesture; the design spec shows vertical stacking, not horizontal pagination.
- *Framer Motion animated transitions*: The design spec explicitly prohibits bounces and spring physics. Standard CSS `transition: opacity 200ms` satisfies the stated animation budget.

---

## Decision 4: Font loading — Google Fonts CDN vs. self-hosted

**Decision**: Google Fonts CDN for Inter, Fraunces, and JetBrains Mono. Fallback stacks defined in CSS custom properties and Tailwind config.

**Rationale**: Constitution Principle II ("Offline-First") requires the app to work without a network connection *after* initial load. Browser font caching means CDN fonts will be available on repeat offline visits once cached. The `font-family` fallback stack (`system-ui`, `Georgia`, `monospace`) ensures readable (if unstyled) output on true first-offline visits. Self-hosting would require vendoring ~300KB of font files, increasing the initial bundle and complicating the static host setup.

**Alternatives considered**:
- *Self-hosted fonts*: Correct offline solution but adds ~300KB of assets and a manual update process for future font versions. Deferred to a future amendment if offline-first becomes stricter.
- *System fonts only*: Loses Fraunces character that differentiates the "tennis club" brand identity.

---

## Decision 5: Constitution Styling Clause — amendment required

**Decision**: The constitution's Technology Constraints section still references the old palette (`#4CAF50`, `#E65100`, `#FAFAFA`). This must be amended.

**Proposed amendment** (PATCH — wording update, no principle change):

> **Styling**: Advantage Design System — Deep Forest Green (`#245236`), Cool Slate Gray, Off-White Bone (`#f7f5ee`) MUST be applied consistently across all screens. All emoji are replaced by SVG stroke icons from `public/icons/`. Full design token reference: `src/index.css`.

**Governance**: Version bump from 1.0.0 → 1.0.1 (PATCH: wording/clarification).
