import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from './CharacterWardrobeController';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CharacterWardrobeController', () => {
  it('stores and restores the full selected appearance preset', () => {
    const storage = new MemoryStorage();
    const controller = new CharacterWardrobeController(storage);
    controller.setPose('skill2');
    controller.rotateDirection(1);
    controller.cycleCostumeSet();
    controller.cycleDyeChannel('rune');
    controller.selectSlot(2);
    controller.saveSelectedSlot('abyss-violet', 1234);

    const restored = new CharacterWardrobeController(storage);
    restored.selectSlot(2);
    expect(restored.loadSelectedSlot()).toEqual({
      dyePreset: 'abyss-violet',
      pose: 'skill2',
      direction: 'sw',
      costumeSet: 'warden-rift',
      dyeChannels: { primary: 1, secondary: 1, rune: 2 },
      savedAt: 1234,
    });
    expect(restored.current.direction).toBe('sw');
    expect(restored.current.costumeSet).toBe('warden-rift');
  });

  it('cycles poses and all eight manual directions', () => {
    const controller = new CharacterWardrobeController(new MemoryStorage());
    expect(controller.cyclePose()).toBe('run');
    expect(controller.cyclePose()).toBe('attack1');
    const directions = Array.from({ length: 8 }, () => controller.rotateDirection(1));
    expect(directions).toEqual(['sw', 'w', 'nw', 'n', 'ne', 'e', 'se', 's']);
  });

  it('keeps recent presets bounded and applies the latest preset', () => {
    const controller = new CharacterWardrobeController(new MemoryStorage());
    controller.setPose('attack3');
    controller.rotateDirection(-1);
    controller.rememberCurrentPreset('moon-silver', 10);
    controller.setPose('idle');
    const applied = controller.applyRecentPreset(0);
    expect(applied?.dyePreset).toBe('moon-silver');
    expect(controller.current.pose).toBe('attack3');
    expect(controller.current.direction).toBe('se');
    expect(controller.current.recentPresets).toHaveLength(1);
  });
});
