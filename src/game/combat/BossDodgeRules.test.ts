import { describe, expect, it } from 'vitest';
import { resolveBossDodgeDirection, resolveBossDodgeRule } from './BossDodgeRules';

describe('BossDodgeRules', () => {
  it('uses an early outward escape for abyss nova', () => {
    const rule = resolveBossDodgeRule('boss_nova');
    const direction = resolveBossDodgeDirection(rule, { x: 1, y: 0 });
    expect(rule.triggerProgress).toBeLessThan(0.5);
    expect(direction.x).toBeLessThan(0);
  });

  it('uses a diagonal escape for tracking rupture', () => {
    const rule = resolveBossDodgeRule('boss_rupture');
    const direction = resolveBossDodgeDirection(rule, { x: 0, y: -1 });
    expect(rule.directionMode).toBe('diagonal');
    expect(Math.abs(direction.x)).toBeGreaterThan(0.2);
  });
});
