import { describe, expect, it } from 'vitest';
import { resolveDirectionalWeaponTrail, resolveDirectionalWeaponTrailFromAngle } from './DirectionalWeaponTrail';

describe('DirectionalWeaponTrail', () => {
  it('gives horizontal attacks a longer trail than vertical attacks', () => {
    expect(resolveDirectionalWeaponTrail('e').lengthMultiplier).toBeGreaterThan(resolveDirectionalWeaponTrail('n').lengthMultiplier);
  });

  it('maps a downward angle to the south profile', () => {
    expect(resolveDirectionalWeaponTrailFromAngle(Math.PI / 2).direction).toBe('s');
  });
});
