import { describe, expect, it } from 'vitest';
import { CombatAssistController } from './CombatAssistController';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CombatAssistController', () => {
  it('starts with auto target on and auto battle off', () => {
    const controller = new CombatAssistController(new MemoryStorage());
    expect(controller.current).toEqual({ autoTarget: true, autoBattle: false });
  });

  it('enables auto target when auto battle is turned on', () => {
    const controller = new CombatAssistController(new MemoryStorage());
    controller.set({ autoTarget: false });
    controller.toggleAutoBattle();
    expect(controller.current).toEqual({ autoTarget: true, autoBattle: true });
  });
});
