export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type TennisCategory =
  | 'lateral-agility'
  | 'rotational-power'
  | 'shoulder-stability'
  | 'hiit-stamina'
  | 'general-strength';

export interface Exercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight';
  primaryMuscleGroup: 'legs' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full-body';
  defaultSets: number;
  defaultReps: number;
}

export interface EquipmentProfile {
  dumbbellWeights: number[];
  trainingDays: DayOfWeek[];
  configVersion: number;
  savedAt: string;
}

export interface PlannedExercise {
  exerciseId: string;
  category: TennisCategory;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface DayPlan {
  isTrainingDay: boolean;
  exercises: PlannedExercise[];
}

export interface WeeklyPlan {
  weekISO: string;
  configVersion: number;
  days: Record<DayOfWeek, DayPlan>;
}

export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  date: string;
  weekISO: string;
  weightKg: number;
  setsCompleted: number;
  repsPerSet: number[];
  completedAt: string;
}
