import { describe, expect, it } from 'vitest';
import { BOSS_CORE_FX_V18_SCHEMA, bossCoreFxTextureV18 } from './BossCoreFxV18';

describe('BossCoreFxV18', () => {
  it('normalizes stable and advances dense loops', () => {
    const stable = { id: 'stable' };
    const breakFrame = { id: 'break' };
    const sheet = { textures: {
      'premium.core.v18.shielded.0': stable,
      'premium.core.v18.shattered.1': breakFrame,
    } } as never;
    expect(BOSS_CORE_FX_V18_SCHEMA).toBe('lumerift-boss-core-fx-v18');
    expect(bossCoreFxTextureV18(sheet, 'stable', 0)).toBe(stable);
    expect(bossCoreFxTextureV18(sheet, 'shattered', 0.08)).toBe(breakFrame);
  });
});
