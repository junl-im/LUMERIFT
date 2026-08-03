import { describe, expect, it } from 'vitest';
import { PREMIUM_STATUS_VFX_V20_SCHEMA, premiumStatusKeyV20 } from './PremiumStatusVfxV20';

describe('PremiumStatusVfxV20', () => {
  it('maps live status IDs while reserving future variants', () => {
    expect(PREMIUM_STATUS_VFX_V20_SCHEMA).toBe('lumerift-status-vfx-v20');
    expect(premiumStatusKeyV20('burn')).toBe('burn');
    expect(premiumStatusKeyV20('slow')).toBe('slow');
  });
});
