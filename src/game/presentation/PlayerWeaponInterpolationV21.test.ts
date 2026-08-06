import { describe, expect, it } from 'vitest';
import { PLAYER_WEAPON_INTERPOLATION_V21_SCHEMA, playerWeaponInterpolationFrameV21 } from './PlayerWeaponInterpolationV21';

describe('PlayerWeaponInterpolationV21', () => {
  it('keeps the v21 schema and eight interpolation frames', () => {
    expect(PLAYER_WEAPON_INTERPOLATION_V21_SCHEMA).toBe('lumerift-player-weapon-interpolation-v21');
    expect(playerWeaponInterpolationFrameV21(undefined, 'blade', 's', 'attacking', 0)?.frame).toBe(0);
    expect(playerWeaponInterpolationFrameV21(undefined, 'blade', 's', 'attacking', 1)?.frame).toBe(7);
    expect(playerWeaponInterpolationFrameV21(undefined, 'blade', 's', 'idle', .5)).toBeUndefined();
  });
});
