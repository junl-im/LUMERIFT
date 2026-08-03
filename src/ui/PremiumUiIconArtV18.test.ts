import { describe, expect, it } from 'vitest';
import { PREMIUM_UI_ICON_V18_KEYS, PREMIUM_UI_ICON_V18_SCHEMA, premiumUiV18Texture } from './PremiumUiIconArtV18';

describe('PremiumUiIconArtV18', () => {
  it('reads expanded runtime icon', () => {
    const icon = { id: 'qa' };
    expect(PREMIUM_UI_ICON_V18_SCHEMA).toBe('lumerift-premium-ui-icon-v18');
    expect(premiumUiV18Texture({ textures: { [PREMIUM_UI_ICON_V18_KEYS.mobileQa]: icon } } as never, PREMIUM_UI_ICON_V18_KEYS.mobileQa)).toBe(icon);
  });
});
