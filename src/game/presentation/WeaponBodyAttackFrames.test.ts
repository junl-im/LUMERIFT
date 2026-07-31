import { describe, expect, it } from 'vitest';
import { resolveWeaponBodyFrameRecipe } from './WeaponBodyAttackFrames';

describe('WeaponBodyAttackFrames', () => {
  it('uses distinct attack body recipes for blade, greatblade, and riftlance', () => {
    const blade = resolveWeaponBodyFrameRecipe('blade', 'attack1');
    const greatblade = resolveWeaponBodyFrameRecipe('greatblade', 'attack1');
    const lance = resolveWeaponBodyFrameRecipe('riftlance', 'attack1');
    expect(blade.sourcePose).toBe('attack1');
    expect(greatblade.sourcePose).toBe('attack3');
    expect(lance.sourcePose).toBe('attack2');
    expect(greatblade.animationSpeed).toBeLessThan(blade.animationSpeed);
    expect(lance.frameOrder).not.toEqual(greatblade.frameOrder);
  });

  it('keeps movement and idle on the requested shared pose', () => {
    expect(resolveWeaponBodyFrameRecipe('greatblade', 'idle').sourcePose).toBe('idle');
    expect(resolveWeaponBodyFrameRecipe('riftlance', 'run').loop).toBe(true);
  });
});
