import type { Spritesheet, Texture } from 'pixi.js';
import type { StatusEffectId } from '../combat/combatData';

export const STATUS_LIFECYCLE_V21_SCHEMA = 'lumerift-status-lifecycle-v21' as const;
export type StatusLifecycleEventV21 = 'stack' | 'cleanse' | 'immune';
export type PremiumStatusLifecycleKeyV21 = 'burn' | 'slow' | 'void' | 'shock' | 'bleed' | 'barrier' | 'haste' | 'weaken';

export function premiumStatusLifecycleKeyV21(status: StatusEffectId): PremiumStatusLifecycleKeyV21 {
  return status === 'burn' ? 'burn' : 'slow';
}

export function premiumStatusLifecycleTexturesV21(
  sheet: Spritesheet | undefined,
  status: PremiumStatusLifecycleKeyV21,
  event: StatusLifecycleEventV21,
): readonly Texture[] | undefined {
  const textures = sheet?.animations[`premium.status.v21.${status}.${event}`] as Texture[] | undefined;
  return textures && textures.length > 0 ? textures : undefined;
}
