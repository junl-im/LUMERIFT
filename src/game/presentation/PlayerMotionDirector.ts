import type { PlayerState } from '../actors/player/PlayerCombatController';
import { resolveWeaponAttackTiming } from '../combat/WeaponMotionProfile';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';

export interface PlayerMotionInput {
  readonly state: PlayerState;
  readonly progress: number;
  readonly comboStep: number;
  readonly driveRatio: number;
  readonly overdrive: boolean;
  readonly reducedMotion: boolean;
  readonly renderIntensity: number;
  readonly weaponFamily?: WeaponVisualFamily;
}

export interface PlayerMotionProfile {
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotation: number;
  readonly offsetY: number;
  readonly animationSpeed: number;
  readonly auraAlpha: number;
  readonly auraRadius: number;
  readonly trailAlpha: number;
  readonly trailLength: number;
  readonly afterimageInterval: number;
  readonly afterimageAlpha: number;
}

export function resolvePlayerMotion(input: PlayerMotionInput): PlayerMotionProfile {
  const progress = clamp01(input.progress);
  const anticipation = Math.sin(progress * Math.PI);
  const reduced = input.reducedMotion ? 0.42 : 1;
  const intensity = Math.max(0.35, Math.min(1.2, input.renderIntensity));
  const driveGlow = input.overdrive ? 1 : Math.max(0, input.driveRatio - 0.38) / 0.62;

  let scaleX = 1;
  let scaleY = 1;
  let rotation = 0;
  let offsetY = 0;
  let animationSpeed = 0.12;
  let trailAlpha = 0;
  let trailLength = 0;
  let afterimageInterval = 0.075;
  let afterimageAlpha = 0;

  if (input.state === 'moving') {
    const locomotion = Math.sin(progress * Math.PI * 2);
    const shoulderRhythm = Math.sin(progress * Math.PI * 4 + Math.PI / 5);
    scaleX = 1 + locomotion * 0.024 * reduced + shoulderRhythm * 0.008 * reduced;
    scaleY = 1 - locomotion * 0.017 * reduced + Math.abs(locomotion) * 0.006 * reduced;
    offsetY = -Math.abs(locomotion) * 2.8 * reduced;
    rotation = shoulderRhythm * 0.012 * reduced;
    animationSpeed = 0.22;
    trailAlpha = 0.09 * intensity;
    trailLength = 20;
  } else if (input.state === 'attacking') {
    const family = input.weaponFamily ?? 'blade';
    const weaponTiming = resolveWeaponAttackTiming(family, input.comboStep);
    const comboPower = 1 + Math.max(0, input.comboStep - 1) * 0.08;
    const contactPulse = phasePulse(progress, weaponTiming.contactRatio, family === 'greatblade' ? 0.24 : 0.18);
    const anticipationPulse = phasePulse(progress, weaponTiming.anticipationRatio, 0.22);
    scaleX = 1 + (anticipationPulse * 0.05 + contactPulse * 0.075) * comboPower * reduced;
    scaleY = 1 - contactPulse * (family === 'greatblade' ? 0.06 : 0.038) * reduced;
    rotation = Math.sin(progress * Math.PI * 2) * 0.026 * comboPower * weaponTiming.rotationWeight * reduced;
    offsetY = family === 'riftlance' ? -contactPulse * 2.2 * reduced : family === 'greatblade' ? anticipationPulse * 1.5 : 0;
    animationSpeed = weaponTiming.bodyAnimationSpeed;
    trailAlpha = (family === 'greatblade' ? 0.58 : family === 'riftlance' ? 0.48 : 0.45) * comboPower * intensity;
    trailLength = (family === 'riftlance' ? 58 : family === 'greatblade' ? 50 : 42) + input.comboStep * 10;
  } else if (input.state === 'skill') {
    const family = input.weaponFamily ?? 'blade';
    const weaponTiming = resolveWeaponAttackTiming(family, input.comboStep, true);
    const contactPulse = phasePulse(progress, weaponTiming.contactRatio, 0.22);
    scaleX = 1 + (anticipation * 0.08 + contactPulse * 0.06) * reduced;
    scaleY = 1 + contactPulse * 0.05 * reduced;
    offsetY = -contactPulse * (family === 'riftlance' ? 2 : 4) * reduced;
    rotation = Math.sin(progress * Math.PI) * 0.018 * weaponTiming.rotationWeight * reduced;
    animationSpeed = weaponTiming.bodyAnimationSpeed;
    trailAlpha = 0.72 * intensity;
    trailLength = family === 'riftlance' ? 94 : family === 'greatblade' ? 82 : 76;
    afterimageInterval = 0.06;
    afterimageAlpha = 0.24 * intensity;
  } else if (input.state === 'dodging') {
    scaleX = 1.12;
    scaleY = 0.78;
    rotation = -0.04 * reduced;
    animationSpeed = 0.24;
    trailAlpha = 0.52 * intensity;
    trailLength = 88;
    afterimageInterval = input.reducedMotion ? 0.11 : 0.045;
    afterimageAlpha = (input.reducedMotion ? 0.16 : 0.38) * intensity;
  } else if (input.state === 'hit') {
    scaleX = 0.93;
    scaleY = 1.04;
    rotation = Math.sin(progress * Math.PI * 3) * 0.045 * reduced;
    animationSpeed = 0.17;
  } else if (input.state === 'dead') {
    scaleX = 0.98;
    scaleY = 0.9;
    animationSpeed = 0.12;
  }

  return {
    scaleX,
    scaleY,
    rotation,
    offsetY,
    animationSpeed,
    auraAlpha: (0.05 + driveGlow * (input.overdrive ? 0.48 : 0.24)) * intensity,
    auraRadius: 34 + driveGlow * 14,
    trailAlpha,
    trailLength,
    afterimageInterval,
    afterimageAlpha,
  };
}

function phasePulse(progress: number, center: number, width: number): number {
  const distance = Math.abs(progress - center);
  return Math.max(0, 1 - distance / Math.max(0.01, width));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
