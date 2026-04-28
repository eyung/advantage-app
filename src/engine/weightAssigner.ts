import type { Exercise } from '../types';

type MuscleGroup = Exercise['primaryMuscleGroup'];
type StrengthLevel = 'beginner' | 'intermediate' | 'advanced';

/** Fraction of the user's heaviest dumbbell to target per muscle group and strength level */
const BANDS: Record<MuscleGroup, Record<StrengthLevel, number>> = {
  legs:       { beginner: 0.75, intermediate: 0.70, advanced: 0.65 },
  chest:      { beginner: 0.60, intermediate: 0.55, advanced: 0.50 },
  back:       { beginner: 0.65, intermediate: 0.60, advanced: 0.55 },
  shoulders:  { beginner: 0.45, intermediate: 0.40, advanced: 0.38 },
  arms:       { beginner: 0.35, intermediate: 0.30, advanced: 0.28 },
  core:       { beginner: 0.25, intermediate: 0.22, advanced: 0.20 },
  'full-body':{ beginner: 0.60, intermediate: 0.55, advanced: 0.50 },
};

function getStrengthLevel(maxWeight: number): StrengthLevel {
  if (maxWeight <= 10) return 'beginner';
  if (maxWeight <= 20) return 'intermediate';
  return 'advanced';
}

/**
 * Returns the most appropriate weight from `availableWeights` for the given exercise.
 * Returns 0 for bodyweight exercises.
 * The returned value is always a member of `availableWeights` (or 0).
 */
export function assignWeight(exercise: Exercise, availableWeights: number[]): number {
  if (exercise.equipment === 'bodyweight') return 0;
  if (availableWeights.length === 0) return 0;

  const maxWeight = availableWeights[availableWeights.length - 1]!;
  const level = getStrengthLevel(maxWeight);
  const fraction = BANDS[exercise.primaryMuscleGroup][level];
  const target = fraction * maxWeight;

  // Select nearest available weight; when tied, prefer lower
  let nearest = availableWeights[0]!;
  let bestDiff = Math.abs(target - nearest);
  for (const w of availableWeights) {
    const diff = Math.abs(target - w);
    if (diff < bestDiff) {
      bestDiff = diff;
      nearest = w;
    }
  }
  return nearest;
}
