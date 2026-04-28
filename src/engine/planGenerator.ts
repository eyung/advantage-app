import type {
  EquipmentProfile,
  WeeklyPlan,
  DayPlan,
  PlannedExercise,
  DayOfWeek,
  TennisCategory,
  Exercise,
  CustomisationProfile,
  CustomExercise,
} from '../types';
import exercises, { getExerciseLibrary, exerciseMap } from '../data/exercises';
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

/**
 * Builds the eligible exercise pool filtered by exclusions and blocked categories.
 * Empty category buckets are filled from the overflow of all non-empty buckets.
 */
export function buildEligiblePool(
  allExercises: Exercise[],
  customisation: CustomisationProfile
): Record<TennisCategory, Exercise[]> {
  const excludedSet = new Set(customisation.excludedExerciseIds);
  const blockedSet = new Set(customisation.blockedCategories);

  const pool = {} as Record<TennisCategory, Exercise[]>;
  for (const cat of ALL_CATEGORIES) {
    if (blockedSet.has(cat)) {
      pool[cat] = [];
    } else {
      pool[cat] = allExercises.filter((e) => e.category === cat && !excludedSet.has(e.id));
    }
  }

  // Build overflow from all non-empty buckets for gap filling
  const overflow: Exercise[] = ALL_CATEGORIES.flatMap((cat) => pool[cat]);

  for (const cat of ALL_CATEGORIES) {
    if (pool[cat].length === 0 && overflow.length > 0) {
      pool[cat] = overflow;
    }
  }

  return pool;
}

/**
 * Builds a full training day from an eligible pool (replaces the original buildTrainingDay).
 */
export function buildTrainingDayFromPool(
  rand: () => number,
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile
): DayPlan {
  const shuffledCategories = shuffle(rand, ALL_CATEGORIES);

  const planned: PlannedExercise[] = shuffledCategories.map((cat) => {
    const categoryPool = pool[cat];
    const exercise = randChoice(rand, categoryPool.length > 0 ? categoryPool : exercises);
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
 * Regenerates only the incomplete slots of an existing day.
 * Completed exercises (by ID) are preserved; the rest are replaced from the pool.
 * Uses a slot-indexed seed: customisationVersion * 100000 + dayIndex * 1000 + slotIndex
 */
export function buildSlotsFromPool(
  customisationVersion: number,
  dayIndex: number,
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile,
  existingDay: DayPlan,
  completedIds: Set<string>
): DayPlan {
  const updatedExercises = existingDay.exercises.map((pe, slotIndex) => {
    if (completedIds.has(pe.exerciseId)) return pe;

    const seed = (customisationVersion * 100000 + dayIndex * 1000 + slotIndex) >>> 0;
    const rand = mulberry32(seed);
    const categoryPool = pool[pe.category];
    const exercise = randChoice(rand, categoryPool.length > 0 ? categoryPool : exercises);
    const setsVariance = randInt(rand, -1, 1);
    const repsVariance = randInt(rand, -2, 2);
    return {
      exerciseId: exercise.id,
      category: pe.category,
      sets: Math.max(2, Math.min(5, exercise.defaultSets + setsVariance)),
      reps: Math.max(6, Math.min(20, exercise.defaultReps + repsVariance)),
      weightKg: assignWeight(exercise, profile.dumbbellWeights),
    };
  });

  return { isTrainingDay: true, exercises: updatedExercises };
}

/**
 * Generates a deterministic weekly plan.
 * Accepts optional customisation to filter the eligible exercise pool.
 * Same profile.configVersion + same weekISO + same customisation always produces the same plan.
 */
export function generateWeeklyPlan(
  profile: EquipmentProfile,
  weekISO: string,
  customisation?: CustomisationProfile,
  customExercises?: CustomExercise[]
): WeeklyPlan {
  if (profile.dumbbellWeights.length === 0) {
    throw new InvalidProfileError('dumbbellWeights must not be empty');
  }
  if (profile.trainingDays.length < 3 || profile.trainingDays.length > 6) {
    throw new InvalidProfileError('trainingDays must have 3–6 entries');
  }

  const weekNum = parseWeekNumber(weekISO);
  const seed = profile.configVersion * 10000 + weekNum;
  const rand = mulberry32(seed);

  const allExercises = customExercises ? getExerciseLibrary(customExercises) : exercises;
  const pool = customisation
    ? buildEligiblePool(allExercises, customisation)
    : buildEligiblePool(allExercises, { excludedExerciseIds: [], blockedCategories: [], customisationVersion: 0 });

  const trainingSet = new Set(profile.trainingDays);
  const days = {} as Record<DayOfWeek, DayPlan>;

  for (const day of ALL_DAYS) {
    if (trainingSet.has(day)) {
      days[day] = buildTrainingDayFromPool(rand, pool, profile);
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
