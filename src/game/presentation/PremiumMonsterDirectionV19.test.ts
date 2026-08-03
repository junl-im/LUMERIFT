import { describe, expect, it } from 'vitest';
import { premiumMonsterDirectionTextureV19, premiumMonsterDirectionV19, premiumMonsterPhaseV19 } from './PremiumMonsterDirectionV19';

describe('PremiumMonsterDirectionV19', () => {
  it('classifies four presentation directions', () => {
    expect(premiumMonsterDirectionV19(1, 0)).toBe('side');
    expect(premiumMonsterDirectionV19(0, 1)).toBe('front');
    expect(premiumMonsterDirectionV19(0, -1)).toBe('back');
    expect(premiumMonsterDirectionV19(0.7, 0.7)).toBe('three-quarter');
  });

  it('maps combat state and resolves texture', () => {
    expect(premiumMonsterPhaseV19('attack')).toBe('impact');
    const texture = {} as never;
    const sheet = { textures: { 'premium.limb.v19.monster.boss.front.impact': texture } } as never;
    expect(premiumMonsterDirectionTextureV19(sheet, 'abyssal-harbinger', 0, 1, 'attack')).toBe(texture);
  });
});
