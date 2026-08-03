import type { Spritesheet, Texture } from 'pixi.js';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';
import type { BossCoreState } from './BossCoreLifecycle';

export const PREMIUM_PART_ATLAS_V16_SCHEMA = 'lumerift-premium-part-atlas-v16' as const;

export const PREMIUM_PLAYER_PART_KEYS = {
  hairBack: 'premium.parts.player.hair.back',
  hairFront: 'premium.parts.player.hair.front',
  faceCrest: 'premium.parts.player.face.crest',
  armorShoulders: 'premium.parts.player.armor.shoulders',
  armorChest: 'premium.parts.player.armor.chest',
  capeFabric: 'premium.parts.player.cape.fabric',
  capeEdge: 'premium.parts.player.cape.edge',
  runeCore: 'premium.parts.player.rune.core',
  weaponImpact: 'premium.parts.player.weapon.impact',
  auraBack: 'premium.parts.player.aura.back',
  auraFront: 'premium.parts.player.aura.front',
  auraOverdrive: 'premium.parts.player.aura.overdrive',
  guard: 'premium.parts.player.guard',
} as const;

export const PREMIUM_MONSTER_PART_KEYS = {
  voidCrest: 'premium.parts.monster.void.crest',
  voidCore: 'premium.parts.monster.void.core',
  voidClaw: 'premium.parts.monster.void.claw',
  frostCrest: 'premium.parts.monster.frost.crest',
  frostCore: 'premium.parts.monster.frost.core',
  frostClaw: 'premium.parts.monster.frost.claw',
  infernoCrest: 'premium.parts.monster.inferno.crest',
  infernoCore: 'premium.parts.monster.inferno.core',
  infernoClaw: 'premium.parts.monster.inferno.claw',
  bossCrown: 'premium.parts.monster.boss.crown',
  bossCore: 'premium.parts.monster.boss.core',
  bossClaw: 'premium.parts.monster.boss.claw',
  bossMane: 'premium.parts.monster.boss.mane',
  bossTail: 'premium.parts.monster.boss.tail',
  bossAura: 'premium.parts.monster.boss.aura',
  bossOverdrive: 'premium.parts.monster.boss.overdrive',
} as const;

export interface PremiumMonsterPartTextureSet {
  readonly crest?: Texture;
  readonly core?: Texture;
  readonly claw?: Texture;
  readonly mane?: Texture;
  readonly tail?: Texture;
  readonly aura?: Texture;
  readonly overdrive?: Texture;
}

export function playerPartTexture(sheet: Spritesheet | undefined, key: string): Texture | undefined {
  return sheet?.textures[key];
}

export function playerWeaponPartTexture(
  sheet: Spritesheet | undefined,
  family: WeaponVisualFamily,
): Texture | undefined {
  return sheet?.textures[`premium.parts.player.weapon.${family}`]
    ?? sheet?.textures['premium.parts.player.weapon.blade'];
}

export function monsterPartTextures(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
): PremiumMonsterPartTextureSet {
  if (!sheet) return {};
  if (variant === 'abyssal-harbinger') {
    return {
      crest: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossCrown],
      core: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossCore],
      claw: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossClaw],
      mane: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossMane],
      tail: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossTail],
      aura: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossAura],
      overdrive: sheet.textures[PREMIUM_MONSTER_PART_KEYS.bossOverdrive],
    };
  }
  if (variant === 'lumen-mender') {
    return {
      crest: sheet.textures[PREMIUM_MONSTER_PART_KEYS.frostCrest],
      core: sheet.textures[PREMIUM_MONSTER_PART_KEYS.frostCore],
      claw: sheet.textures[PREMIUM_MONSTER_PART_KEYS.frostClaw],
    };
  }
  if (variant === 'void-warden' || variant === 'elite-generic') {
    return {
      crest: sheet.textures[PREMIUM_MONSTER_PART_KEYS.voidCrest],
      core: sheet.textures[PREMIUM_MONSTER_PART_KEYS.voidCore],
      claw: sheet.textures[PREMIUM_MONSTER_PART_KEYS.voidClaw],
    };
  }
  return {};
}

export function bossCoreFxTexture(
  sheet: Spritesheet | undefined,
  state: BossCoreState,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  if (state === 'shattered') {
    const frame = Math.max(0, Math.min(3, Math.floor(elapsed * 12) % 4));
    return sheet.textures[`premium.core.shatter.${frame}`];
  }
  if (state === 'regenerating') {
    const frame = Math.max(0, Math.min(3, Math.floor(elapsed * 8) % 4));
    return sheet.textures[`premium.core.reform.${frame}`];
  }
  if (state === 'overdrive') {
    const frame = Math.floor(elapsed * 7) % 2;
    return sheet.textures[`premium.core.overdrive.${frame}`];
  }
  if (state === 'fractured') return sheet.textures['premium.core.fractured'];
  return sheet.textures['premium.core.shielded'];
}
