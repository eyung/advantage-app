import { describe, it, expect } from 'vitest';
import { currentStreak } from './streak';
import type { DayOfWeek, ExerciseCompletion } from '../types';

function completion(date: string): ExerciseCompletion {
  return {
    id: date,
    exerciseId: 'ex1',
    date,
    weekISO: '2026-W24',
    weightKg: 10,
    setsCompleted: 3,
    repsPerSet: [10, 10, 10],
    completedAt: date + 'T12:00:00.000Z',
  };
}

// 2026-06-12 is a Friday. Mon=08, Wed=10, Fri=12 of that week.
const FRIDAY = new Date('2026-06-12T12:00:00');
const MWF: DayOfWeek[] = ['Mon', 'Wed', 'Fri'];

describe('currentStreak', () => {
  it('returns 0 with no training days configured', () => {
    expect(currentStreak([completion('2026-06-12')], [], FRIDAY)).toBe(0);
  });

  it('returns 0 with no completions', () => {
    expect(currentStreak([], MWF, FRIDAY)).toBe(0);
  });

  it('counts consecutive completed scheduled days; rest days do not break it', () => {
    const completions = [
      completion('2026-06-08'), // Mon
      completion('2026-06-10'), // Wed
      completion('2026-06-12'), // Fri (today)
    ];
    // Tue/Thu gaps are rest days — streak spans them
    expect(currentStreak(completions, MWF, FRIDAY)).toBe(3);
  });

  it('a missed scheduled day in the past breaks the streak', () => {
    const completions = [
      completion('2026-06-08'), // Mon completed
      // Wed 2026-06-10 scheduled but missed
      completion('2026-06-12'), // Fri (today) completed
    ];
    expect(currentStreak(completions, MWF, FRIDAY)).toBe(1);
  });

  it("today's pending session is grace, not a break", () => {
    const completions = [
      completion('2026-06-08'), // Mon
      completion('2026-06-10'), // Wed
      // Fri (today) not yet completed
    ];
    expect(currentStreak(completions, MWF, FRIDAY)).toBe(2);
  });

  it('extends across weeks', () => {
    const completions = [
      completion('2026-06-03'), // Wed prev week
      completion('2026-06-05'), // Fri prev week
      completion('2026-06-08'), // Mon
      completion('2026-06-10'), // Wed
      completion('2026-06-12'), // Fri
    ];
    // Mon 2026-06-01 scheduled but missed → streak is 5
    expect(currentStreak(completions, MWF, FRIDAY)).toBe(5);
  });

  it('multiple completions on the same day count once', () => {
    const completions = [completion('2026-06-12'), { ...completion('2026-06-12'), id: 'x' }];
    expect(currentStreak(completions, MWF, FRIDAY)).toBe(1);
  });
});
