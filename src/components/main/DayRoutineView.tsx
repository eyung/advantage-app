import { ExerciseCard } from '../exercise/ExerciseCard';
import type { DayPlan } from '../../types';

interface Props {
  dayPlan: DayPlan;
  dayLabel: string;
  isCompleted: (exerciseId: string) => boolean;
  onToggle: (exerciseId: string, weightKg: number, sets: number, reps: number) => void;
}

export function DayRoutineView({ dayPlan, dayLabel, isCompleted, onToggle }: Props) {
  if (!dayPlan.isTrainingDay) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
        <div className="text-5xl">😴</div>
        <h2 className="text-lg font-semibold text-gray-700">Rest Day</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          {dayLabel} is a rest day. Recover well — your next session will be stronger for it.
        </p>
      </div>
    );
  }

  const doneCount = dayPlan.exercises.filter((e) => isCompleted(e.exerciseId)).length;
  const total = dayPlan.exercises.length;
  const allDone = doneCount >= total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-700">
          {dayLabel} · {total} exercises
        </h2>
        <span className={`text-xs font-medium ${allDone ? 'text-court-green-dark' : 'text-gray-400'}`}>
          {doneCount}/{total} done {allDone && '🎾'}
        </span>
      </div>

      {dayPlan.exercises.map((ex) => (
        <ExerciseCard
          key={ex.exerciseId}
          exercise={ex}
          completed={isCompleted(ex.exerciseId)}
          onToggle={() => onToggle(ex.exerciseId, ex.weightKg, ex.sets, ex.reps)}
        />
      ))}
    </div>
  );
}
