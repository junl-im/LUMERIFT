import { describe, expect, it } from 'vitest';
import { CombatAssistController } from './CombatAssistController';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CombatAssistController', () => {
  it('starts with safe detailed assist defaults', () => {
    const controller = new CombatAssistController(new MemoryStorage());
    expect(controller.current).toEqual({
      autoTarget: true,
      autoBattle: false,
      targetPriority: 'balanced',
      autoSkills: true,
      autoDodge: true,
      bossAutoMode: 'target-only',
      devicePreset: 'balanced',
    });
  });

  it('enables auto target when auto battle is turned on', () => {
    const controller = new CombatAssistController(new MemoryStorage());
    controller.set({ autoTarget: false });
    controller.toggleAutoBattle();
    expect(controller.current.autoTarget).toBe(true);
    expect(controller.current.autoBattle).toBe(true);
  });

  it('cycles target, boss, and device presets independently', () => {
    const controller = new CombatAssistController(new MemoryStorage());
    expect(controller.cycleTargetPriority()).toBe('nearest');
    expect(controller.cycleBossAutoMode()).toBe('full');
    expect(controller.cycleDevicePreset()).toBe('responsive');
  });
});
