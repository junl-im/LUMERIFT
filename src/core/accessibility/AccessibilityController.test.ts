import { describe, expect, it } from 'vitest';
import { AccessibilityController } from './AccessibilityController';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('AccessibilityController', () => {
  it('cycles vision modes and persists large HUD settings', () => {
    const storage = new MemoryStorage();
    const controller = new AccessibilityController(storage);
    expect(controller.current.visionMode).toBe('standard');
    controller.cycleVisionMode();
    controller.toggleLargeHud();
    const restored = new AccessibilityController(storage);
    expect(restored.current.visionMode).toBe('colorAssist');
    expect(restored.current.largeHud).toBe(true);
    expect(restored.palette.playerHp).not.toBe(restored.palette.bossHp);
  });
});
