import { describe, expect, it } from 'vitest';
import { HapticFeedbackController } from './HapticFeedbackController';

describe('HapticFeedbackController', () => {
  it('throttles repeated combat pulses and respects the enabled flag', () => {
    const calls: Array<number | readonly number[]> = [];
    let now = 1_000;
    const controller = new HapticFeedbackController((pattern) => {
      calls.push(pattern);
      return true;
    }, () => now);

    expect(controller.pulse('attack', true)).toBe(true);
    expect(controller.pulse('attack', true)).toBe(false);
    now += 90;
    expect(controller.pulse('attack', true)).toBe(true);
    expect(controller.pulse('skill', false)).toBe(false);
    expect(calls).toHaveLength(2);
  });
});
