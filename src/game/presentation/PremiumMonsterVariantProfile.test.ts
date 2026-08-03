import { describe, expect, it } from 'vitest';
import { PREMIUM_MONSTER_VARIANT_SCHEMA, resolvePremiumMonsterVariant } from './PremiumMonsterVariantProfile';

const visual = { bodyColor: 0x101020, accentColor: 0x8040ff, eyeColor: 0xffffff } as const;

describe('PremiumMonsterVariantProfile', () => {
  it('separates elite and boss silhouettes', () => {
    expect(PREMIUM_MONSTER_VARIANT_SCHEMA).toBe('lumerift-premium-monster-runtime-v2');
    expect(resolvePremiumMonsterVariant('monster_warden', 'elite', visual).variant).toBe('void-warden');
    expect(resolvePremiumMonsterVariant('monster_mender', 'elite', visual).variant).toBe('lumen-mender');
    expect(resolvePremiumMonsterVariant('boss_harbinger', 'boss', visual).phaseShards).toBe(10);
  });
});
