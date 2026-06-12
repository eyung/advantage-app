import type { DayOfWeek, ExerciseCompletion } from '../types';
import { getDayOfWeekIndex } from './dateUtils';

const DAY_ORDER: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MAX_LOOKBACK_DAYS = 730;

/**
 * Consecutive scheduled training days completed, walking back from `today`.
 * Rest (unscheduled) days never break the streak; today being incomplete is
 * grace — only a missed scheduled day in the past ends the count.
 */
export function currentStreak(
  completions: ExerciseCompletion[],
  trainingDays: DayOfWeek[],
  today: Date
): number {
  if (trainingDays.length === 0) return 0;
  const completedDates = new Set(completions.map((c) => c.date));
  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const iso = cursor.toISOString().split('T')[0]!;
    const dow = DAY_ORDER[getDayOfWeekIndex(cursor)]!;
    if (trainingDays.includes(dow)) {
      if (completedDates.has(iso)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
