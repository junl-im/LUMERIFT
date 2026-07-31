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
    const preset = restored.loadSelectedSlot();
    expect(preset).toMatchObject({
      name: '외형 슬롯 2',
      favorite: false,
      dyePreset: 'abyss-violet',
      pose: 'skill2',
      direction: 'sw',
      costumeSet: 'warden-rift',
      dyeChannels: { primary: 1, secondary: 1, rune: 2 },
      savedAt: 1234,
    });
    expect(preset?.id).toContain('appearance-');
    expect(restored.current.direction).toBe('sw');
    expect(restored.current.costumeSet).toBe('warden-rift');
  });

  it('cycles poses, all eight directions, focus parts, and preview zoom', () => {
    const controller = new CharacterWardrobeController(new MemoryStorage());
    expect(controller.cyclePose()).toBe('run');
    expect(controller.cyclePose()).toBe('attack1');
    const directions = Array.from({ length: 8 }, () => controller.rotateDirection(1));
    expect(directions).toEqual(['sw', 'w', 'nw', 'n', 'ne', 'e', 'se', 's']);
    expect(controller.cycleFocusPart()).toBe('weapon');
    expect(controller.cyclePreviewZoom()).toBe('close');
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

  it('renames, favorites, exports, and imports appearance presets', () => {
    const source = new CharacterWardrobeController(new MemoryStorage());
    source.rememberCurrentPreset('heir-gold', 100);
    expect(source.renameRecentPreset(0, '황금 전령')?.name).toBe('황금 전령');
    expect(source.toggleRecentFavorite(0)?.favorite).toBe(true);

    const archive = source.exportPresetArchive(200);
    const target = new CharacterWardrobeController(new MemoryStorage());
    expect(target.importPresetArchive(archive)).toBe(1);
    expect(target.current.recentPresets[0]).toMatchObject({ name: '황금 전령', favorite: true });
  });
});

it('sorts and searches presets while preserving source selection', () => {
  const controller = new CharacterWardrobeController(new MemoryStorage());
  controller.rememberCurrentPreset('heir-gold', 100);
  controller.renameRecentPreset(0, '브라보');
  controller.setPose('run');
  controller.rememberCurrentPreset('rift-azure', 200);
  controller.renameRecentPreset(0, '알파');
  controller.cyclePresetSort();
  expect(controller.current.presetSort).toBe('favorite');
  controller.toggleRecentFavorite(1);
  controller.setPresetQuery('브라보');
  expect(controller.current.presetQuery).toBe('브라보');
});

it('locks a wardrobe slot against overwrite and import replacement', () => {
  const storage = new MemoryStorage();
  const controller = new CharacterWardrobeController(storage);
  controller.saveSelectedSlot('heir-gold', 100);
  expect(controller.toggleSlotLock()).toBe(true);
  expect(() => controller.saveSelectedSlot('rift-azure', 200)).toThrow('고정');

  const source = new CharacterWardrobeController(new MemoryStorage());
  source.saveSelectedSlot('abyss-violet', 300);
  controller.importPresetArchive(source.exportPresetArchive());
  expect(controller.current.slots[1]?.dyePreset).toBe('heir-gold');
  expect(controller.current.lockedSlots[1]).toBe(true);
});


it('reorders slot priority and exports Archive v3 while migrating older orderless archives', () => {
  const controller = new CharacterWardrobeController(new MemoryStorage());
  controller.selectSlot(2);
  expect(controller.moveSelectedSlot(-1)).toEqual([2, 1, 3]);
  const archive = controller.exportPresetArchive(100);
  expect(archive.schemaVersion).toBe(3);
  expect(archive.slotOrder).toEqual([2, 1, 3]);

  const legacy = { ...archive, schemaVersion: 2, slotOrder: undefined };
  const restored = new CharacterWardrobeController(new MemoryStorage());
  expect(restored.importPresetArchive(legacy)).toBe(0);
  expect(restored.current.slotOrder).toEqual([1, 2, 3]);
});

it('replaces the full archive without reintroducing unselected presets', () => {
  const local = new CharacterWardrobeController(new MemoryStorage());
  local.rememberCurrentPreset('heir-gold', 100);
  const remote = new CharacterWardrobeController(new MemoryStorage());
  remote.rememberCurrentPreset('rift-azure', 200);
  expect(local.replacePresetArchive(remote.exportPresetArchive(300))).toBe(1);
  expect(local.current.recentPresets).toHaveLength(1);
  expect(local.current.recentPresets[0]?.dyePreset).toBe('rift-azure');
});
