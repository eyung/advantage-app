import type { EquipmentProfile, WeeklyPlan, DayPlan, PlannedExercise, DayOfWeek, TennisCategory } from '../types';
import exercises, { exerciseMap } from '../data/exercises';
import { assignWeight } from './weightAssigner';
import { getCurrentISOWeek } from '../utils/dateUtils';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_CATEGORIES: TennisCategory[] = [
  'lateral-agility',
  'rotational-power',
  'shoulder-stability',
  'hiit-stamina',
  'general-strength',
];

export class InvalidProfileError extends Error {}

// Mulberry32 PRNG — produces uniform [0, 1)
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randChoice<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function shuffle<T>(rand: () => number, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function parseWeekNumber(weekISO: string): number {
  const match = weekISO.match(/W(\d+)/);
  return match ? parseInt(match[1]!, 10) : 1;
}

function buildTrainingDay(
  rand: () => number,
  profile: EquipmentProfile
): DayPlan {
  // One exercise per category (ensures all 5 categories covered)
  const shuffledCategories = shuffle(rand, ALL_CATEGORIES);
  const exercisesByCategory: Record<TennisCategory, typeof exercises> = {
    'lateral-agility': exercises.filter((e) => e.category === 'lateral-agility'),
    'rotational-power': exercises.filter((e) => e.category === 'rotational-power'),
    'shoulder-stability': exercises.filter((e) => e.category === 'shoulder-stability'),
    'hiit-stamina': exercises.filter((e) => e.category === 'hiit-stamina'),
    'general-strength': exercises.filter((e) => e.category === 'general-strength'),
  };

  const planned: PlannedExercise[] = shuffledCategories.map((cat) => {
    const pool = exercisesByCategory[cat];
    const exercise = randChoice(rand, pool);
    const setsVariance = randInt(rand, -1, 1);
    const repsVariance = randInt(rand, -2, 2);
    return {
      exerciseId: exercise.id,
      category: cat,
      sets: Math.max(2, Math.min(5, exercise.defaultSets + setsVariance)),
      reps: Math.max(6, Math.min(20, exercise.defaultReps + repsVariance)),
      weightKg: assignWeight(exercise, profile.dumbbellWeights),
    };
  });

  return { isTrainingDay: true, exercises: planned };
}

/**
 * Generates a deterministic weekly plan.
 * Same profile.configVersion + same weekISO always produces the same plan.
 */
export function generateWeeklyPlan(profile: EquipmentProfile, weekISO: string): WeeklyPlan {
  if (profile.dumbbellWeights.length === 0) {
    throw new InvalidProfileError('dumbbellWeights must not be empty');
  }
  if (profile.trainingDays.length < 3 || profile.trainingDays.length > 6) {
    throw new InvalidProfileError('trainingDays must have 3–6 entries');
  }

  const weekNum = parseWeekNumber(weekISO);
  const seed = profile.configVersion * 10000 + weekNum;
  const rand = mulberry32(seed);

  const trainingSet = new Set(profile.trainingDays);
  const days = {} as Record<DayOfWeek, DayPlan>;

  for (const day of ALL_DAYS) {
    if (trainingSet.has(day)) {
      days[day] = buildTrainingDay(rand, profile);
    } else {
      days[day] = { isTrainingDay: false, exercises: [] };
    }
  }

  return { weekISO, configVersion: profile.configVersion, days };
}

export function getCurrentWeekPlan(profile: EquipmentProfile): WeeklyPlan {
  return generateWeeklyPlan(profile, getCurrentISOWeek());
}

export function getExerciseName(exerciseId: string): string {
  return exerciseMap[exerciseId]?.name ?? exerciseId;
}
