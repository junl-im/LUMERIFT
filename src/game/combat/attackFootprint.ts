import type { HitShape } from './combatData';
import { circlesOverlap, isPointInDirectionalArc, normalize, type Vec2 } from './geometry';

export interface AttackFootprint {
  readonly shape: HitShape;
  readonly origin: Vec2;
  readonly facing: Vec2;
  readonly range: number;
  readonly halfAngleRadians: number;
}

export interface ArcAngles {
  readonly center: number;
  readonly start: number;
  readonly end: number;
}

export function createAttackFootprint(
  shape: HitShape,
  origin: Vec2,
  facing: Vec2,
  range: number,
  halfAngleRadians: number,
): AttackFootprint {
  return {
    shape,
    origin: { ...origin },
    facing: normalize(facing),
    range: Math.max(0, range),
    halfAngleRadians: Math.max(0, Math.min(Math.PI, halfAngleRadians)),
  };
}

export function footprintContainsCircle(
  footprint: AttackFootprint,
  target: Vec2,
  targetRadius: number,
): boolean {
  if (footprint.shape === 'circle') {
    return circlesOverlap(footprint.origin, footprint.range, target, Math.max(0, targetRadius));
  }
  return isPointInDirectionalArc(
    footprint.origin,
    footprint.facing,
    target,
    footprint.range,
    footprint.halfAngleRadians,
    Math.max(0, targetRadius),
  );
}

export function resolveArcAngles(facing: Vec2, halfAngleRadians: number): ArcAngles {
  const normalized = normalize(facing);
  const center = Math.atan2(normalized.y, normalized.x);
  const halfAngle = Math.max(0, Math.min(Math.PI, halfAngleRadians));
  return {
    center,
    start: center - halfAngle,
    end: center + halfAngle,
  };
}

export function buildArcPolygon(footprint: AttackFootprint, segments = 18): readonly Vec2[] {
  if (footprint.shape !== 'arc') return [];
  const angles = resolveArcAngles(footprint.facing, footprint.halfAngleRadians);
  const count = Math.max(4, Math.floor(segments));
  const points: Vec2[] = [{ ...footprint.origin }];
  for (let index = 0; index <= count; index += 1) {
    const ratio = index / count;
    const angle = angles.start + (angles.end - angles.start) * ratio;
    points.push({
      x: footprint.origin.x + Math.cos(angle) * footprint.range,
      y: footprint.origin.y + Math.sin(angle) * footprint.range,
    });
  }
  points.push({ ...footprint.origin });
  return points;
}

export function telegraphProgress(value: number): number {
  return Math.max(0, Math.min(1, value));
}
