import { describe, expect, it } from 'vitest';
import { BOSS_DODGE_RULE_VERSION, bossDodgeRuleCatalog, resolveBossDodgeDirection, resolveBossDodgeRule } from './BossDodgeRules';

describe('BossDodgeRules', () => {

  it('loads the three boss patterns from the versioned JSON catalog', () => {
    expect(BOSS_DODGE_RULE_VERSION).toBe(2);
    expect(bossDodgeRuleCatalog().map((rule) => rule.patternId)).toEqual([
      'boss_cleave',
      'boss_nova',
      'boss_rupture',
    ]);
  });
  it('uses an early outward escape for abyss nova', () => {
    const rule = resolveBossDodgeRule('boss_nova');
    const direction = resolveBossDodgeDirection(rule, { x: 1, y: 0 });
    expect(rule.triggerProgress).toBeLessThan(0.5);
    expect(direction.x).toBeLessThan(0);
    expect(rule.hudIcon).toBe('◎');
    expect(rule.safeMoveLabel).toContain('바깥');
  });

  it('uses a diagonal escape for tracking rupture', () => {
    const rule = resolveBossDodgeRule('boss_rupture');
    const direction = resolveBossDodgeDirection(rule, { x: 0, y: -1 });
    expect(rule.directionMode).toBe('diagonal');
    expect(Math.abs(direction.x)).toBeGreaterThan(0.2);
  });
});
