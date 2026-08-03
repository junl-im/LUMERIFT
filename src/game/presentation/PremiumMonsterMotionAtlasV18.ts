import type { Spritesheet, Texture } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';
import { premiumMonsterBodyFamily } from './PremiumMonsterBodyAtlasV17';

export const PREMIUM_MONSTER_MOTION_V18_SCHEMA = 'lumerift-premium-monster-motion-v18' as const;

export type PremiumMonsterMotionActionV18 = 'idle' | 'telegraph' | 'attack' | 'enrage';

export function premiumMonsterMotionActionV18(
  state: MonsterState,
  phase: number,
  variant: PremiumMonsterVariant,
): PremiumMonsterMotionActionV18 {
  if (variant === 'abyssal-harbinger' && phase >= 3) return 'enrage';
  if (state === 'telegraph') return 'telegraph';
  if (state === 'attack' || state === 'hit') return 'attack';
  return 'idle';
}

export function premiumMonsterMotionTextureV18(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
  state: MonsterState,
  phase: number,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const family = premiumMonsterBodyFamily(variant);
  const action = premiumMonsterMotionActionV18(state, phase, variant);
  const rate = action === 'attack' ? 10 : action === 'telegraph' ? 6 : action === 'enrage' ? 8 : 3;
  const frame = Math.floor(Math.max(0, elapsed) * rate) % 2;
  return sheet.textures[`premium.motion.v18.monster.${family}.${action}.${frame}`]
    ?? sheet.textures[`premium.motion.v18.monster.void.${action}.${frame}`];
}
