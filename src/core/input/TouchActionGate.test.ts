import { describe, expect, it } from 'vitest';
import { TouchActionGate } from './TouchActionGate';

describe('TouchActionGate', () => {
  it('keeps one pointer owner and suppresses accidental duplicate taps', () => {
    const gate = new TouchActionGate(72);
    expect(gate.begin(1)).toBe(true);
    expect(gate.begin(2)).toBe(false);
    expect(gate.release(2, 100)).toBe(false);
    expect(gate.release(1, 100)).toBe(true);
    expect(gate.begin(3)).toBe(true);
    expect(gate.release(3, 140)).toBe(false);
  });
});
