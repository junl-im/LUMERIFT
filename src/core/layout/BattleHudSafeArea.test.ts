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

  it('applies a larger bottom lift on iOS than Android', () => {
    const ios = resolveBattleHudSafeArea({ ...metrics(390, 720), platform: 'ios' as const });
    const android = resolveBattleHudSafeArea({ ...metrics(390, 720), platform: 'android' as const });
    expect(ios.profile).toBe('ios');
    expect(ios.joystick.y).toBeLessThan(android.joystick.y);
  });

  it('keeps the right action cluster separated for finger clearance', () => {
    const layout = resolveBattleHudSafeArea(metrics(390, 844));
    const skillToAttack = Math.hypot(layout.attack.x - layout.skill1.x, layout.attack.y - layout.skill1.y);
    const skillGap = Math.hypot(layout.skill1.x - layout.skill2.x, layout.skill1.y - layout.skill2.y);
    expect(skillToAttack).toBeGreaterThan(100);
    expect(skillGap).toBeGreaterThan(88);
  });
});
