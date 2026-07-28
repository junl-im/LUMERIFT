import { describe, expect, it } from 'vitest';
import {
  buildArcPolygon,
  createAttackFootprint,
  footprintContainsCircle,
  resolveArcAngles,
  telegraphProgress,
} from './attackFootprint';

describe('attack footprint', () => {
  it('uses the same circle radius for display and collision', () => {
    const footprint = createAttackFootprint('circle', { x: 100, y: 100 }, { x: 1, y: 0 }, 80, Math.PI);
    expect(footprintContainsCircle(footprint, { x: 188, y: 100 }, 8)).toBe(true);
    expect(footprintContainsCircle(footprint, { x: 189, y: 100 }, 8)).toBe(false);
  });

  it('resolves an exact directional wedge', () => {
    const footprint = createAttackFootprint('arc', { x: 0, y: 0 }, { x: 1, y: 0 }, 100, Math.PI / 4);
    expect(footprintContainsCircle(footprint, { x: 70, y: 20 }, 0)).toBe(true);
    expect(footprintContainsCircle(footprint, { x: 0, y: 70 }, 0)).toBe(false);
    expect(footprintContainsCircle(footprint, { x: 104, y: 0 }, 4)).toBe(true);
  });

  it('clamps telegraph and angle values', () => {
    const angles = resolveArcAngles({ x: 0, y: 1 }, Math.PI * 2);
    expect(angles.center).toBeCloseTo(Math.PI / 2);
    expect(angles.end - angles.start).toBeCloseTo(Math.PI * 2);
    const polygon = buildArcPolygon(createAttackFootprint('arc', { x: 5, y: 6 }, { x: 1, y: 0 }, 10, Math.PI / 4), 8);
    expect(polygon[0]).toEqual({ x: 5, y: 6 });
    expect(polygon.at(-1)).toEqual({ x: 5, y: 6 });
    expect(telegraphProgress(-1)).toBe(0);
    expect(telegraphProgress(2)).toBe(1);
  });
});
