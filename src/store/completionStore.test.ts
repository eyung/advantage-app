import { describe, it, expect, beforeEach } from 'vitest';
import { useCompletionStore } from './completionStore';

// SC-009: getSessionSummary returns correct data after completions are added
describe('SC-009: getSessionSummary', () => {
  beforeEach(() => {
    useCompletionStore.setState({ completions: [] });
  });

  it('returns empty summary for a date with no completions', () => {
    const summary = useCompletionStore.getState().getSessionSummary('2026-04-30');
    expect(summary.date).toBe('2026-04-30');
    expect(summary.exerciseIds).toHaveLength(0);
    expect(summary.muscleGroups).toHaveLength(0);
  });

  it('returns exerciseIds for completions on the given date', () => {
    // Use known exercise IDs from the library
    useCompletionStore.setState({
      completions: [
        {
          id: 'c1',
          exerciseId: 'dumbbell-row',        // back
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 12,
          setsCompleted: 3,
          repsPerSet: [10, 10, 10],
          completedAt: new Date().toISOString(),
        },
        {
          id: 'c2',
          exerciseId: 'push-ups',            // chest
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 0,
          setsCompleted: 3,
          repsPerSet: [15, 15, 15],
          completedAt: new Date().toISOString(),
        },
        {
          id: 'c3',
          exerciseId: 'goblet-squat',        // legs
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 16,
          setsCompleted: 4,
          repsPerSet: [10, 10, 10, 10],
          completedAt: new Date().toISOString(),
        },
        {
          id: 'c4',
          exerciseId: 'lateral-shuffle',     // legs (different day — should be excluded)
          date: '2026-04-29',
          weekISO: '2026-W18',
          weightKg: 0,
          setsCompleted: 3,
          repsPerSet: [10, 10, 10],
          completedAt: new Date().toISOString(),
        },
      ],
    });

    const summary = useCompletionStore.getState().getSessionSummary('2026-04-30');
    expect(summary.date).toBe('2026-04-30');
    expect(summary.exerciseIds).toHaveLength(3);
    expect(summary.exerciseIds).toContain('dumbbell-row');
    expect(summary.exerciseIds).toContain('push-ups');
    expect(summary.exerciseIds).toContain('goblet-squat');
    expect(summary.exerciseIds).not.toContain('lateral-shuffle');
  });

  it('returns unique muscle groups for the session', () => {
    useCompletionStore.setState({
      completions: [
        {
          id: 'c1',
          exerciseId: 'dumbbell-row',   // back
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 12,
          setsCompleted: 3,
          repsPerSet: [10, 10, 10],
          completedAt: new Date().toISOString(),
        },
        {
          id: 'c2',
          exerciseId: 'dumbbell-bent-over-row', // back (same group)
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 12,
          setsCompleted: 3,
          repsPerSet: [10, 10, 10],
          completedAt: new Date().toISOString(),
        },
        {
          id: 'c3',
          exerciseId: 'push-ups',       // chest
          date: '2026-04-30',
          weekISO: '2026-W18',
          weightKg: 0,
          setsCompleted: 3,
          repsPerSet: [15, 15, 15],
          completedAt: new Date().toISOString(),
        },
      ],
    });

    const summary = useCompletionStore.getState().getSessionSummary('2026-04-30');
    // back appears twice but should be deduplicated
    expect(summary.muscleGroups).toContain('back');
    expect(summary.muscleGroups).toContain('chest');
    expect(summary.muscleGroups.filter((g) => g === 'back')).toHaveLength(1);
  });
});
