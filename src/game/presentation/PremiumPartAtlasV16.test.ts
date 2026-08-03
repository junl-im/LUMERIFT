import { describe, expect, it } from 'vitest';
import { bossCoreFxTexture, PREMIUM_PART_ATLAS_V16_SCHEMA } from './PremiumPartAtlasV16';

describe('PremiumPartAtlasV16', () => {
  it('keeps the release schema stable', () => {
    expect(PREMIUM_PART_ATLAS_V16_SCHEMA).toBe('lumerift-premium-part-atlas-v16');
  });

  it('selects deterministic boss core animation frames', () => {
    const sheet = { textures: {
      'premium.core.shatter.0': { id: 's0' },
      'premium.core.shatter.1': { id: 's1' },
    } } as never;
    expect(bossCoreFxTexture(sheet, 'shattered', 0)).toEqual({ id: 's0' });
  });
});
