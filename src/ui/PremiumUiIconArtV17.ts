import type { Texture } from 'pixi.js';

export const PREMIUM_UI_ICON_V17_SCHEMA = 'lumerift-premium-ui-icon-v17' as const;

export const PREMIUM_UI_ICON_V17_KEYS = {
  wardrobe: 'premium.ui.v17.wardrobe',
  compare: 'premium.ui.v17.compare',
  preset: 'premium.ui.v17.preset',
  cloud: 'premium.ui.v17.cloud',
  recovery: 'premium.ui.v17.recovery',
  audit: 'premium.ui.v17.audit',
  search: 'premium.ui.v17.search',
  lock: 'premium.ui.v17.lock',
  health: 'premium.ui.v17.health',
  shield: 'premium.ui.v17.shield',
  haste: 'premium.ui.v17.haste',
  power: 'premium.ui.v17.power',
  quest: 'premium.ui.v17.quest',
  mail: 'premium.ui.v17.mail',
  ranking: 'premium.ui.v17.ranking',
  guild: 'premium.ui.v17.guild',
  skillCard: 'premium.ui.v17.skillcard',
  equipment: 'premium.ui.v17.equipment',
  bossWarning: 'premium.ui.v17.bosswarn',
  core: 'premium.ui.v17.core',
  android: 'premium.ui.v17.android',
  ios: 'premium.ui.v17.ios',
  timeline: 'premium.ui.v17.timeline',
  merge: 'premium.ui.v17.merge',
} as const;

export interface PremiumUiTextureSourceV17 {
  readonly textures: Readonly<Record<string, Texture>>;
}

export function premiumUiV17Texture(
  sheet: PremiumUiTextureSourceV17 | undefined,
  key: string,
): Texture | undefined {
  return sheet?.textures[key];
}
