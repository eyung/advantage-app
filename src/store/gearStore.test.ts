import { describe, it, expect, beforeEach } from 'vitest';
import {
  useGearStore,
  currentSetupFor,
  historyFor,
  stringAgeDays,
  validateRacketInput,
  validateRestringInput,
} from './gearStore';
import type { RestringRecord } from '../types';

function makeRestring(partial: Partial<RestringRecord> & { id: string; date: string }): RestringRecord {
  return {
    racketId: 'r1',
    mainString: 'Test String',
    mainTensionLbs: 52,
    ...partial,
  };
}

beforeEach(() => {
  useGearStore.setState({ rackets: [], restrings: [] });
});

describe('currentSetupFor', () => {
  it('returns undefined when racket has no restrings', () => {
    expect(currentSetupFor([], 'r1')).toBeUndefined();
  });

  it('picks the restring with the latest date', () => {
    const restrings = [
      makeRestring({ id: 'a', date: '2026-01-10' }),
      makeRestring({ id: 'b', date: '2026-05-01' }),
      makeRestring({ id: 'c', date: '2026-03-15' }),
    ];
    expect(currentSetupFor(restrings, 'r1')?.id).toBe('b');
  });

  it('a backfilled (older) restring does not become current', () => {
    const restrings = [
      makeRestring({ id: 'a', date: '2026-05-01' }),
      makeRestring({ id: 'backfill', date: '2025-11-20' }),
    ];
    expect(currentSetupFor(restrings, 'r1')?.id).toBe('a');
  });

  it('ignores restrings belonging to other rackets', () => {
    const restrings = [
      makeRestring({ id: 'a', date: '2026-05-01', racketId: 'other' }),
      makeRestring({ id: 'b', date: '2026-01-01' }),
    ];
    expect(currentSetupFor(restrings, 'r1')?.id).toBe('b');
  });

  it('breaks date ties in favour of the most recently added record', () => {
    const restrings = [
      makeRestring({ id: 'first', date: '2026-05-01' }),
      makeRestring({ id: 'second', date: '2026-05-01' }),
    ];
    expect(currentSetupFor(restrings, 'r1')?.id).toBe('second');
  });
});

describe('historyFor', () => {
  it('sorts newest first', () => {
    const restrings = [
      makeRestring({ id: 'a', date: '2026-01-10' }),
      makeRestring({ id: 'b', date: '2026-05-01' }),
      makeRestring({ id: 'c', date: '2026-03-15' }),
    ];
    expect(historyFor(restrings, 'r1').map((r) => r.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('stringAgeDays', () => {
  it('returns null when never strung', () => {
    expect(stringAgeDays([], 'r1', '2026-06-12')).toBeNull();
  });

  it('counts whole days since the current setup', () => {
    const restrings = [makeRestring({ id: 'a', date: '2026-06-01' })];
    expect(stringAgeDays(restrings, 'r1', '2026-06-12')).toBe(11);
  });

  it('clamps to zero for same-day restrings', () => {
    const restrings = [makeRestring({ id: 'a', date: '2026-06-12' })];
    expect(stringAgeDays(restrings, 'r1', '2026-06-12')).toBe(0);
  });
});

describe('validation', () => {
  it('requires brand and model', () => {
    expect(validateRacketInput({ brand: ' ', model: 'EZONE 98' })).toBeTruthy();
    expect(validateRacketInput({ brand: 'Yonex', model: '' })).toBeTruthy();
    expect(validateRacketInput({ brand: 'Yonex', model: 'EZONE 98' })).toBeNull();
  });

  it('rejects tension outside 30–80 lbs', () => {
    const base = { racketId: 'r1', date: '2026-06-01', mainString: 'ALU Power' };
    expect(validateRestringInput({ ...base, mainTensionLbs: 25 }, '2026-06-12')).toBeTruthy();
    expect(validateRestringInput({ ...base, mainTensionLbs: 85 }, '2026-06-12')).toBeTruthy();
    expect(validateRestringInput({ ...base, mainTensionLbs: 52 }, '2026-06-12')).toBeNull();
    expect(
      validateRestringInput({ ...base, mainTensionLbs: 52, crossTensionLbs: 90 }, '2026-06-12')
    ).toBeTruthy();
  });

  it('rejects future dates and malformed dates', () => {
    const base = { racketId: 'r1', mainString: 'ALU Power', mainTensionLbs: 52 };
    expect(validateRestringInput({ ...base, date: '2026-06-13' }, '2026-06-12')).toBeTruthy();
    expect(validateRestringInput({ ...base, date: 'not-a-date' }, '2026-06-12')).toBeTruthy();
    expect(validateRestringInput({ ...base, date: '2026-06-12' }, '2026-06-12')).toBeNull();
  });
});

describe('store actions', () => {
  it('addRacket trims fields and defaults to active', () => {
    useGearStore.getState().addRacket({ brand: '  Yonex ', model: ' EZONE 98 ' });
    const racket = useGearStore.getState().rackets[0]!;
    expect(racket.brand).toBe('Yonex');
    expect(racket.model).toBe('EZONE 98');
    expect(racket.status).toBe('active');
  });

  it('setRacketStatus toggles retire and reactivate', () => {
    useGearStore.getState().addRacket({ brand: 'Yonex', model: 'EZONE 98' });
    const id = useGearStore.getState().rackets[0]!.id;
    useGearStore.getState().setRacketStatus(id, 'retired');
    expect(useGearStore.getState().rackets[0]!.status).toBe('retired');
    useGearStore.getState().setRacketStatus(id, 'active');
    expect(useGearStore.getState().rackets[0]!.status).toBe('active');
  });

  it('deleteRacket cascades to its restrings only', () => {
    const store = useGearStore.getState();
    store.addRacket({ brand: 'Yonex', model: 'EZONE 98' });
    store.addRacket({ brand: 'Head', model: 'Speed MP' });
    const [a, b] = useGearStore.getState().rackets;
    useGearStore.getState().addRestring({
      racketId: a!.id,
      date: '2026-06-01',
      mainString: 'ALU Power',
      mainTensionLbs: 52,
    });
    useGearStore.getState().addRestring({
      racketId: b!.id,
      date: '2026-06-02',
      mainString: 'RPM Blast',
      mainTensionLbs: 50,
    });
    useGearStore.getState().deleteRacket(a!.id);
    const state = useGearStore.getState();
    expect(state.rackets.map((r) => r.id)).toEqual([b!.id]);
    expect(state.restrings).toHaveLength(1);
    expect(state.restrings[0]!.racketId).toBe(b!.id);
  });
});
