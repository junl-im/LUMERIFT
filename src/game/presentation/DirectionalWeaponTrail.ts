import type { DirectionId } from './direction';

export interface DirectionalWeaponTrailProfile {
  readonly direction: DirectionId;
  readonly lengthMultiplier: number;
  readonly widthMultiplier: number;
  readonly lateralOffset: number;
  readonly verticalLift: number;
  readonly rotationBias: number;
  readonly echoCount: number;
}

const PROFILES: Readonly<Record<DirectionId, DirectionalWeaponTrailProfile>> = {
  n: { direction: 'n', lengthMultiplier: 0.9, widthMultiplier: 0.82, lateralOffset: 0, verticalLift: -7, rotationBias: -0.04, echoCount: 2 },
  ne: { direction: 'ne', lengthMultiplier: 1.08, widthMultiplier: 0.94, lateralOffset: 5, verticalLift: -5, rotationBias: 0.025, echoCount: 3 },
  e: { direction: 'e', lengthMultiplier: 1.18, widthMultiplier: 1, lateralOffset: 7, verticalLift: -2, rotationBias: 0.055, echoCount: 3 },
  se: { direction: 'se', lengthMultiplier: 1.1, widthMultiplier: 1.08, lateralOffset: 5, verticalLift: 2, rotationBias: 0.035, echoCount: 3 },
  s: { direction: 's', lengthMultiplier: 0.96, widthMultiplier: 1.14, lateralOffset: 0, verticalLift: 4, rotationBias: 0.02, echoCount: 2 },
  sw: { direction: 'sw', lengthMultiplier: 1.1, widthMultiplier: 1.08, lateralOffset: -5, verticalLift: 2, rotationBias: -0.035, echoCount: 3 },
  w: { direction: 'w', lengthMultiplier: 1.18, widthMultiplier: 1, lateralOffset: -7, verticalLift: -2, rotationBias: -0.055, echoCount: 3 },
  nw: { direction: 'nw', lengthMultiplier: 1.08, widthMultiplier: 0.94, lateralOffset: -5, verticalLift: -5, rotationBias: -0.025, echoCount: 3 },
};

export function resolveDirectionalWeaponTrail(direction: DirectionId): DirectionalWeaponTrailProfile {
  return PROFILES[direction];
}

export function resolveDirectionalWeaponTrailFromAngle(angle: number): DirectionalWeaponTrailProfile {
  const normalized = ((angle + Math.PI * 2) % (Math.PI * 2));
  const index = Math.round(normalized / (Math.PI / 4)) % 8;
  const order: readonly DirectionId[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  return PROFILES[order[index] ?? 'e'];
}
