import { describe, expect, it } from 'vitest';
import {
  PREMIUM_CHARACTER_DIRECTIONS,
  PREMIUM_CHARACTER_LAYER_ORDER,
  premiumCharacterProductionTotals,
} from './PremiumCharacterProductionSpec';

describe('PremiumCharacterProductionSpec', () => {
  it('keeps eight directions and all six production layers', () => {
    expect(PREMIUM_CHARACTER_DIRECTIONS).toHaveLength(8);
    expect(PREMIUM_CHARACTER_LAYER_ORDER).toEqual(['cape', 'body', 'armor', 'face', 'weapon', 'rune']);
  });

  it('plans three weapon families without entering the initial bundle', () => {
    const totals = premiumCharacterProductionTotals();
    expect(totals.weaponFamilies).toBe(3);
    expect(totals.bodyFrames).toBe(1752);
    expect(totals.layeredFramePlacements).toBe(10512);
  });
});
