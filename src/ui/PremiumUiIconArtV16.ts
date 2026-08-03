import type { Texture } from 'pixi.js';
import type { ItemGrade } from '../game/items/itemTypes';

export const PREMIUM_UI_ICON_V16_SCHEMA = 'lumerift-premium-ui-icon-v16' as const;

export const PREMIUM_UI_ICON_KEYS = {
  skillAttack: 'premium.ui.v16.skill.attack',
  skillCrash: 'premium.ui.v16.skill.crash',
  skillNova: 'premium.ui.v16.skill.nova',
  gradeCommon: 'premium.ui.v16.common',
  gradeRare: 'premium.ui.v16.rare',
  gradeEpic: 'premium.ui.v16.epic',
  gradeLegendary: 'premium.ui.v16.legendary',
  patternSlash: 'premium.ui.v16.slash',
  patternCharge: 'premium.ui.v16.charge',
  patternBurst: 'premium.ui.v16.burst',
  patternSummon: 'premium.ui.v16.summon',
  patternCoreBreak: 'premium.ui.v16.corebreak',
  equipmentWeapon: 'premium.ui.v16.weapon',
  equipmentArmor: 'premium.ui.v16.armor',
  equipmentAccessory: 'premium.ui.v16.accessory',
  bossPhase: 'premium.ui.v16.phase',
} as const;

export interface PremiumUiTextureSourceV16 {
  readonly textures: Readonly<Record<string, Texture>>;
}

export function premiumUiV16Texture(
  sheet: PremiumUiTextureSourceV16 | undefined,
  key: string,
): Texture | undefined {
  return sheet?.textures[key];
}

export function premiumGradeTextureKey(grade: ItemGrade): string {
  switch (grade) {
    case 'heroic': return PREMIUM_UI_ICON_KEYS.gradeLegendary;
    case 'rare': return PREMIUM_UI_ICON_KEYS.gradeRare;
    default: return PREMIUM_UI_ICON_KEYS.gradeCommon;
  }
}

export function premiumBossPatternTextureKey(patternId: string | undefined, shape?: string): string {
  const normalized = `${patternId ?? ''}:${shape ?? ''}`.toLowerCase();
  if (normalized.includes('nova') || normalized.includes('burst') || normalized.includes('circle')) {
    return PREMIUM_UI_ICON_KEYS.patternBurst;
  }
  if (normalized.includes('summon') || normalized.includes('rift')) {
    return PREMIUM_UI_ICON_KEYS.patternSummon;
  }
  if (normalized.includes('rupture') || normalized.includes('core')) {
    return PREMIUM_UI_ICON_KEYS.patternCoreBreak;
  }
  if (normalized.includes('charge') || normalized.includes('line')) {
    return PREMIUM_UI_ICON_KEYS.patternCharge;
  }
  return PREMIUM_UI_ICON_KEYS.patternSlash;
}
