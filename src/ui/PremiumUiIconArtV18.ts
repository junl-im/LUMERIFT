import type { Texture } from 'pixi.js';

export const PREMIUM_UI_ICON_V18_SCHEMA = 'lumerift-premium-ui-icon-v18' as const;

export const PREMIUM_UI_ICON_V18_KEYS = {
  combat: 'premium.ui.v18.combat',
  dodge: 'premium.ui.v18.dodge',
  ultimate: 'premium.ui.v18.ultimate',
  bossPhase: 'premium.ui.v18.bossPhase',
  coreBreak: 'premium.ui.v18.coreBreak',
  coreRegen: 'premium.ui.v18.coreRegen',
  eliteVoid: 'premium.ui.v18.eliteVoid',
  eliteFrost: 'premium.ui.v18.eliteFrost',
  eliteInferno: 'premium.ui.v18.eliteInferno',
  wardrobeAction: 'premium.ui.v18.wardrobeAction',
  appearanceLayer: 'premium.ui.v18.appearanceLayer',
  mobileQa: 'premium.ui.v18.mobileQa',
  performance: 'premium.ui.v18.performance',
  assetQuality: 'premium.ui.v18.assetQuality',
  recoveryDiff: 'premium.ui.v18.recoveryDiff',
  buildVerify: 'premium.ui.v18.buildVerify',
} as const;

export interface PremiumUiTextureSourceV18 {
  readonly textures: Readonly<Record<string, Texture>>;
}

export function premiumUiV18Texture(
  sheet: PremiumUiTextureSourceV18 | undefined,
  key: string,
): Texture | undefined {
  return sheet?.textures[key];
}
