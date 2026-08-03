import type { Spritesheet, Texture } from 'pixi.js';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { PremiumCharacterRuntimeState } from './PremiumCharacterRuntimeV14';
import { directionFromVector, type DirectionId } from './direction';

export const PREMIUM_PART_PLACEMENT_V17_SCHEMA = 'lumerift-premium-part-placement-v17' as const;

export type PremiumDirectionalPlayerPart = 'hair' | 'armor' | 'cape' | 'face';
export type PremiumPartDepth = 'back' | 'front';

export interface PremiumDirectionPlacementV17 {
  readonly direction: DirectionId;
  readonly mirror: boolean;
  readonly backFacing: boolean;
  readonly hairDepth: PremiumPartDepth;
  readonly capeDepth: PremiumPartDepth;
  readonly armorDepth: PremiumPartDepth;
  readonly faceDepth: PremiumPartDepth;
  readonly faceAlpha: number;
  readonly xCompression: number;
  readonly xOffset: number;
  readonly yOffset: number;
  readonly capeOffsetX: number;
  readonly capeOffsetY: number;
  readonly weaponDepth: PremiumPartDepth;
}

export interface PremiumAttackPlacementV17 {
  readonly weaponOffsetX: number;
  readonly weaponOffsetY: number;
  readonly weaponRotationOffset: number;
  readonly weaponScaleX: number;
  readonly weaponScaleY: number;
  readonly impactScale: number;
  readonly capeOffsetX: number;
  readonly capeOffsetY: number;
  readonly capeRotation: number;
  readonly hairRotation: number;
  readonly armorOffsetX: number;
  readonly armorOffsetY: number;
}

const DIRECTION_PLACEMENTS: Readonly<Record<DirectionId, PremiumDirectionPlacementV17>> = {
  n: {
    direction: 'n', mirror: false, backFacing: true,
    hairDepth: 'front', capeDepth: 'front', armorDepth: 'back', faceDepth: 'back',
    faceAlpha: 0.18, xCompression: 0.86, xOffset: 0, yOffset: -1.4,
    capeOffsetX: 0, capeOffsetY: -1.5, weaponDepth: 'back',
  },
  ne: {
    direction: 'ne', mirror: false, backFacing: true,
    hairDepth: 'front', capeDepth: 'front', armorDepth: 'back', faceDepth: 'back',
    faceAlpha: 0.48, xCompression: 0.92, xOffset: 1.1, yOffset: -0.8,
    capeOffsetX: -2.3, capeOffsetY: -0.8, weaponDepth: 'back',
  },
  e: {
    direction: 'e', mirror: false, backFacing: false,
    hairDepth: 'front', capeDepth: 'back', armorDepth: 'front', faceDepth: 'front',
    faceAlpha: 0.78, xCompression: 0.9, xOffset: 1.5, yOffset: 0,
    capeOffsetX: -3.6, capeOffsetY: 0, weaponDepth: 'front',
  },
  se: {
    direction: 'se', mirror: false, backFacing: false,
    hairDepth: 'front', capeDepth: 'back', armorDepth: 'front', faceDepth: 'front',
    faceAlpha: 0.94, xCompression: 0.96, xOffset: 1, yOffset: 0.6,
    capeOffsetX: -2.4, capeOffsetY: 0.7, weaponDepth: 'front',
  },
  s: {
    direction: 's', mirror: false, backFacing: false,
    hairDepth: 'back', capeDepth: 'back', armorDepth: 'front', faceDepth: 'front',
    faceAlpha: 1, xCompression: 1, xOffset: 0, yOffset: 1,
    capeOffsetX: 0, capeOffsetY: 1.1, weaponDepth: 'front',
  },
  sw: {
    direction: 'sw', mirror: true, backFacing: false,
    hairDepth: 'front', capeDepth: 'back', armorDepth: 'front', faceDepth: 'front',
    faceAlpha: 0.94, xCompression: 0.96, xOffset: -1, yOffset: 0.6,
    capeOffsetX: 2.4, capeOffsetY: 0.7, weaponDepth: 'front',
  },
  w: {
    direction: 'w', mirror: true, backFacing: false,
    hairDepth: 'front', capeDepth: 'back', armorDepth: 'front', faceDepth: 'front',
    faceAlpha: 0.78, xCompression: 0.9, xOffset: -1.5, yOffset: 0,
    capeOffsetX: 3.6, capeOffsetY: 0, weaponDepth: 'front',
  },
  nw: {
    direction: 'nw', mirror: true, backFacing: true,
    hairDepth: 'front', capeDepth: 'front', armorDepth: 'back', faceDepth: 'back',
    faceAlpha: 0.48, xCompression: 0.92, xOffset: -1.1, yOffset: -0.8,
    capeOffsetX: 2.3, capeOffsetY: -0.8, weaponDepth: 'back',
  },
};

