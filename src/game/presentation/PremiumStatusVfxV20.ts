import type { Spritesheet, Texture } from 'pixi.js';
import type { StatusEffectId } from '../combat/combatData';

export const PREMIUM_STATUS_VFX_V20_SCHEMA = 'lumerift-status-vfx-v20' as const;
export type PremiumStatusVfxV20Key = 'burn' | 'slow' | 'void' | 'shock' | 'bleed' | 'barrier' | 'haste' | 'weaken';

export function premiumStatusKeyV20(status: StatusEffectId): PremiumStatusVfxV20Key {
  return status === 'burn' ? 'burn' : 'slow';
}

export function premiumStatusVfxTexturesV20(
  sheet: Spritesheet | undefined,
  key: PremiumStatusVfxV20Key,
): readonly Texture[] | undefined {
  const textures = sheet?.animations[`premium.status.v20.${key}`] as Texture[] | undefined;
  return textures && textures.length > 0 ? textures : undefined;
}
