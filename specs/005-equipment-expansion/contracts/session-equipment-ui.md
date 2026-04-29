# UI Contract: Session Equipment Bar

## SessionEquipmentBar

**File**: `src/components/main/SessionEquipmentBar.tsx`

```typescript
interface Props {
  profile: EquipmentProfile;
}
```

**Placement**: Rendered inside the main workout view, above the training day cards, visible only on training days. Hidden on rest days.

**Behavior**:
- Shows the currently available equipment types as a horizontal row of pills
- Each owned equipment type (dumbbells if weights configured, bands if levels configured, kettlebells if weights configured) renders as a toggle pill
- Active pill: `var(--brand)` background, white text
- Inactive pill: `var(--bg-surface)` background, `var(--border-hairline)` border, `var(--fg-tertiary)` text
- Bodyweight pill is always present and always active (grayed out toggle, not interactive)
- Changing any pill calls `sessionEquipmentStore.setAvailable(newTypes)` + triggers plan regeneration for today (via `useWeekPlan` dep change)
- Label above pills: "Today's equipment" in 11px uppercase `var(--fg-tertiary)`

**Edge case — no optional equipment configured**:
- If user has only dumbbells configured (the v1 state), the bar shows only "Dumbbells" (active) + "Bodyweight" (always active, locked)
- The bar is still rendered so users can discover it

**Save default button**:
- Small ghost button "Save as default" appears if `availableTypes !== profile.defaultEquipmentTypes`
- On tap: calls `useEquipment.saveDefaultEquipment(availableTypes)` which persists to EquipmentProfile and bumps configVersion

## AddExerciseForm (updated)

**File**: `src/components/settings/AddExerciseForm.tsx`

New prop (optional):
```typescript
interface Props {
  initialCategory?: TennisCategory;
  onSave: (name: string, category: TennisCategory, goalTags: ('aesthetics')[]) => void;
  onCancel: () => void;
}
```

**New UI element**: Checkbox row below category selector:
- Label: "Aesthetics exercise"
- Unchecked by default
- When checked, `goalTags: ['aesthetics']` passed to `onSave`
- Helper text: "This exercise appears on aesthetics-focused training days"
- Style: `var(--font-sans)` 13px, checkbox uses native input with `accent-color: var(--brand)`
