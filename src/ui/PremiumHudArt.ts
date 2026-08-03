import type { Texture } from 'pixi.js';

export const PREMIUM_HUD_ART_SCHEMA = 'lumerift-premium-hud-art-v1' as const;

export const PREMIUM_HUD_TEXTURE_KEYS = {
  hero: 'premium.hud.hero',
  attack: 'premium.hud.attack',
  crash: 'premium.hud.skill.crash',
  nova: 'premium.hud.skill.nova',
  dodge: 'premium.hud.dodge',
  inventory: 'premium.hud.inventory',
  boss: 'premium.hud.boss',
  core: 'premium.hud.core',
} as const;

export type PremiumHudTextureKey = typeof PREMIUM_HUD_TEXTURE_KEYS[keyof typeof PREMIUM_HUD_TEXTURE_KEYS];

export interface PremiumHudTextureSource {
  readonly textures: Readonly<Record<string, Texture>>;
}

export function premiumHudTexture(
  sheet: PremiumHudTextureSource | undefined,
  key: PremiumHudTextureKey,
): Texture | undefined {
  return sheet?.textures[key];
}
