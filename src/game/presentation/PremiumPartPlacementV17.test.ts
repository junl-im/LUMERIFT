import { describe, expect, it } from 'vitest';
import {
  playerDirectionalPartTexture,
  PREMIUM_PART_PLACEMENT_V17_SCHEMA,
  resolvePremiumAttackPlacement,
  resolvePremiumDirectionPlacement,
} from './PremiumPartPlacementV17';

describe('PremiumPartPlacementV17', () => {
  it('keeps the schema and eight-direction occlusion deterministic', () => {
    expect(PREMIUM_PART_PLACEMENT_V17_SCHEMA).toBe('lumerift-premium-part-placement-v17');
    expect(resolvePremiumDirectionPlacement(0, -1).weaponDepth).toBe('back');
    expect(resolvePremiumDirectionPlacement(-1, 0).mirror).toBe(true);
    expect(resolvePremiumDirectionPlacement(0, 1).faceAlpha).toBe(1);
  });

  it('falls back to the south directional texture', () => {
    const texture = { id: 'south-hair' };
    const sheet = { textures: { 'premium.pose.v17.player.s.hair': texture } } as never;
    expect(playerDirectionalPartTexture(sheet, 'ne', 'hair')).toBe(texture);
  });

  it('keeps weapon families visibly separated without changing combat data', () => {
    const sword = resolvePremiumAttackPlacement('blade', 'attacking', 0.5, 1, 'e');
    const greatblade = resolvePremiumAttackPlacement('greatblade', 'attacking', 0.5, 1, 'e');
    const lance = resolvePremiumAttackPlacement('riftlance', 'attacking', 0.5, 1, 'e');
    expect(greatblade.impactScale).toBeGreaterThan(sword.impactScale);
    expect(lance.weaponOffsetX).toBeGreaterThan(greatblade.weaponOffsetX);
  });
});
