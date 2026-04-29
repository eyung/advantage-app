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
  ResistanceBandLevel,
  EquipmentType,
} from '../types';
import exercises, { getExerciseLibrary } from '../data/exercises';
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

const BAND_KG_MAP: Record<ResistanceBandLevel, number> = {
  Light: 5,
  Medium: 15,
  Heavy: 30,
  'Extra-Heavy': 50,
};

const EQUIPMENT_TYPE_TO_FIELD: Record<EquipmentType, Exercise['equipment']> = {
  dumbbells: 'dumbbell',
  'resistance-bands': 'resistance-band',
  kettlebells: 'kettlebell',
  bodyweight: 'bodyweight',
};

export class InvalidProfileError extends Error {}

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

function getWeightForExercise(exercise: Exercise, profile: EquipmentProfile): number {
  switch (exercise.equipment) {
    case 'dumbbell':
      return assignWeight(exercise, profile.dumbbellWeights);
    case 'kettlebell':
      return assignWeight(exercise, profile.kettlebellWeights ?? []);
    case 'resistance-band': {
      const bandKg = (profile.resistanceBandLevels ?? [])
        .map((l) => BAND_KG_MAP[l])
        .sort((a, b) => a - b);
      return assignWeight(exercise, bandKg.length > 0 ? bandKg : [0]);
    }
    case 'bodyweight':
      return 0;
  }
}

/**
 * Builds the eligible exercise pool filtered by exclusions, blocked categories, and available equipment.
 * Empty category buckets are filled from the overflow of all non-empty buckets.
 */
export function buildEligiblePool(
  allExercises: Exercise[],
  customisation: CustomisationProfile,
  availableEquipmentTypes: EquipmentType[] = ['dumbbells', 'bodyweight']
): Record<TennisCategory, Exercise[]> {
  const excludedSet = new Set(customisation.excludedExerciseIds);
  const blockedSet = new Set(customisation.blockedCategories);

  const equipmentFieldSet = new Set<Exercise['equipment']>(['bodyweight']);
  for (const t of availableEquipmentTypes) {
    equipmentFieldSet.add(EQUIPMENT_TYPE_TO_FIELD[t]);
  }

  const pool = {} as Record<TennisCategory, Exercise[]>;
  for (const cat of ALL_CATEGORIES) {
    if (blockedSet.has(cat)) {
      pool[cat] = [];
    } else {
      pool[cat] = allExercises.filter(
        (e) =>
          e.category === cat &&
          !excludedSet.has(e.id) &&
          equipmentFieldSet.has(e.equipment)
      );
    }
  }

  const overflow: Exercise[] = ALL_CATEGORIES.flatMap((cat) => pool[cat]);

  for (const cat of ALL_CATEGORIES) {
    if (pool[cat].length === 0 && overflow.length > 0) {
      pool[cat] = overflow;
    }
  }

  return pool;
}

/**
 * Builds a full training day from an eligible pool.
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
      weightKg: getWeightForExercise(exercise, profile),
    };
  });

  return { isTrainingDay: true, exercises: planned };
}

/**
 * Regenerates only the incomplete slots of an existing day.
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
      weightKg: getWeightForExercise(exercise, profile),
    };
  });

  return { isTrainingDay: true, exercises: updatedExercises };
}

/**
 * Applies aesthetics guarantee: if isAestheticsDay and no selected exercise is aesthetics-tagged,
 * swaps the last slot with a seeded aesthetics exercise from the pool.
 */
function applyAestheticsGuarantee(
  dayPlan: DayPlan,
  pool: Record<TennisCategory, Exercise[]>,
  profile: EquipmentProfile,
  seed: number
): DayPlan {
  const poolMap = new Map<string, Exercise>();
  for (const cat of ALL_CATEGORIES) {
    for (const ex of pool[cat]) {
      poolMap.set(ex.id, ex);
    }
  }

  const hasAesthetics = dayPlan.exercises.some((pe) => {
    const ex = poolMap.get(pe.exerciseId);
    return ex?.goalTags?.includes('aesthetics');
  });

  if (hasAesthetics) return dayPlan;

  const aestheticsPool: Exercise[] = ALL_CATEGORIES.flatMap((cat) =>
    pool[cat].filter((e) => e.goalTags?.includes('aesthetics'))
  );

  if (aestheticsPool.length === 0) return dayPlan;

  const rand = mulberry32(seed);
  const picked = randChoice(rand, aestheticsPool);
  const exercises = [...dayPlan.exercises];
  exercises[exercises.length - 1] = {
    exerciseId: picked.id,
    category: picked.category,
    sets: picked.defaultSets,
    reps: picked.defaultReps,
    weightKg: getWeightForExercise(picked, profile),
  };

  return { isTrainingDay: true, exercises };
}

/**
 * Generates a deterministic weekly plan.
 */
export function generateWeeklyPlan(
  profile: EquipmentProfile,
  weekISO: string,
  customisation?: CustomisationProfile,
  customExercises?: CustomExercise[],
  availableEquipmentTypes?: EquipmentType[]
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
  const effectiveEquipment = availableEquipmentTypes ?? ['dumbbells', 'bodyweight'];
  const pool = buildEligiblePool(
    allExercises,
    customisation ?? { excludedExerciseIds: [], blockedCategories: [], customisationVersion: 0 },
    effectiveEquipment
  );

  const aestheticsDays = new Set(profile.aestheticsDays ?? []);
  const trainingSet = new Set(profile.trainingDays);
  const days = {} as Record<DayOfWeek, DayPlan>;

  for (let dayIndex = 0; dayIndex < ALL_DAYS.length; dayIndex++) {
    const day = ALL_DAYS[dayIndex]!;
    if (trainingSet.has(day)) {
      let dayPlan = buildTrainingDayFromPool(rand, pool, profile);
      if (aestheticsDays.has(day)) {
        const aestheticsSeed = (profile.configVersion * 10000 + weekNum * 100 + dayIndex * 10) >>> 0;
        dayPlan = applyAestheticsGuarantee(dayPlan, pool, profile, aestheticsSeed);
      }
      days[day] = dayPlan;
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
  const ex = getExerciseLibrary([]).find((e) => e.id === exerciseId);
  return ex?.name ?? exerciseId;
}
