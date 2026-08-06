import { describe, expect, it } from 'vitest';
import { PREMIUM_SUPPORT_UI_V21_KEYS, PREMIUM_SUPPORT_UI_V21_SCHEMA } from './PremiumSupportUiV21';

describe('PremiumSupportUiV21', () => {
  it('keeps the v21 support UI schema and verification icons', () => {
    expect(PREMIUM_SUPPORT_UI_V21_SCHEMA).toBe('lumerift-premium-support-ui-v21');
    expect(PREMIUM_SUPPORT_UI_V21_KEYS.verified).toBe('premium.ui.v21.verified');
  });
});
