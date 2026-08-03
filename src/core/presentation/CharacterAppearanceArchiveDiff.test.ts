import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from './CharacterWardrobeController';
import { compareCharacterAppearanceArchives } from './CharacterAppearanceArchiveDiff';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('compareCharacterAppearanceArchives', () => {
  it('reports slot, order, lock, and preset differences', () => {
    const leftController = new CharacterWardrobeController(new MemoryStorage());
    leftController.saveSelectedSlot('heir-gold', 10);
    const left = leftController.exportPresetArchive(20);

    const rightController = new CharacterWardrobeController(new MemoryStorage());
    rightController.saveSelectedSlot('rift-azure', 30);
    rightController.toggleSlotLock(1);
    rightController.moveSelectedSlot(1);
    const right = rightController.exportPresetArchive(40);

    const diff = compareCharacterAppearanceArchives(left, right, 50);
    expect(diff.schema).toBe('lumerift-character-appearance-diff-v1');
    expect(diff.summary.totalDifferences).toBeGreaterThan(0);
    expect(diff.summary.changedSlots).toBe(1);
    expect(diff.summary.changedLocks).toBe(1);
    expect(diff.slotOrderChanged).toBe(true);
    expect(diff.presetDifferences.length).toBeGreaterThan(0);
  });
});