export function resolvePremiumDirectionPlacement(
  facingX: number,
  facingY: number,
): PremiumDirectionPlacementV17 {
  return DIRECTION_PLACEMENTS[directionFromVector({ x: facingX, y: facingY })];
}

export function playerDirectionalPartTexture(
  sheet: Spritesheet | undefined,
  direction: DirectionId,
  part: PremiumDirectionalPlayerPart,
): Texture | undefined {
  return sheet?.textures[`premium.pose.v17.player.${direction}.${part}`]
    ?? sheet?.textures[`premium.pose.v17.player.s.${part}`];
}

export function resolvePremiumAttackPlacement(
  family: WeaponVisualFamily,
  state: PremiumCharacterRuntimeState,
  actionProgress: number,
  comboStep: number,
  direction: DirectionId,
): PremiumAttackPlacementV17 {
  const p = Math.max(0, Math.min(1, actionProgress));
  const active = state === 'attacking' || state === 'skill' || state === 'showcase';
  const pulse = active ? Math.sin(p * Math.PI) : 0;
  const contact = active ? Math.pow(Math.max(0, Math.sin(Math.min(1, p * 1.12) * Math.PI)), 1.15) : 0;
  const comboSign = comboStep % 2 === 0 ? -1 : 1;
  const directionProfile = DIRECTION_PLACEMENTS[direction];
  const vertical = direction === 'n' || direction === 's' ? 0.78 : direction.length === 2 ? 0.92 : 1;

  const familyProfile = family === 'greatblade'
    ? { reach: 5.8, lift: -2.6, rotation: 0.42, sx: 1.08, sy: 1.04, impact: 1.24, cape: 3.8, hair: 0.052, armor: 1.8 }
    : family === 'riftlance'
      ? { reach: 8.4, lift: -0.8, rotation: 0.12, sx: 1.14, sy: 0.96, impact: 1.08, cape: 2.6, hair: 0.032, armor: 1.15 }
      : { reach: 4.2, lift: -1.7, rotation: 0.28, sx: 1.02, sy: 1, impact: 1.1, cape: 2.2, hair: 0.044, armor: 0.9 };

  const facingSign = directionProfile.mirror ? -1 : 1;
  return {
    weaponOffsetX: facingSign * familyProfile.reach * contact * vertical,
    weaponOffsetY: familyProfile.lift * pulse + (directionProfile.backFacing ? -1.1 : 0.6) * contact,
    weaponRotationOffset: facingSign * comboSign * familyProfile.rotation * pulse,
    weaponScaleX: familyProfile.sx + contact * 0.08,
    weaponScaleY: familyProfile.sy - contact * 0.035,
    impactScale: familyProfile.impact + contact * 0.18,
    capeOffsetX: -facingSign * familyProfile.cape * pulse + directionProfile.capeOffsetX,
    capeOffsetY: directionProfile.capeOffsetY + pulse * 1.6,
    capeRotation: -facingSign * comboSign * pulse * (family === 'greatblade' ? 0.13 : 0.08),
    hairRotation: facingSign * comboSign * pulse * familyProfile.hair,
    armorOffsetX: facingSign * contact * familyProfile.armor,
    armorOffsetY: -contact * (family === 'greatblade' ? 1.35 : 0.75),
  };
}
