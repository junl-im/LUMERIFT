import { describe, expect, it } from 'vitest';
import { StatusEffectController } from './StatusEffectController';

describe('StatusEffectController', () => {
  it('applies slow movement multiplier and expires', () => {
    const status = new StatusEffectController();
    status.apply({ id: 'slow', chance: 1, duration: 1, potency: 0.4 });
    expect(status.moveSpeedMultiplier).toBeCloseTo(0.6);
    status.update(1.1);
    expect(status.moveSpeedMultiplier).toBe(1);
  });

  it('emits burn damage ticks', () => {
    const status = new StatusEffectController();
    status.apply({ id: 'burn', chance: 1, duration: 2, potency: 20, tickInterval: 0.5 });
    status.update(0.51);
    const events = status.drainDamageEvents();
    expect(events).toHaveLength(1);
    expect(events[0]?.damage).toBe(10);
  });
});
