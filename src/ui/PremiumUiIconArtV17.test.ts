import { describe, expect, it } from 'vitest';
import { PREMIUM_UI_ICON_V17_KEYS, PREMIUM_UI_ICON_V17_SCHEMA, premiumUiV17Texture } from './PremiumUiIconArtV17';

describe('PremiumUiIconArtV17', () => {
  it('publishes the expanded 24-icon contract', () => {
    expect(PREMIUM_UI_ICON_V17_SCHEMA).toBe('lumerift-premium-ui-icon-v17');
    expect(Object.keys(PREMIUM_UI_ICON_V17_KEYS)).toHaveLength(24);
  });

  it('returns a requested raster texture', () => {
    const icon = { id: 'merge' };
    expect(premiumUiV17Texture({ textures: { [PREMIUM_UI_ICON_V17_KEYS.merge]: icon } } as never, PREMIUM_UI_ICON_V17_KEYS.merge)).toBe(icon);
  });
});
