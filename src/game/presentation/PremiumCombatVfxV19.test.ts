import { describe, expect, it } from 'vitest';
import { premiumCombatVfxTexturesV19, PREMIUM_COMBAT_VFX_V19_SCHEMA } from './PremiumCombatVfxV19';

describe('PremiumCombatVfxV19', () => {
  it('reads premium animation arrays', () => {
    expect(PREMIUM_COMBAT_VFX_V19_SCHEMA).toBe('lumerift-premium-combat-vfx-v19');
    const texture = {} as never;
    expect(premiumCombatVfxTexturesV19({ animations: { 'premium.vfx.v19.ultimate': [texture] } } as never, 'ultimate')).toEqual([texture]);
  });
});
