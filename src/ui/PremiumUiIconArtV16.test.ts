import { describe, expect, it } from 'vitest';
import { premiumBossPatternTextureKey, premiumGradeTextureKey, PREMIUM_UI_ICON_KEYS } from './PremiumUiIconArtV16';

describe('PremiumUiIconArtV16', () => {
  it('maps grades to dedicated raster icons', () => {
    expect(premiumGradeTextureKey('heroic')).toBe(PREMIUM_UI_ICON_KEYS.gradeLegendary);
    expect(premiumGradeTextureKey('common')).toBe(PREMIUM_UI_ICON_KEYS.gradeCommon);
  });

  it('maps boss patterns without changing combat data', () => {
    expect(premiumBossPatternTextureKey('boss_nova', 'circle')).toBe(PREMIUM_UI_ICON_KEYS.patternBurst);
    expect(premiumBossPatternTextureKey('boss_charge', 'line')).toBe(PREMIUM_UI_ICON_KEYS.patternCharge);
  });
});
