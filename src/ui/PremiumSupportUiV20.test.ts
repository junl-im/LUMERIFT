import { describe, expect, it } from 'vitest';
import { PREMIUM_SUPPORT_UI_V20_KEYS, PREMIUM_SUPPORT_UI_V20_SCHEMA, premiumSupportUiTextureV20 } from './PremiumSupportUiV20';

describe('PremiumSupportUiV20', () => {
  it('exposes support-screen icons', () => {
    expect(PREMIUM_SUPPORT_UI_V20_SCHEMA).toBe('lumerift-premium-support-ui-v20');
    const texture = {} as never;
    expect(premiumSupportUiTextureV20({ textures: { [PREMIUM_SUPPORT_UI_V20_KEYS.audit]: texture } }, PREMIUM_SUPPORT_UI_V20_KEYS.audit)).toBe(texture);
  });
});
