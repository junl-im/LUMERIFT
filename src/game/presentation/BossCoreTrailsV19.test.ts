import { describe, expect, it } from 'vitest';
import { bossCoreTrailTextureV19, BOSS_CORE_TRAILS_V19_SCHEMA } from './BossCoreTrailsV19';

describe('BossCoreTrailsV19', () => {
  it('normalizes stable and advances continuous trails', () => {
    expect(BOSS_CORE_TRAILS_V19_SCHEMA).toBe('lumerift-boss-core-trails-v19');
    const stable = {} as never;
    const broken = {} as never;
    const sheet = { textures: {
      'premium.core.v19.shielded.0': stable,
      'premium.core.v19.shattered.1': broken,
    } } as never;
    expect(bossCoreTrailTextureV19(sheet, 'stable', 0)).toBe(stable);
    expect(bossCoreTrailTextureV19(sheet, 'shattered', 0.06)).toBe(broken);
  });
});
