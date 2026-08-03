import { describe, expect, it } from 'vitest';
import { PLAYER_ACTION_PARTS_V18_SCHEMA, playerActionKindV18, playerActionPartFrameV18 } from './PlayerActionPartsV18';

describe('PlayerActionPartsV18', () => {
  it('maps runtime states to action families', () => {
    expect(PLAYER_ACTION_PARTS_V18_SCHEMA).toBe('lumerift-player-action-parts-v18');
    expect(playerActionKindV18('attacking')).toBe('attack');
    expect(playerActionKindV18('dodging')).toBe('dodge');
    expect(playerActionKindV18('skill')).toBe('skill');
    expect(playerActionKindV18('idle')).toBeUndefined();
  });

  it('selects direction and phase with south fallback', () => {
    const east = { id: 'east' };
    const south = { id: 'south' };
    const sheet = { textures: {
      'premium.action.v18.player.e.attack.1': east,
      'premium.action.v18.player.s.attack.1': south,
    } } as never;
    expect(playerActionPartFrameV18(sheet, 'e', 'attacking', 0.8)?.texture).toBe(east);
    expect(playerActionPartFrameV18(sheet, 'nw', 'attacking', 0.8)?.texture).toBe(south);
  });
});
