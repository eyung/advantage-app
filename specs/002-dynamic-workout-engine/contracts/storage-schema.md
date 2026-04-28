# Contract: localStorage Storage Schema

**Feature**: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines  
**Version**: 1  
**Date**: 2026-04-27

---

## Overview

All application data is stored in the browser's `localStorage`. There is no backend. This contract defines the exact keys, value shapes, and versioning rules.

---

## Keys

### `rally_schema_version`

| Property | Value |
|----------|-------|
| Type | `number` |
| Current version | `1` |
| Purpose | Schema migration sentinel. Read on app boot; if absent or less than current, run migrations before accessing other keys. |

---

### `rally_equipment`

| Property | Value |
|----------|-------|
| Type | `EquipmentProfile \| null` |
| Absent means | First-time user; show SetupWizard |

**Schema (v1)**:

```json
{
  "dumbbellWeights": [10, 15, 20],
  "trainingDays": ["Mon", "Wed", "Fri", "Sat"],
  "configVersion": 1,
  "savedAt": "2026-04-27T14:30:00.000Z"
}
```

**Invariants**:
- `dumbbellWeights` is always sorted ascending
- `dumbbellWeights` has at least 1 element
- `trainingDays` has 3–6 unique entries from `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]`
- `configVersion` is a positive integer; increments by 1 on every save

---

### `rally_completions`

| Property | Value |
|----------|-------|
| Type | `ExerciseCompletion[]` |
| Absent / empty means | No completion history |
| Mutation policy | Append-only on "Complete" tap; record removed on toggle-off; **never bulk-deleted** |

**Schema (v1) — single record**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "exerciseId": "lateral-band-walk",
  "date": "2026-04-27",
  "weekISO": "2026-W17",
  "weightKg": 15,
  "setsCompleted": 3,
  "repsPerSet": [12, 12, 10],
  "completedAt": "2026-04-27T09:15:42.000Z"
}
```

**Invariants**:
- `id` is unique across all records (UUID v4)
- `repsPerSet.length === setsCompleted`
- `weightKg === 0` for bodyweight exercises
- `weekISO` is always the ISO week that contains `date`
- At most one record per `(exerciseId, date)` pair; duplicate check enforced by `completionStore`

---

## Migration Rules

On boot, read `rally_schema_version`:

| Stored version | Current version | Action |
|----------------|-----------------|--------|
| Absent | 1 | Write `rally_schema_version = 1`; no data to migrate |
| 1 | 1 | No action |
| < current | current | Run each migration step sequentially (none defined yet beyond v1 baseline) |

Migrations must be idempotent and must not delete `rally_completions` records.

---

## Compatibility Guarantee

- **Additive changes** (new optional fields on existing keys): allowed without version bump.
- **Breaking changes** (removed/renamed fields, type changes): require `rally_schema_version` increment and a migration function.
- The `rally_completions` key is **never cleared** by any migration.
