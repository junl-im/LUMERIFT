import type { PlayerState } from '../actors/player/PlayerCombatController';

export type CharacterFxState = 'idle' | 'attack' | 'skill' | 'dodge';

export interface CharacterStateMaterialProfile {
  readonly state: CharacterFxState;
  readonly backAlpha: number;
  readonly frontAlpha: number;
  readonly scale: number;
  readonly rotationFactor: number;
  readonly pulseSpeed: number;
}

export function resolveCharacterStateMaterial(
  state: PlayerState,
  overdrive: boolean,
  driveRatio: number,
  reducedMotion: boolean,
): CharacterStateMaterialProfile {
  const resolved = resolveFxState(state);
  const driveBoost = Math.max(0, Math.min(1, driveRatio)) * 0.16;
  const overdriveBoost = overdrive ? 0.22 : 0;
  const motionFactor = reducedMotion ? 0.45 : 1;

  const base = resolved === 'skill'
    ? { back: 0.62, front: 0.78, scale: 1.04, rotation: 0.22, pulse: 7.5 }
    : resolved === 'attack'
      ? { back: 0.5, front: 0.72, scale: 1, rotation: 0.3, pulse: 9 }
      : resolved === 'dodge'
        ? { back: 0.46, front: 0.62, scale: 1.03, rotation: 0.16, pulse: 11 }
        : { back: 0.34, front: 0.48, scale: 0.96, rotation: 0.08, pulse: 3.5 };

  return {
    state: resolved,
    backAlpha: Math.min(0.92, base.back + driveBoost * 0.5 + overdriveBoost * 0.45),
    frontAlpha: Math.min(1, base.front + driveBoost + overdriveBoost),
    scale: base.scale + (overdrive ? 0.045 : 0),
    rotationFactor: base.rotation * motionFactor,
    pulseSpeed: base.pulse * motionFactor,
  };
}

export function resolveFxState(state: PlayerState): CharacterFxState {
  if (state === 'attacking') return 'attack';
  if (state === 'skill') return 'skill';
  if (state === 'dodging') return 'dodge';
  return 'idle';
}
