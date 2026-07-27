import { describe, expect, it } from 'vitest';
import { calculateDamage } from './damage';

describe('calculateDamage', () => {
  it('방어력이 있어도 최소 1의 피해를 보장한다', () => {
    expect(calculateDamage({ attack: 1, skillMultiplier: 0.1, defense: 9999, critical: false })).toBe(1);
  });

  it('치명타 배율을 적용한다', () => {
    const normal = calculateDamage({ attack: 100, skillMultiplier: 1, defense: 0, critical: false });
    const critical = calculateDamage({ attack: 100, skillMultiplier: 1, defense: 0, critical: true, criticalMultiplier: 2 });
    expect(critical).toBe(normal * 2);
  });
});
