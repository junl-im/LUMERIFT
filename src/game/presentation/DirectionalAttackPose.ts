import type { PlayerState } from '../actors/player/PlayerCombatController';
import type { DirectionId } from './direction';

export interface DirectionalAttackPoseInput {
  readonly direction: DirectionId;
  readonly state: PlayerState;
  readonly progress: number;
  readonly comboStep: number;
  readonly reducedMotion: boolean;
}

export interface DirectionalAttackPose {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly accentAlpha: number;
  readonly accentLength: number;
}

const DIRECTION_VECTOR: Readonly<Record<DirectionId, { x: number; y: number }>> = {
  n: { x: 0, y: -1 },
  ne: { x: 0.707, y: -0.707 },
  e: { x: 1, y: 0 },
  se: { x: 0.707, y: 0.707 },
  s: { x: 0, y: 1 },
  sw: { x: -0.707, y: 0.707 },
  w: { x: -1, y: 0 },
  nw: { x: -0.707, y: -0.707 },
};

export function resolveDirectionalAttackPose(input: DirectionalAttackPoseInput): DirectionalAttackPose {
  const progress = clamp01(input.progress);
  const vector = DIRECTION_VECTOR[input.direction];
  const reduced = input.reducedMotion ? 0.45 : 1;
  const strike = Math.sin(progress * Math.PI);
  const recovery = Math.sin(progress * Math.PI * 2);
  const comboPower = 1 + Math.max(0, input.comboStep - 1) * 0.09;

  if (input.state === 'attacking' || input.state === 'skill') {
    const skillPower = input.state === 'skill' ? 1.28 : 1;
    return {
      offsetX: vector.x * strike * 5.5 * comboPower * reduced,
      offsetY: (vector.y * 2.4 - 2.8) * strike * skillPower * reduced,
      rotation: (vector.x * 0.036 * strike + recovery * 0.012) * comboPower * reduced,
      scaleX: 1 + strike * 0.035 * skillPower * reduced,
      scaleY: 1 - strike * 0.018 * reduced,
      accentAlpha: strike * (input.state === 'skill' ? 0.42 : 0.28) * reduced,
      accentLength: (input.state === 'skill' ? 58 : 42) + input.comboStep * 6,
    };
  }

  if (input.state === 'dodging') {
    return {
      offsetX: vector.x * 3 * reduced,
      offsetY: vector.y * 1.5 * reduced,
      rotation: vector.x * 0.022 * reduced,
      scaleX: 1.025,
      scaleY: 0.985,
      accentAlpha: 0.18 * reduced,
      accentLength: 50,
    };
  }

  return { offsetX: 0, offsetY: 0, rotation: 0, scaleX: 1, scaleY: 1, accentAlpha: 0, accentLength: 0 };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
