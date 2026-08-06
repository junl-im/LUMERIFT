import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';
import { premiumMonsterBodyFamily } from './PremiumMonsterBodyAtlasV17';
import { directionFromVector, type DirectionId } from './direction';

export const MONSTER_RECOVERY_PARTS_V21_SCHEMA = 'lumerift-monster-recovery-parts-v21' as const;
export type MonsterRecoveryStateV21 = 'stagger' | 'rise' | 'recover';

export function monsterRecoveryTextureV21(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
  facingX: number,
  facingY: number,
  state: MonsterRecoveryStateV21,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const family = premiumMonsterBodyFamily(variant);
  const direction: DirectionId = directionFromVector({ x: facingX, y: facingY });
  const frame = Math.floor(Math.max(0, elapsed) * (state === 'stagger' ? 14 : state === 'rise' ? 9 : 7)) % 2;
  const key = `premium.recovery.v21.monster.${family}.${direction}.${state}.${frame}`;
  const fallback = `premium.recovery.v21.monster.void.s.${state}.${frame}`;
  return sheet.textures[key] ?? sheet.textures[fallback];
}
