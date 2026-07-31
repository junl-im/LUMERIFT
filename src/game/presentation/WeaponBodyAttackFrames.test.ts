import { describe, expect, it } from 'vitest';
import {
  resolveWeaponBodyFrameCorrection,
  resolveWeaponBodyFrameRecipe,
  resolveWeaponBodyTextures,
} from './WeaponBodyAttackFrames';

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

  it('prefers the dedicated weapon attack atlas when available', () => {
    const textures = [{ id: 1 }, { id: 2 }] as never[];
    const dedicated = { animations: { 'weapon_body.blade.attack1.s': textures } } as never;
    const resolved = resolveWeaponBodyTextures(undefined, 'blade', 'attack1', 's', dedicated);
    expect(resolved?.textures).toEqual(textures);
    expect(resolved?.key).toBe('dedicated:weapon_body.blade.attack1.s');
    expect(resolved?.recipe.phaseLabel).toContain('전용 Atlas');
  });

  it('provides weapon-family joint correction profiles for attack contact frames', () => {
    const blade = resolveWeaponBodyFrameRecipe('blade', 'attack1');
    const heavy = resolveWeaponBodyFrameRecipe('greatblade', 'attack1');
    const lance = resolveWeaponBodyFrameRecipe('riftlance', 'attack1');
    expect(blade.correctionProfile).toBe('blade-hand-tune');
    expect(heavy.correctionProfile).toBe('greatblade-weight-tune');
    expect(lance.correctionProfile).toBe('riftlance-thrust-tune');
    expect(resolveWeaponBodyFrameCorrection(heavy, 2, 'e').rotation).not.toBe(0);
    expect(resolveWeaponBodyFrameCorrection(lance, 2, 'w').offsetX).toBeLessThan(0);
  });

  it('keeps movement and idle on the requested shared pose', () => {
    expect(resolveWeaponBodyFrameRecipe('greatblade', 'idle').sourcePose).toBe('idle');
    expect(resolveWeaponBodyFrameRecipe('riftlance', 'run').loop).toBe(true);
  });
});
