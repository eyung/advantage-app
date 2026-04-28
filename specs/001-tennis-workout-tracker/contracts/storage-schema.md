# Storage Schema Contract: Rally

**Phase 1 Output** | **Date**: 2026-04-27 | **Data Model**: [data-model.md](../data-model.md)

This document defines the `localStorage` key/value contract for the Rally app.
All keys use the `rally_` prefix. Any change to these schemas MUST increment
`rally_schema_version` and provide a migration function in `src/utils/migration.ts`.

---

## Schema Version

| Key | Type | Description |
|-----|------|-------------|
| `rally_schema_version` | `string` (integer as string) | Current schema version. Read on startup to trigger migration if needed. Initial value: `"1"` |

---

## Key: `rally_profile`

Stores the single `TrainingProfile` object.

```json
{
  "schemaVersion": 1,
  "weekSchedule": ["lifting", "tennis", "lifting", "tennis", "cardio", "tennis", "rest"],
  "sessionDurations": {
    "tennis": 90,
    "lifting": 60,
    "cardio": 45
  },
  "exerciseWeights": {
    "goblet-squat": 20,
    "romanian-deadlift": 40,
    "lateral-band-walk": 0,
    "face-pull": 10
  },
  "createdAt": "2026-04-27T00:00:00.000Z",
  "updatedAt": "2026-04-27T00:00:00.000Z"
}
```

**Read**: On every app load; hydrated into `profileStore`.  
**Write**: On every Settings save.  
**Missing key behaviour**: App writes the default profile on first open.

---

## Key: `rally_sessions`

Stores an array of all `WorkoutSession` objects (lifting + cardio), most recent first.

```json
[
  {
    "id": "a1b2c3d4-...",
    "date": "2026-04-27",
    "dayType": "lifting",
    "plannedExercises": [
      {
        "exerciseId": "goblet-squat",
        "prescribedSets": 3,
        "prescribedReps": "10–12",
        "prescribedWeight": 20
      }
    ],
    "logs": [
      {
        "exerciseId": "goblet-squat",
        "completed": true,
        "sets": [
          { "setNumber": 1, "reps": 12, "weightKg": 20 },
          { "setNumber": 2, "reps": 11, "weightKg": 20 },
          { "setNumber": 3, "reps": 10, "weightKg": 20 }
        ]
      }
    ],
    "durationMinutes": 55,
    "completedAt": "2026-04-27T09:00:00.000Z",
    "notes": null
  }
]
```

**Read**: On Progress screen load; on Home screen for streak calculation.  
**Write**: On session completion.  
**Size guidance**: Each session is ~2–5kB. 52 weeks × ~3 sessions/week × 4kB ≈ 624kB.
Well within the 5MB localStorage limit.

---

## Key: `rally_tennis_sessions`

Stores an array of all `TennisSession` objects, most recent first.

```json
[
  {
    "id": "e5f6g7h8-...",
    "date": "2026-04-26",
    "durationMinutes": 90,
    "notes": "Worked on backhand cross-court",
    "completedAt": "2026-04-26T11:30:00.000Z"
  }
]
```

**Read**: On Progress screen load; on Home screen for streak calculation.  
**Write**: On tennis session log save.

---

## Migration Contract

When `rally_schema_version` in storage does not match the app's current schema version,
`src/utils/migration.ts` MUST be called before any data is read into state.

**Migration function signature**:

```typescript
function migrate(
  storedVersion: number,
  currentVersion: number,
  rawData: Record<string, string>
): Record<string, string>
```

**Rules**:
- Migrations run in sequence (v1→v2, v2→v3, etc.)
- Each migration MUST be a pure function
- On error: log to console, preserve original data, do NOT delete it
- After migration: write new `rally_schema_version` to storage

---

## Invariants

- All date strings use ISO 8601 format (`YYYY-MM-DD` for dates, full timestamp for `completedAt`)
- All weight values are in kilograms (kg)
- All duration values are in minutes
- Session IDs are UUID v4 strings
- `rally_sessions` and `rally_tennis_sessions` arrays are always sorted most-recent-first
