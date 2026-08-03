import { describe, expect, it } from 'vitest';
import {
  PREMIUM_CHARACTER_RUNTIME_SCHEMA,
  premiumCharacterActionWeight,
  premiumWeaponSilhouetteProfile,
  resolvePremiumCharacterRuntimeTuning,
} from './PremiumCharacterRuntimeV14';

describe('PremiumCharacterRuntimeV14', () => {
  it('keeps three clearly separated weapon silhouettes', () => {
    expect(PREMIUM_CHARACTER_RUNTIME_SCHEMA).toBe('lumerift-premium-character-runtime-v2');
    expect(premiumWeaponSilhouetteProfile('greatblade').bladeWidth).toBeGreaterThan(8);
    expect(premiumWeaponSilhouetteProfile('riftlance').thrustBias).toBeGreaterThan(0.8);
    expect(premiumWeaponSilhouetteProfile('blade').echoCount).toBe(2);
  });

  it('raises action weight without changing combat values', () => {
    expect(premiumCharacterActionWeight('attacking', 0.5, 3)).toBeGreaterThan(1);
    expect(resolvePremiumCharacterRuntimeTuning({ armorSilhouette: 'royal', capeStyle: 'banner', auraStrength: 1.2 }).capeLength).toBe(1.2);
  });
});
