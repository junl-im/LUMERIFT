import { describe, expect, it } from 'vitest';
import { playerActionPhaseFrameV19, playerActionPhaseV19, PLAYER_ACTION_PHASES_V19_SCHEMA } from './PlayerActionPhasesV19';

describe('PlayerActionPhasesV19', () => {
  it('resolves contact, sustain and recover windows', () => {
    expect(PLAYER_ACTION_PHASES_V19_SCHEMA).toBe('lumerift-player-action-phases-v19');
    expect(playerActionPhaseV19(0.1)).toBe('contact');
    expect(playerActionPhaseV19(0.5)).toBe('sustain');
    expect(playerActionPhaseV19(0.9)).toBe('recover');
  });

  it('uses south fallback when a direction is missing', () => {
    const texture = {} as never;
    const sheet = { textures: { 'premium.phase.v19.player.s.attack.sustain': texture } } as never;
    expect(playerActionPhaseFrameV19(sheet, 'nw', 'attacking', 0.5)?.texture).toBe(texture);
  });
});
