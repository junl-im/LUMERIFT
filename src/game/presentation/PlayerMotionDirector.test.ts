import { describe, expect, it } from 'vitest';
import { resolvePlayerMotion } from './PlayerMotionDirector';

describe('resolvePlayerMotion', () => {
  it('adds aggressive trail and afterimages to dodge', () => {
    const result = resolvePlayerMotion({ state: 'dodging', progress: 0.5, comboStep: 0, driveRatio: 0.2, overdrive: false, reducedMotion: false, renderIntensity: 1 });
    expect(result.trailLength).toBeGreaterThan(80);
    expect(result.afterimageAlpha).toBeGreaterThan(0.3);
  });

  it('reduces afterimage intensity when reduced motion is enabled', () => {
    const normal = resolvePlayerMotion({ state: 'skill', progress: 0.5, comboStep: 0, driveRatio: 1, overdrive: true, reducedMotion: false, renderIntensity: 1 });
    const reduced = resolvePlayerMotion({ state: 'skill', progress: 0.5, comboStep: 0, driveRatio: 1, overdrive: true, reducedMotion: true, renderIntensity: 1 });
    expect(reduced.offsetY).toBeGreaterThan(normal.offsetY);
  });
});
