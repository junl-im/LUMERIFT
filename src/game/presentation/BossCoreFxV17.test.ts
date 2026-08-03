import { describe, expect, it } from 'vitest';
import { bossCoreFxTextureV17, BOSS_CORE_FX_V17_SCHEMA } from './BossCoreFxV17';

describe('BossCoreFxV17', () => {
  it('maps stable to the shielded visual and keeps frame selection deterministic', () => {
    expect(BOSS_CORE_FX_V17_SCHEMA).toBe('lumerift-boss-core-fx-v17');
    const sheet = { textures: {
      'premium.core.v17.shielded.0': { id: 'shield-0' },
      'premium.core.v17.shattered.1': { id: 'break-1' },
    } } as never;
    expect(bossCoreFxTextureV17(sheet, 'stable', 0)).toEqual({ id: 'shield-0' });
    expect(bossCoreFxTextureV17(sheet, 'shattered', 0.08)).toEqual({ id: 'break-1' });
  });
});
