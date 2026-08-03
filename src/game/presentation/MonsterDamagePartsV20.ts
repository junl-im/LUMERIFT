import type { Spritesheet, Texture } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';
import { premiumMonsterBodyFamily } from './PremiumMonsterBodyAtlasV17';
import { directionFromVector, type DirectionId } from './direction';

export const MONSTER_DAMAGE_PARTS_V20_SCHEMA = 'lumerift-monster-damage-parts-v20' as const;
export type MonsterDamageStateV20 = 'hit' | 'down';

export function monsterDamageStateV20(state: MonsterState, alive: boolean): MonsterDamageStateV20 | undefined {
  if (!alive) return 'down';
  return state === 'hit' ? 'hit' : undefined;
}

export function monsterDamageTextureV20(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
  facingX: number,
  facingY: number,
  state: MonsterState,
  alive: boolean,
  elapsed: number,
): Texture | undefined {
  const damageState = monsterDamageStateV20(state, alive);
  if (!sheet || !damageState) return undefined;
  const family = premiumMonsterBodyFamily(variant);
  const direction: DirectionId = directionFromVector({ x: facingX, y: facingY });
  const frame = Math.floor(Math.max(0, elapsed) * (damageState === 'down' ? 5 : 12)) % 2;
  const key = `premium.damage.v20.monster.${family}.${direction}.${damageState}.${frame}`;
  const fallback = `premium.damage.v20.monster.void.s.${damageState}.${frame}`;
  return sheet.textures[key] ?? sheet.textures[fallback];
}
