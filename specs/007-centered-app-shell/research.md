# Research: Centered App Shell Layout

**Feature**: 007-centered-app-shell  
**Date**: 2026-05-01

## 1. Shell Max-Width

**Decision**: 430px  
**Rationale**: iPhone 14 Plus / 15 Plus logical width. The modern standard for mobile-first PWAs on desktop. Gives a "phone app on a desk" feel that is immediately legible as an intentional design choice rather than an accident.  
**Alternatives considered**:
- 390px — iPhone 14 Pro width; too tight, compresses the 3-card stacked layout
- 448px (`max-w-md`) — Tailwind default; slightly loose, cards lose "card-like" density
- 480px — starts to feel more like a small tablet; at odds with the bottom-nav mobile chrome

## 2. Backdrop Colour

**Decision**: `--bg-recessed` (`#efece2`)  
**Rationale**: Already in the Advantage Design System. Warm off-white creates gentle separation without a harsh contrast. Avoids introducing any new colour token.  
**Alternatives considered**:
- Pure white `#ffffff` — too harsh against the bone canvas of the shell
- A dark forest green — would create strong contrast but fights the app's light aesthetic
- Transparent / same as shell — no separation; shell doesn't read as distinct surface

## 3. Shadow on Shell

**Decision**: `0 0 0 0.5px rgba(14,31,23,0.06), 0 20px 60px -16px rgba(14,31,23,0.14)`  
**Rationale**: Two-layer shadow — a near-invisible hairline ring defines the shell edge at 1:1 scale; a large soft drop-shadow adds lift on wider viewports. Both use the forest-dark base colour (`#0e1f17`) at low opacity, consistent with existing card shadows in the design system.  
**Alternatives considered**:
- No shadow — shell blends into backdrop on wide screens
- Border only — too geometric/harsh for the organic aesthetic
- Heavier shadow — distracts from the content

## 4. SetupWizard Treatment

**Decision**: Align inner content to `max-w-[430px]` only; keep `fixed inset-0` outer wrapper  
**Rationale**: SetupWizard is a one-time onboarding screen. Its full-bleed backdrop is intentional (creates immersive focus for first-run setup). The inner content already uses `max-w-md` (448px); tightening to 430px maintains consistency with the main app shell width.
