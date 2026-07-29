import { describe, expect, it } from 'vitest';
import { resolveDirectionalAttackPose } from './DirectionalAttackPose';

describe('resolveDirectionalAttackPose', () => {
  it('leans an east-facing strike toward the target', () => {
    const pose = resolveDirectionalAttackPose({ direction: 'e', state: 'attacking', progress: 0.5, comboStep: 2, reducedMotion: false });
    expect(pose.offsetX).toBeGreaterThan(5);
    expect(pose.rotation).toBeGreaterThan(0);
    expect(pose.accentAlpha).toBeGreaterThan(0.2);
  });

  it('keeps north and south attacks vertically distinct', () => {
    const north = resolveDirectionalAttackPose({ direction: 'n', state: 'skill', progress: 0.5, comboStep: 1, reducedMotion: false });
    const south = resolveDirectionalAttackPose({ direction: 's', state: 'skill', progress: 0.5, comboStep: 1, reducedMotion: false });
    expect(north.offsetY).toBeLessThan(south.offsetY);
  });

  it('reduces presentation movement for reduced motion users', () => {
    const full = resolveDirectionalAttackPose({ direction: 'ne', state: 'attacking', progress: 0.5, comboStep: 3, reducedMotion: false });
    const reduced = resolveDirectionalAttackPose({ direction: 'ne', state: 'attacking', progress: 0.5, comboStep: 3, reducedMotion: true });
    expect(Math.abs(reduced.offsetX)).toBeLessThan(Math.abs(full.offsetX));
    expect(reduced.accentAlpha).toBeLessThan(full.accentAlpha);
  });
});
