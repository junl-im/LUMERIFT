import { describe, expect, it } from 'vitest';
import { currentWeekKey } from './rankingLogic';

describe('ranking week key', () => {
  it('uses Monday UTC as the weekly board key', () => {
    expect(currentWeekKey(new Date('2026-07-27T12:00:00Z'))).toBe('2026-07-27');
    expect(currentWeekKey(new Date('2026-08-02T23:59:59Z'))).toBe('2026-07-27');
    expect(currentWeekKey(new Date('2026-08-03T00:00:00Z'))).toBe('2026-08-03');
  });
});
