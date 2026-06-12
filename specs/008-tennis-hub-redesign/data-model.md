# Data Model: Tennis Hub Redesign — Dashboard & Gear

**Feature**: 008-tennis-hub-redesign  
**Date**: 2026-06-12

## New Entities

### Racket

A racket the user owns. Lives in `gearStore`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` (uuid) | yes | |
| `brand` | `string` | yes | e.g., "Yonex" |
| `model` | `string` | yes | e.g., "EZONE 98" |
| `weightGrams` | `number` | no | unstrung weight |
| `headSizeSqIn` | `number` | no | e.g., 98 |
| `gripSize` | `string` | no | e.g., "4 3/8" — free text, grip conventions vary |
| `status` | `'active' \| 'retired'` | yes | defaults to `'active'` |
| `notes` | `string` | no | free text |
| `createdAt` | `string` (ISO date) | yes | set on creation |

**State transitions**: `active` ⇄ `retired` (reversible). **Delete** removes the racket *and* its restring records after an explicit warning (edge case: history must never be lost *silently*).

### RestringRecord

One stringing event. Stored flat, referencing its racket.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` (uuid) | yes | |
| `racketId` | `string` | yes | FK → `Racket.id` |
| `date` | `string` (ISO date, `YYYY-MM-DD`) | yes | may be in the past (backfill) |
| `mainString` | `string` | yes | free text, e.g., "Luxilon ALU Power 1.25" |
| `mainTensionLbs` | `number` | yes | |
| `crossString` | `string` | no | only for hybrid setups; defaults to mains |
| `crossTensionLbs` | `number` | no | defaults to mains tension |
| `stringer` | `string` | no | shop or person |
| `costDollars` | `number` | no | |
| `notes` | `string` | no | |

**Derived values** (computed, never stored):

- **Current setup** per racket = its restring record with the greatest `date` (ties broken by insertion order)
- **String age** = days between current setup's `date` and today
- Ordering: history lists sort by `date` descending (FR-012; backfill edge case)

### Validation Rules

- `brand`, `model` non-empty trimmed strings
- `mainTensionLbs` / `crossTensionLbs` in range 30–80 (soft sanity bounds; values outside range rejected with a friendly message)
- `date` must parse as a valid date; no future dates
- Restring creation requires an existing `racketId`

## Existing Entities (read-only for this feature)

- **ExerciseCompletion** (`completionStore`) — feeds consistency chart, streak, today's progress. Not modified.
- **EquipmentProfile** (`equipmentStore`) — provides `trainingDays` for streak/planned-sessions math. Not modified.
- **WeeklyPlan** (`planStore`) — feeds TodayPanel. Not modified.

## Store Shape

`src/store/gearStore.ts` (Zustand, persisted to localStorage like existing stores):

```ts
interface GearState {
  rackets: Racket[];
  restrings: RestringRecord[];
  addRacket(input: NewRacket): void;
  updateRacket(id: string, patch: Partial<Racket>): void;
  setRacketStatus(id: string, status: 'active' | 'retired'): void;
  deleteRacket(id: string): void;          // also removes its restrings
  addRestring(input: NewRestring): void;
  deleteRestring(id: string): void;
}
```

Selectors (pure functions, unit-tested): `currentSetupFor(racketId)`, `stringAgeDays(racketId, today)`, `historyFor(racketId)`.

## Storage & Migration

- New key: `KEYS.gear = 'advantage_gear'` in `src/utils/storage.ts`
- `SCHEMA_VERSION`: `3` → `4`
- `migrations[4]` in `src/utils/migration.ts`: if `advantage_gear` absent, seed with empty store payload (`rackets: []`, `restrings: []`). No existing key is read or rewritten — purely additive.

## New Utility

`src/utils/streak.ts`:

```ts
// Consecutive scheduled training days completed, ending today (or the most
// recent scheduled day). Rest days never break the streak.
function currentStreak(completions: ExerciseCompletion[], trainingDays: DayOfWeek[], today: Date): number
```
