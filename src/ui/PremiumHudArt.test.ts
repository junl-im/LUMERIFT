import { describe, expect, it } from 'vitest';
import { PREMIUM_HUD_ART_SCHEMA, PREMIUM_HUD_TEXTURE_KEYS } from './PremiumHudArt';

describe('PremiumHudArt', () => {
  it('publishes eight approved-reference-derived UI cells', () => {
    expect(PREMIUM_HUD_ART_SCHEMA).toBe('lumerift-premium-hud-art-v1');
    expect(new Set(Object.values(PREMIUM_HUD_TEXTURE_KEYS)).size).toBe(8);
  });
});
