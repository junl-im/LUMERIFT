import type { Texture } from 'pixi.js';

export const PREMIUM_SUPPORT_UI_V21_SCHEMA = 'lumerift-premium-support-ui-v21' as const;
export const PREMIUM_SUPPORT_UI_V21_KEYS = {
  stack: 'premium.ui.v21.stack', cleanse: 'premium.ui.v21.cleanse', immune: 'premium.ui.v21.immune',
  statusHud: 'premium.ui.v21.status-hud', interpolate: 'premium.ui.v21.interpolate', combo: 'premium.ui.v21.combo',
  stagger: 'premium.ui.v21.stagger', rise: 'premium.ui.v21.rise', recover: 'premium.ui.v21.recover',
  evidence: 'premium.ui.v21.evidence', capture: 'premium.ui.v21.capture', auditFilter: 'premium.ui.v21.audit-filter',
  timeline: 'premium.ui.v21.timeline', diff: 'premium.ui.v21.diff', restore: 'premium.ui.v21.restore', verified: 'premium.ui.v21.verified',
} as const;

export interface PremiumSupportUiSourceV21 { readonly textures: Readonly<Record<string, Texture>>; }
export function premiumSupportUiTextureV21(sheet: PremiumSupportUiSourceV21 | undefined, key: string): Texture | undefined { return sheet?.textures[key]; }
