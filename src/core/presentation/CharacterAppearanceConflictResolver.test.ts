import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController, type CharacterWardrobeArchive } from './CharacterWardrobeController';
import {
  DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN,
  mergeCharacterAppearanceArchives,
  previewCharacterAppearanceConflict,
  simulateCharacterAppearanceMerge,
} from './CharacterAppearanceConflictResolver';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

function wardrobeArchive(dye: 'heir-gold' | 'rift-azure', savedAt: number): CharacterWardrobeArchive {
  const wardrobe = new CharacterWardrobeController(new MemoryStorage());
  wardrobe.rememberCurrentPreset(dye, savedAt);
  wardrobe.saveSelectedSlot(dye, savedAt);
  return wardrobe.exportPresetArchive(savedAt + 1);
}

describe('CharacterAppearanceConflictResolver', () => {
  it('previews slot, order, lock, and preset differences', () => {
    const local = wardrobeArchive('heir-gold', 100);
    const remoteBase = wardrobeArchive('rift-azure', 200);
    const remote: CharacterWardrobeArchive = { ...remoteBase, slotOrder: [3, 2, 1], lockedSlots: { 1: false, 2: true, 3: false } };
    const preview = previewCharacterAppearanceConflict(local, remote);
    expect(preview.slotDifferences[0]?.status).toBe('different');
    expect(preview.slotOrderChanged).toBe(true);
    expect(preview.lockedSlotsChanged).toBe(true);
    expect(preview.totalDifferenceCount).toBeGreaterThan(0);
  });

  it('protects a locally locked slot even when remote is selected', () => {
    const localWardrobe = new CharacterWardrobeController(new MemoryStorage());
    localWardrobe.saveSelectedSlot('heir-gold', 100);
    localWardrobe.toggleSlotLock(1);
    const local = localWardrobe.exportPresetArchive(150);
    const remote = wardrobeArchive('rift-azure', 300);
    const merged = mergeCharacterAppearanceArchives(local, remote, {
      ...DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN,
      slots: { 1: 'remote', 2: 'remote', 3: 'remote' },
    }, 400);
    expect(merged.slots[1]?.dyePreset).toBe('heir-gold');
  });

  it('simulates the final archive and reports the effective source per slot', () => {
    const localWardrobe = new CharacterWardrobeController(new MemoryStorage());
    localWardrobe.saveSelectedSlot('heir-gold', 100);
    localWardrobe.toggleSlotLock(1);
    const local = localWardrobe.exportPresetArchive(150);
    const remote = wardrobeArchive('rift-azure', 300);
    const simulation = simulateCharacterAppearanceMerge(local, remote, {
      ...DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN,
      slots: { 1: 'remote', 2: 'remote', 3: 'newer' },
      lockedSlots: 'union',
      presets: 'merge',
    }, 400);
    expect(simulation.slots[0]?.requestedSource).toBe('remote');
    expect(simulation.slots[0]?.effectiveSource).toBe('local');
    expect(simulation.slots[0]?.protectedByLocalLock).toBe(true);
    expect(simulation.archive.slots[1]?.dyePreset).toBe('heir-gold');
    expect(simulation.resultSummary.join(' ')).toContain('최근 프리셋');
  });

  it('merges duplicate appearance presets and keeps favorites', () => {
    const local = wardrobeArchive('heir-gold', 100);
    const remoteWardrobe = new CharacterWardrobeController(new MemoryStorage());
    remoteWardrobe.rememberCurrentPreset('heir-gold', 200);
    remoteWardrobe.toggleRecentFavorite(0);
    const remote = remoteWardrobe.exportPresetArchive(250);
    const merged = mergeCharacterAppearanceArchives(local, remote, DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN, 300);
    expect(merged.presets).toHaveLength(1);
    expect(merged.presets[0]?.favorite).toBe(true);
    expect(merged.presets[0]?.savedAt).toBe(200);
  });
});
