import { describe, expect, it } from 'vitest';
import { resolveBattleHudSafeArea } from './BattleHudSafeArea';

const metrics = (width: number, height: number, keyboardOffset = 0) => ({
  width,
  height,
  keyboardOffset,
  offsetTop: 0,
  offsetLeft: 0,
  scale: 1,
});

describe('resolveBattleHudSafeArea', () => {
  it('keeps the standard 9:16 control layout on a tall phone', () => {
    const layout = resolveBattleHudSafeArea(metrics(390, 844));
    expect(layout.compact).toBe(false);
    expect(layout.controlScale).toBe(1);
    expect(layout.joystick.y).toBe(865);
  });

  it('shrinks and lifts controls on a narrow viewport', () => {
    const layout = resolveBattleHudSafeArea(metrics(360, 760));
    expect(layout.compact).toBe(true);
    expect(layout.controlScale).toBeLessThan(0.9);
    expect(layout.joystick.y).toBeLessThan(865);
  });

  it('lifts controls above the software keyboard', () => {
    const layout = resolveBattleHudSafeArea(metrics(390, 620, 224));
    expect(layout.compact).toBe(true);
    expect(layout.joystick.y).toBeLessThanOrEqual(781);
  });
});
