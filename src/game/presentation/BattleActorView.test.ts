import { describe, expect, it } from 'vitest';
import { directionFromVector } from './direction';

describe('directionFromVector', () => {
  it('maps cardinal and diagonal vectors to the eight-direction atlas keys', () => {
    expect(directionFromVector({ x: 0, y: -1 })).toBe('n');
    expect(directionFromVector({ x: 1, y: -1 })).toBe('ne');
    expect(directionFromVector({ x: 1, y: 0 })).toBe('e');
    expect(directionFromVector({ x: 1, y: 1 })).toBe('se');
    expect(directionFromVector({ x: 0, y: 1 })).toBe('s');
    expect(directionFromVector({ x: -1, y: 1 })).toBe('sw');
    expect(directionFromVector({ x: -1, y: 0 })).toBe('w');
    expect(directionFromVector({ x: -1, y: -1 })).toBe('nw');
  });
});
