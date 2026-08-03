import { describe, expect, it } from 'vitest';
import { premiumRuneProfile } from './PremiumRuneVfxLanguage';

describe('PremiumRuneVfxLanguage', () => {
  it('scales rune complexity by impact tier', () => {
    expect(premiumRuneProfile('light').spokes).toBe(6);
    expect(premiumRuneProfile('heavy').rings).toBe(2);
    expect(premiumRuneProfile('ultimate').spokes).toBe(12);
  });
});
