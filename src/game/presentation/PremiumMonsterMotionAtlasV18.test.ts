import { describe, expect, it } from 'vitest';
import { PREMIUM_MONSTER_MOTION_V18_SCHEMA, premiumMonsterMotionActionV18, premiumMonsterMotionTextureV18 } from './PremiumMonsterMotionAtlasV18';

describe('PremiumMonsterMotionAtlasV18', () => {
  it('resolves attack and boss enrage actions', () => {
    expect(PREMIUM_MONSTER_MOTION_V18_SCHEMA).toBe('lumerift-premium-monster-motion-v18');
    expect(premiumMonsterMotionActionV18('telegraph', 1, 'void-warden')).toBe('telegraph');
    expect(premiumMonsterMotionActionV18('attack', 1, 'lumen-mender')).toBe('attack');
    expect(premiumMonsterMotionActionV18('idle', 3, 'abyssal-harbinger')).toBe('enrage');
  });

  it('reads phase animated texture', () => {
    const texture = { id: 'boss' };
    const sheet = { textures: { 'premium.motion.v18.monster.boss.enrage.1': texture } } as never;
    expect(premiumMonsterMotionTextureV18(sheet, 'abyssal-harbinger', 'idle', 3, 0.2)).toBe(texture);
  });
});
