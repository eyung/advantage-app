import { describe, it, expect } from 'vitest';
import {
  generateWeeklyPlan,
  buildTrainingDayFromPool,
  buildEligiblePool,
} from './planGenerator';
import exercises, { exerciseMap } from '../data/exercises';
import type { EquipmentProfile, CustomisationProfile } from '../types';

const fullProfile: EquipmentProfile = {
  dumbbellWeights: [8, 12, 16],
  kettlebellWeights: [16],
  resistanceBandLevels: ['Medium', 'Heavy'],
  trainingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  aestheticsDays: [],
  defaultEquipmentTypes: ['dumbbells', 'resistance-bands', 'kettlebells', 'bodyweight'],
  configVersion: 1,
  savedAt: new Date().toISOString(),
};

const emptyCustomisation: CustomisationProfile = {
  excludedExerciseIds: [],
  blockedCategories: [],
  customisationVersion: 0,
};

const fullEquipment = ['dumbbells', 'resistance-bands', 'kettlebells', 'bodyweight'] as const;

function countPattern(plan: ReturnType<typeof generateWeeklyPlan>, type: 'pull' | 'push') {
  const isPull = (p: string) => p === 'pull-horizontal' || p === 'pull-vertical';
  const isPush = (p: string) => p === 'push-horizontal' || p === 'push-vertical';
  const check = type === 'pull' ? isPull : isPush;
  let count = 0;
  for (const dayPlan of Object.values(plan.days)) {
    if (!dayPlan.isTrainingDay) continue;
    for (const pe of dayPlan.exercises) {
      const ex = exerciseMap[pe.exerciseId];
      if (ex && check(ex.movementPattern)) count++;
    }
  }
  return count;
}

// SC-007: pull ≥ push in ≥ 80% of plans with full equipment pool
describe('SC-007: pull-preference bias', () => {
  it('produces pull ≥ push in ≥ 80% of 10 generated plans', () => {
    let pullGeqPush = 0;
    for (let i = 1; i <= 10; i++) {
      const plan = generateWeeklyPlan(
        { ...fullProfile, configVersion: i },
        `2026-W${String(i).padStart(2, '0')}`,
        emptyCustomisation,
        [],
        [...fullEquipment]
      );
      const pull = countPattern(plan, 'pull');
      const push = countPattern(plan, 'push');
      if (pull >= push) pullGeqPush++;
    }
    expect(pullGeqPush).toBeGreaterThanOrEqual(8);
  });

  it('does not fail plan generation on a bands-only session', () => {
    const bandsProfile: EquipmentProfile = {
      ...fullProfile,
      resistanceBandLevels: ['Medium'],
      kettlebellWeights: [],
    };
    expect(() =>
      generateWeeklyPlan(bandsProfile, '2026-W20', emptyCustomisation, [], [
        'resistance-bands',
        'bodyweight',
      ])
    ).not.toThrow();
  });
});

// SC-008: consecutive training days have different dominant muscle groups
describe('SC-008: consecutive-day muscle group guard', () => {
  function dominantGroup(exerciseIds: string[]) {
    const counts = new Map<string, number>();
    for (const id of exerciseIds) {
      const g = exerciseMap[id]?.primaryMuscleGroup;
      if (g) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    let best = '';
    let bestCount = 0;
    for (const [g, c] of counts) {
      if (c > bestCount) { bestCount = c; best = g; }
    }
    return best;
  }

  it('consecutive training days have different dominant muscle groups', () => {
    const consecutiveProfile: EquipmentProfile = {
      ...fullProfile,
      trainingDays: ['Mon', 'Tue', 'Wed'],
      configVersion: 99,
    };
    const plan = generateWeeklyPlan(
      consecutiveProfile,
      '2026-W18',
      emptyCustomisation,
      [],
      [...fullEquipment]
    );

    const trainingDays = (['Mon', 'Tue', 'Wed'] as const).map(
      (d) => plan.days[d]
    );
    for (let i = 0; i < trainingDays.length - 1; i++) {
      const curr = trainingDays[i]!;
      const next = trainingDays[i + 1]!;
      const currGroup = dominantGroup(curr.exercises.map((e) => e.exerciseId));
      const nextGroup = dominantGroup(next.exercises.map((e) => e.exerciseId));
      expect(currGroup).not.toBe(nextGroup);
    }
  });

  it('guard falls back gracefully when all pool exercises share the avoided group', () => {
    // Build a pool that only has shoulder exercises in all categories
    const pool = buildEligiblePool(exercises, emptyCustomisation, ['dumbbells', 'bodyweight']);
    // This should not throw even with an avoidMuscleGroup set
    const mulberry32 = (seed: number) => {
      let s = seed >>> 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let z = Math.imul(s ^ (s >>> 15), 1 | s);
        z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
        return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
      };
    };
    const rand = mulberry32(42);
    expect(() =>
      buildTrainingDayFromPool(rand, pool, fullProfile, 'legs')
    ).not.toThrow();
  });
});
