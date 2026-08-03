import { describe, expect, it } from 'vitest';
import {
  PREMIUM_ART_DIRECTION_SCHEMA,
  evaluatePremiumArtQuality,
  premiumArtProfile,
} from './PremiumArtDirection';

describe('PremiumArtDirection', () => {
  it('keeps the approved visual direction contract and all domains', () => {
    expect(PREMIUM_ART_DIRECTION_SCHEMA).toBe('lumerift-premium-art-direction-v2');
    expect(premiumArtProfile('character').requiredTraits).toContain('8방향 실루엣');
    expect(premiumArtProfile('monster').requiredTraits).toContain('공격 전조');
    expect(premiumArtProfile('ui').mobileReadabilityPriority).toBeGreaterThan(0.3);
    expect(premiumArtProfile('skill-vfx').effectPriority).toBeGreaterThan(0.3);
  });

  it('requires both premium score and mobile readability', () => {
    const approved = evaluatePremiumArtQuality('character', {
      silhouette: 96,
      materials: 94,
      lighting: 92,
      effects: 90,
      mobileReadability: 94,
    });
    expect(approved.passed).toBe(true);
    expect(approved.score).toBeGreaterThanOrEqual(approved.targetQuality);

    const unreadable = evaluatePremiumArtQuality('monster', {
      silhouette: 99,
      materials: 99,
      lighting: 99,
      effects: 99,
      mobileReadability: 70,
    });
    expect(unreadable.passed).toBe(false);
    expect(unreadable.weakestDimension).toBe('mobileReadability');
  });
});
