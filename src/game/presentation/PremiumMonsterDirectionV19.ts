import type { Spritesheet, Texture } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';
import { premiumMonsterBodyFamily } from './PremiumMonsterBodyAtlasV17';

export const PREMIUM_MONSTER_DIRECTION_V19_SCHEMA = 'lumerift-premium-monster-direction-v19' as const;

export type PremiumMonsterDirectionV19 = 'front' | 'side' | 'back' | 'three-quarter';
export type PremiumMonsterPhaseV19 = 'telegraph' | 'impact' | 'recover';

export function premiumMonsterDirectionV19(facingX: number, facingY: number): PremiumMonsterDirectionV19 {
  const ax = Math.abs(facingX);
  const ay = Math.abs(facingY);
  if (ax > ay * 1.35) return 'side';
  if (ay > ax * 1.35) return facingY >= 0 ? 'front' : 'back';
  return 'three-quarter';
}

export function premiumMonsterPhaseV19(state: MonsterState): PremiumMonsterPhaseV19 {
  if (state === 'telegraph') return 'telegraph';
  if (state === 'attack' || state === 'hit') return 'impact';
  return 'recover';
}

export function premiumMonsterDirectionTextureV19(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
  facingX: number,
  facingY: number,
  state: MonsterState,
): Texture | undefined {
  if (!sheet) return undefined;
  const family = premiumMonsterBodyFamily(variant);
  const direction = premiumMonsterDirectionV19(facingX, facingY);
  const phase = premiumMonsterPhaseV19(state);
  const key = `premium.limb.v19.monster.${family}.${direction}.${phase}`;
  const fallback = `premium.limb.v19.monster.void.${direction}.${phase}`;
  return sheet.textures[key] ?? sheet.textures[fallback];
}
