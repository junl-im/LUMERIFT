import type { Vec2 } from '../combat/geometry';

export const DIRECTION_IDS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
export type DirectionId = typeof DIRECTION_IDS[number];

export function directionFromVector(vector: Vec2): DirectionId {
  if (Math.abs(vector.x) < 0.001 && Math.abs(vector.y) < 0.001) return 's';
  const angle = Math.atan2(vector.y, vector.x);
  const normalized = (angle + Math.PI * 2 + Math.PI / 8) % (Math.PI * 2);
  const index = Math.floor(normalized / (Math.PI / 4));
  const eastClockwise = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'] as const;
  return eastClockwise[index] ?? 's';
}
