import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumMonsterVariant } from './PremiumMonsterVariantProfile';

export const PREMIUM_MONSTER_BODY_V17_SCHEMA = 'lumerift-premium-monster-body-v17' as const;

export interface PremiumMonsterBodyTextureSetV17 {
  readonly headplate?: Texture;
  readonly torso?: Texture;
  readonly forelegs?: Texture;
  readonly hindlegs?: Texture;
  readonly dorsal?: Texture;
  readonly tailtip?: Texture;
}

export function premiumMonsterBodyFamily(variant: PremiumMonsterVariant): 'void' | 'frost' | 'inferno' | 'boss' {
  if (variant === 'abyssal-harbinger') return 'boss';
  if (variant === 'lumen-mender') return 'frost';
  if (variant === 'elite-generic') return 'inferno';
  return 'void';
}

export function monsterBodyTexturesV17(
  sheet: Spritesheet | undefined,
  variant: PremiumMonsterVariant,
): PremiumMonsterBodyTextureSetV17 {
  if (!sheet) return {};
  const family = premiumMonsterBodyFamily(variant);
  const texture = (part: string): Texture | undefined => sheet.textures[`premium.body.v17.monster.${family}.${part}`];
  return {
    headplate: texture('headplate'),
    torso: texture('torso'),
    forelegs: texture('forelegs'),
    hindlegs: texture('hindlegs'),
    dorsal: texture('dorsal'),
    tailtip: texture('tailtip'),
  };
}
