import { describe, expect, it } from 'vitest';
import { resolveAutoPresetPerformance } from './AutoPresetPerformance';

const summary = {
  enabledSeconds: 60,
  strategyPreset: 'balanced' as const,
  targetChanges: 4,
  attacks: 12,
  skill1Uses: 5,
  skill2Uses: 3,
  dodges: 2,
  manualInterventions: 1,
  bossPatternDodges: {},
  topReason: 'skill1-ready',
  recentReasons: [],
};

describe('resolveAutoPresetPerformance', () => {
  it('recommends aggressive play for fast skill-heavy sessions', () => {
    const report = resolveAutoPresetPerformance({ victory: true, clearSeconds: 44, maxCombo: 7, defeated: 8, summary });
    expect(report.recommendedPreset).toBe('aggressive');
    expect(report.scores).toHaveLength(3);
  });

  it('falls back to balanced when no auto session exists', () => {
    const report = resolveAutoPresetPerformance({ victory: true, clearSeconds: 80, maxCombo: 2, defeated: 4 });
    expect(report.recommendedPreset).toBe('balanced');
  });
});
