import { describe, expect, it } from 'vitest';
import { PLAYER_WEAPON_PHASES_V20_SCHEMA, playerWeaponPhaseV20, playerWeaponPhaseFrameV20 } from './PlayerWeaponPhasesV20';

describe('PlayerWeaponPhasesV20', () => {
  it('resolves five interpolation phases', () => {
    expect(PLAYER_WEAPON_PHASES_V20_SCHEMA).toBe('lumerift-player-weapon-phases-v20');
    expect([0, .2, .45, .7, .95].map(playerWeaponPhaseV20)).toEqual(['anticipation','contact','sustain','recover','follow-through']);
  });
  it('keeps non-attack states on the v19 fallback path', () => {
    expect(playerWeaponPhaseFrameV20(undefined, 'blade', 's', 'idle', .5)).toBeUndefined();
  });
});
