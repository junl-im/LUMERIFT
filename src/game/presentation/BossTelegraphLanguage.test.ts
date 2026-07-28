import { describe, expect, it } from 'vitest';
import { resolveBossTelegraphStyle } from './BossTelegraphLanguage';

const pattern = {
  id: 'boss_arc', label: '균열 절단', shape: 'arc', targetMode: 'self', damageMultiplier: 1, range: 180,
  triggerRange: 220, halfAngleRadians: 1, cooldown: 3, windup: 1, duration: 1.4, effectColor: 0xff4455,
} as const;

describe('resolveBossTelegraphStyle', () => {
  it('escalates to critical and adds more boss timing ticks', () => {
    const early = resolveBossTelegraphStyle(pattern, 0.2, 1, 'boss');
    const late = resolveBossTelegraphStyle(pattern, 0.9, 3, 'boss');
    expect(early.urgency).toBe('warning');
    expect(late.urgency).toBe('critical');
    expect(late.tickCount).toBeGreaterThan(early.tickCount);
  });
});
