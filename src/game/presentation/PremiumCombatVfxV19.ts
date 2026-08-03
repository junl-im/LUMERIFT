import type { Spritesheet, Texture } from 'pixi.js';

export const PREMIUM_COMBAT_VFX_V19_SCHEMA = 'lumerift-premium-combat-vfx-v19' as const;
export type PremiumCombatVfxV19Key = 'slash' | 'hit' | 'nova' | 'explosion' | 'dodge' | 'ultimate';

export function premiumCombatVfxTexturesV19(
  sheet: Spritesheet | undefined,
  key: PremiumCombatVfxV19Key,
): readonly Texture[] | undefined {
  const textures = sheet?.animations[`premium.vfx.v19.${key}`] as Texture[] | undefined;
  return textures && textures.length > 0 ? textures : undefined;
}
