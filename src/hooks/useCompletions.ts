import { useCompletionStore } from '../store/completionStore';
import { getCurrentISOWeek, getTodayISO } from '../utils/dateUtils';

export function useCompletions() {
  const allCompletions = useCompletionStore((s) => s.completions);
  const addCompletion = useCompletionStore((s) => s.addCompletion);
  const removeCompletion = useCompletionStore((s) => s.removeCompletion);

  const weekISO = getCurrentISOWeek();
  const today = getTodayISO();
  const completionsThisWeek = allCompletions.filter((c) => c.weekISO === weekISO);

  function isCompleted(exerciseId: string, date: string = today): boolean {
    return completionsThisWeek.some(
      (c) => c.exerciseId === exerciseId && c.date === date
    );
  }

  function toggleCompletion(
    exerciseId: string,
    weightKg: number,
    sets: number,
    reps: number,
    date: string = today
  ) {
    if (isCompleted(exerciseId, date)) {
      removeCompletion(exerciseId, date);
    } else {
      const repsPerSet = Array(sets).fill(reps) as number[];
      addCompletion(exerciseId, weightKg, sets, repsPerSet);
    }
  }

  return { completionsThisWeek, isCompleted, toggleCompletion, weekISO };
}
