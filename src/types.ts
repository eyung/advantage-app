export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type MovementPattern =
  | 'push-horizontal'
  | 'push-vertical'
  | 'pull-horizontal'
  | 'pull-vertical'
  | 'hinge'
  | 'squat'
  | 'rotation'
  | 'lateral'
  | 'carry'
  | 'other';

export type TennisCategory =
  | 'lateral-agility'
  | 'rotational-power'
  | 'shoulder-stability'
  | 'hiit-stamina'
  | 'general-strength';

export type ResistanceBandLevel = 'Light' | 'Medium' | 'Heavy' | 'Extra-Heavy';

export type EquipmentType = 'dumbbells' | 'resistance-bands' | 'kettlebells' | 'bodyweight';

export interface Exercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight' | 'resistance-band' | 'kettlebell';
  primaryMuscleGroup: 'legs' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full-body';
  movementPattern: MovementPattern;
  defaultSets: number;
  defaultReps: number;
  goalTags?: ('aesthetics')[];
}

export interface SessionSummary {
  date: string;
  exerciseIds: string[];
  muscleGroups: Exercise['primaryMuscleGroup'][];
}

export interface EquipmentProfile {
  dumbbellWeights: number[];
  kettlebellWeights: number[];
  resistanceBandLevels: ResistanceBandLevel[];
  trainingDays: DayOfWeek[];
  aestheticsDays: DayOfWeek[];
  defaultEquipmentTypes: EquipmentType[];
  configVersion: number;
  savedAt: string;
}

export interface SessionEquipmentAvailability {
  availableTypes: EquipmentType[];
  date: string;
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

export interface CustomExercise {
  id: string;
  name: string;
  category: TennisCategory;
  equipment: 'dumbbell' | 'bodyweight';
  primaryMuscleGroup: Exercise['primaryMuscleGroup'];
  movementPattern?: MovementPattern;
  defaultSets: number;
  defaultReps: number;
  createdAt: string;
  goalTags?: ('aesthetics')[];
}

export interface CustomisationProfile {
  excludedExerciseIds: string[];
  blockedCategories: TennisCategory[];
  customisationVersion: number;
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
