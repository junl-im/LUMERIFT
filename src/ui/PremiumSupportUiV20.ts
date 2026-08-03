import type { Texture } from 'pixi.js';

export const PREMIUM_SUPPORT_UI_V20_SCHEMA = 'lumerift-premium-support-ui-v20' as const;
export const PREMIUM_SUPPORT_UI_V20_KEYS = {
  mobileVerify: 'premium.ui.v20.mobile-verify', recovery: 'premium.ui.v20.recovery', audit: 'premium.ui.v20.audit',
  cloud: 'premium.ui.v20.cloud', merge: 'premium.ui.v20.merge', undo: 'premium.ui.v20.undo', compare: 'premium.ui.v20.compare',
  search: 'premium.ui.v20.search', pin: 'premium.ui.v20.pin', export: 'premium.ui.v20.export', import: 'premium.ui.v20.import',
  timeline: 'premium.ui.v20.timeline', hash: 'premium.ui.v20.hash', device: 'premium.ui.v20.device', warning: 'premium.ui.v20.warning', approved: 'premium.ui.v20.approved',
} as const;

export interface PremiumSupportUiSourceV20 { readonly textures: Readonly<Record<string, Texture>>; }
export function premiumSupportUiTextureV20(sheet: PremiumSupportUiSourceV20 | undefined, key: string): Texture | undefined { return sheet?.textures[key]; }
