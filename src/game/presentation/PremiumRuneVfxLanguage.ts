import type { Graphics } from 'pixi.js';
import type { CombatImpactTier } from '../combat/combatData';

export const PREMIUM_RUNE_VFX_SCHEMA = 'lumerift-premium-rune-vfx-v1' as const;

export type PremiumRuneGlyph = 'lumen-orbit' | 'rift-crown' | 'core-hex' | 'impact-star';

export interface PremiumRuneVfxProfile {
  readonly glyph: PremiumRuneGlyph;
  readonly spokes: number;
  readonly rings: number;
  readonly rotationSpeed: number;
  readonly secondaryAlpha: number;
}

export function premiumRuneProfile(tier: CombatImpactTier): PremiumRuneVfxProfile {
  if (tier === 'ultimate') {
    return { glyph: 'rift-crown', spokes: 12, rings: 3, rotationSpeed: 1.35, secondaryAlpha: 0.54 };
  }
  if (tier === 'heavy') {
    return { glyph: 'core-hex', spokes: 8, rings: 2, rotationSpeed: 0.92, secondaryAlpha: 0.42 };
  }
  return { glyph: 'impact-star', spokes: 6, rings: 1, rotationSpeed: 0.65, secondaryAlpha: 0.32 };
}

export function drawPremiumRuneGlyph(
  graphics: Graphics,
  profile: PremiumRuneVfxProfile,
  radius: number,
  progress: number,
  color: number,
  alpha: number,
): void {
  const rotation = progress * Math.PI * 2 * profile.rotationSpeed;
  for (let ring = 0; ring < profile.rings; ring += 1) {
    const ringRadius = radius * (0.46 + ring * 0.2 + progress * 0.08);
    graphics.circle(0, 0, ringRadius).stroke({
      color: ring === 0 ? 0xffffff : color,
      alpha: alpha * (ring === 0 ? 0.34 : profile.secondaryAlpha - ring * 0.08),
      width: ring === 0 ? 1.4 : 2.2,
    });
  }

  for (let index = 0; index < profile.spokes; index += 1) {
    const angle = rotation + (Math.PI * 2 * index) / profile.spokes;
    const alternating = index % 2 === 0;
    const inner = radius * (alternating ? 0.3 : 0.46);
    const outer = radius * (alternating ? 0.92 : 0.74);
    const tip = radius * (alternating ? 1.08 : 0.88);
    graphics
      .moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
      .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
      .lineTo(Math.cos(angle + 0.055) * tip, Math.sin(angle + 0.055) * tip)
      .stroke({ color: alternating ? color : 0xffffff, alpha: alpha * (alternating ? 0.5 : 0.28), width: alternating ? 2.6 : 1.4 });
  }

  if (profile.glyph === 'core-hex' || profile.glyph === 'rift-crown') {
    const sides = profile.glyph === 'rift-crown' ? 8 : 6;
    for (let index = 0; index < sides; index += 1) {
      const a = rotation * -0.45 + (Math.PI * 2 * index) / sides;
      const b = rotation * -0.45 + (Math.PI * 2 * (index + 1)) / sides;
      graphics
        .moveTo(Math.cos(a) * radius * 0.34, Math.sin(a) * radius * 0.34)
        .lineTo(Math.cos(b) * radius * 0.34, Math.sin(b) * radius * 0.34)
        .stroke({ color: 0xffffff, alpha: alpha * 0.48, width: 1.6 });
    }
  }
}

export interface PremiumRuneSparkFieldOptions {
  readonly count: number;
  readonly spread: number;
  readonly length: number;
  readonly width: number;
}

export function premiumRuneSparkField(tier: CombatImpactTier): PremiumRuneSparkFieldOptions {
  if (tier === 'ultimate') return { count: 12, spread: 1.18, length: 1.22, width: 3.2 };
  if (tier === 'heavy') return { count: 8, spread: 0.96, length: 1, width: 2.6 };
  return { count: 5, spread: 0.72, length: 0.78, width: 1.8 };
}

export function drawPremiumRuneSparkField(
  graphics: Graphics,
  tier: CombatImpactTier,
  radius: number,
  progress: number,
  color: number,
  alpha: number,
): void {
  const field = premiumRuneSparkField(tier);
  const expansion = 0.72 + progress * 0.58;
  for (let index = 0; index < field.count; index += 1) {
    const seed = (index * 2.399963229728653 + progress * field.spread) % (Math.PI * 2);
    const alternating = index % 3;
    const inner = radius * expansion * (0.34 + alternating * 0.08);
    const outer = inner + radius * field.length * (0.22 + (index % 2) * 0.09);
    const bend = seed + (index % 2 === 0 ? 0.045 : -0.045) * (1 - progress);
    graphics
      .moveTo(Math.cos(seed) * inner, Math.sin(seed) * inner)
      .lineTo(Math.cos(bend) * outer, Math.sin(bend) * outer)
      .stroke({
        color: alternating === 0 ? 0xffffff : color,
        alpha: alpha * (alternating === 0 ? 0.52 : 0.34),
        width: alternating === 0 ? field.width * 0.62 : field.width,
      });
  }
}
