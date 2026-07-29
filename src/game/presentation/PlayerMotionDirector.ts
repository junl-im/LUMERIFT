import type { PlayerState } from '../actors/player/PlayerCombatController';

export interface PlayerMotionInput {
  readonly state: PlayerState;
  readonly progress: number;
  readonly comboStep: number;
  readonly driveRatio: number;
  readonly overdrive: boolean;
  readonly reducedMotion: boolean;
  readonly renderIntensity: number;
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
    const comboPower = 1 + Math.max(0, input.comboStep - 1) * 0.08;
    scaleX = 1 + anticipation * 0.09 * comboPower * reduced;
    scaleY = 1 - anticipation * 0.045 * reduced;
    rotation = Math.sin(progress * Math.PI * 2) * 0.025 * comboPower * reduced;
    animationSpeed = 0.27 + input.comboStep * 0.012;
    trailAlpha = 0.45 * comboPower * intensity;
    trailLength = 42 + input.comboStep * 10;
  } else if (input.state === 'skill') {
    scaleX = 1 + anticipation * 0.12 * reduced;
    scaleY = 1 + anticipation * 0.05 * reduced;
    offsetY = -anticipation * 4 * reduced;
    animationSpeed = 0.2;
    trailAlpha = 0.72 * intensity;
    trailLength = 76;
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
