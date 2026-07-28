import { describe, expect, it } from 'vitest';
import {
  bossCinematicAlpha,
  normalizeBossPhaseValue,
  resolveBossPhasePresentation,
} from './BossPhaseDirector';

describe('BossPhaseDirector', () => {
  it('clamps all phase values to the three supported states', () => {
    expect(normalizeBossPhaseValue(-2)).toBe(1);
    expect(normalizeBossPhaseValue(2)).toBe(2);
    expect(normalizeBossPhaseValue(9)).toBe(3);
  });

  it('increases visual pressure by phase', () => {
    const phase1 = resolveBossPhasePresentation(1);
    const phase3 = resolveBossPhasePresentation(3);
    expect(phase3.bodyScale).toBeGreaterThan(phase1.bodyScale);
    expect(phase3.shake).toBeGreaterThan(phase1.shake);
    expect(phase3.auraRings).toBe(3);
  });

  it('fades the cinematic in and out', () => {
    expect(bossCinematicAlpha(1, 1)).toBe(0);
    expect(bossCinematicAlpha(0.5, 1)).toBe(1);
    expect(bossCinematicAlpha(0.05, 1)).toBeLessThan(0.3);
  });
});
