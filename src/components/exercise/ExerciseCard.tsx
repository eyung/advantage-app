import { CompletionBadge } from './CompletionBadge';
import type { PlannedExercise, TennisCategory } from '../../types';
import { exerciseMap } from '../../data/exercises';

const CATEGORY_STYLES: Record<TennisCategory, { bg: string; text: string; label: string }> = {
  'lateral-agility':   { bg: 'bg-category-agility/15',   text: 'text-category-agility',   label: 'Lateral Agility' },
  'rotational-power':  { bg: 'bg-category-rotational/15', text: 'text-category-rotational', label: 'Rotational Power' },
  'shoulder-stability':{ bg: 'bg-category-shoulder/15',   text: 'text-category-shoulder',   label: 'Shoulder Stability' },
  'hiit-stamina':      { bg: 'bg-category-hiit/15',       text: 'text-category-hiit',       label: 'HIIT Stamina' },
  'general-strength':  { bg: 'bg-category-strength/15',   text: 'text-category-strength',   label: 'General Strength' },
};

interface Props {
  exercise: PlannedExercise;
  completed: boolean;
  onToggle: () => void;
}

export function ExerciseCard({ exercise, completed, onToggle }: Props) {
  const name = exerciseMap[exercise.exerciseId]?.name ?? exercise.exerciseId;
  const cat = CATEGORY_STYLES[exercise.category];
  const weightLabel = exercise.weightKg === 0 ? 'Bodyweight' : `${exercise.weightKg} kg`;

  return (
    <div
      className={`rounded-xl shadow-card p-4 space-y-3 transition-colors ${
        completed ? 'bg-court-green-faint border border-court-green/30' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className={`font-semibold text-sm leading-snug ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {name}
          </p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cat.bg} ${cat.text}`}>
            {cat.label}
          </span>
        </div>
        <CompletionBadge completed={completed} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-gray-600">
          <span><span className="font-semibold text-gray-900">{exercise.sets}</span> sets</span>
          <span><span className="font-semibold text-gray-900">{exercise.reps}</span> reps</span>
          <span><span className="font-semibold text-gray-900">{weightLabel}</span></span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            completed
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-clay text-white hover:bg-clay-dark'
          }`}
        >
          {completed ? 'Undo' : 'Complete'}
        </button>
      </div>
    </div>
  );
}
