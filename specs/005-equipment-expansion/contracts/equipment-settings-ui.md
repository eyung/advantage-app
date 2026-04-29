# UI Contract: Equipment Settings

## ResistanceBandInput

**File**: `src/components/setup/ResistanceBandInput.tsx`

```typescript
interface Props {
  selected: ResistanceBandLevel[];
  onChange: (levels: ResistanceBandLevel[]) => void;
}
```

**Behavior**:
- Renders 4 toggle buttons in order: Light / Medium / Heavy / Extra-Heavy
- Each button shows the level label; active state uses `var(--brand)` background + white text
- Inactive: `var(--bg-surface)` background, `var(--border-hairline)` border, `var(--fg-secondary)` text
- Buttons are multi-select (any combination)
- Section label: "Resistance Bands" in `var(--font-display)` 13px semibold
- Helper text below: "Select the resistance levels you own"

## KettlebellInput

**File**: `src/components/setup/KettlebellInput.tsx`

```typescript
interface Props {
  weights: number[];
  onChange: (weights: number[]) => void;
}
```

**Behavior**: Identical UI pattern to `DumbbellInput` — pill-style weight chips, `+` button to add custom weight, `×` on each chip to remove. Section label: "Kettlebells (kg)". Same validation: integer kg values only, no duplicates.

## AestheticsDaySelector

**File**: `src/components/setup/AestheticsDaySelector.tsx`

```typescript
interface Props {
  trainingDays: DayOfWeek[];   // only training days can be aesthetics days
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}
```

**Behavior**:
- Renders only the days that are in `trainingDays` (non-training days are not shown)
- Toggle buttons: active = `var(--brand)` fill, inactive = ghost with `var(--border-hairline)`
- Multi-select
- Section label: "Aesthetics Days" in `var(--font-display)` 13px semibold
- Helper text: "On these days, one exercise is aesthetics-focused"
- If `trainingDays` is empty, show a muted note: "Configure training days first"

## SettingsView (updated sections)

New sections rendered between DumbbellInput card and DaySelector card:

1. **Resistance Bands card**: `<ResistanceBandInput>` in a `var(--bg-surface)` card (same style as existing cards)
2. **Kettlebells card**: `<KettlebellInput>` in a `var(--bg-surface)` card
3. After DaySelector card: **Aesthetics Days card** with `<AestheticsDaySelector>`

**Default Equipment section** (new card, after Aesthetics Days):
- Label: "Default Equipment for Sessions"
- Four checkbox-style toggle rows (one per EquipmentType); `bodyweight` row is disabled/checked (always available)
- `dumbbells` shown only if `dumbbellWeights.length > 0`
- `resistance-bands` shown only if `resistanceBandLevels.length > 0`
- `kettlebells` shown only if `kettlebellWeights.length > 0`

**Save behavior**: All new fields (bandLevels, kettlebellWeights, aestheticsDays, defaultEquipmentTypes) included in `saveConfig` call.
