import { describe, expect, it } from 'vitest';
import { normalizeBossPhase, resolveStageVisualProfile } from './StageVisualProfile';

describe('StageVisualProfile', () => {
  it('maps chapter one stage orders to four visual tiers', () => {
    expect(resolveStageVisualProfile(1).tier).toBe('approach');
    expect(resolveStageVisualProfile(3).tier).toBe('ruins');
    expect(resolveStageVisualProfile(6).tier).toBe('depths');
    expect(resolveStageVisualProfile(10).tier).toBe('core');
  });

  it('clamps boss phases to the three portrait states', () => {
    expect(normalizeBossPhase(0)).toBe(1);
    expect(normalizeBossPhase(2)).toBe(2);
    expect(normalizeBossPhase(9)).toBe(3);
  });
});
