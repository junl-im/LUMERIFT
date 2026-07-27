export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export function length(vector: Vec2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector: Vec2, fallback: Vec2 = { x: 1, y: 0 }): Vec2 {
  const magnitude = length(vector);
  if (magnitude <= Number.EPSILON) return fallback;
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function circlesOverlap(a: Vec2, aRadius: number, b: Vec2, bRadius: number): boolean {
  return distance(a, b) <= aRadius + bRadius;
}

export function isPointInDirectionalArc(
  origin: Vec2,
  facing: Vec2,
  target: Vec2,
  range: number,
  halfAngleRadians: number,
  targetRadius = 0,
): boolean {
  const offset = { x: target.x - origin.x, y: target.y - origin.y };
  const targetDistance = length(offset);
  if (targetDistance > range + targetRadius) return false;
  if (targetDistance <= Number.EPSILON) return true;

  const direction = normalize(offset);
  const normalizedFacing = normalize(facing);
  const dot = Math.max(-1, Math.min(1, direction.x * normalizedFacing.x + direction.y * normalizedFacing.y));
  return Math.acos(dot) <= halfAngleRadians;
}

export function clampPosition(position: Vec2, minX: number, maxX: number, minY: number, maxY: number): Vec2 {
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}
