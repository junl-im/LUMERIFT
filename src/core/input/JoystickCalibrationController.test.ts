import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../app/brand';
import { applyJoystickCalibration, JoystickCalibrationController } from './JoystickCalibrationController';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('JoystickCalibrationController', () => {
  it('uses screen coordinates as the default and ignores the retired v1 reverse default', () => {
    const storage = new MemoryStorage();
    storage.setItem('lumerift.joystickCalibration.v1', 'reverse');

    const controller = new JoystickCalibrationController(storage);

    expect(STORAGE_KEYS.joystickCalibration).toContain('.v2');
    expect(controller.current).toBe('screen');
    expect(controller.apply({ x: 1, y: -0.5 })).toEqual({ x: 1, y: -0.5 });
  });

  it('applies each explicit correction without changing the normal screen mode', () => {
    const axis = { x: 0.75, y: -0.25 };

    expect(applyJoystickCalibration(axis, 'screen')).toEqual({ x: 0.75, y: -0.25 });
    expect(applyJoystickCalibration(axis, 'invert-x')).toEqual({ x: -0.75, y: -0.25 });
    expect(applyJoystickCalibration(axis, 'invert-y')).toEqual({ x: 0.75, y: 0.25 });
    expect(applyJoystickCalibration(axis, 'reverse')).toEqual({ x: -0.75, y: 0.25 });
  });

  it('cycles from the normal screen mode through optional device corrections', () => {
    const controller = new JoystickCalibrationController(new MemoryStorage());

    expect(controller.current).toBe('screen');
    expect(controller.cycle()).toBe('invert-x');
    expect(controller.cycle()).toBe('invert-y');
    expect(controller.cycle()).toBe('reverse');
    expect(controller.cycle()).toBe('screen');
  });
});
