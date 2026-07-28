import { describe, expect, it } from 'vitest';
import { resolveRankingSeason, seasonRangeLabel } from './seasonLogic';

describe('ranking season logic', () => {
  it('starts season one on the fixed UTC Monday epoch', () => {
    const season = resolveRankingSeason(new Date('2026-07-06T12:00:00Z'));
    expect(season.id).toBe('S01_2026-07-06');
    expect(season.startKey).toBe('2026-07-06');
    expect(season.endKey).toBe('2026-08-02');
  });

  it('advances every 28 days', () => {
    const season = resolveRankingSeason(new Date('2026-08-03T00:00:00Z'));
    expect(season.number).toBe(2);
    expect(season.id).toBe('S02_2026-08-03');
  });

  it('formats a compact range label', () => {
    expect(seasonRangeLabel(resolveRankingSeason(new Date('2026-07-28T00:00:00Z'))))
      .toBe('2026.07.06 – 2026.08.02');
  });
});
