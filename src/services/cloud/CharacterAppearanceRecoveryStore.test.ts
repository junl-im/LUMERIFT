import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from '../../core/presentation/CharacterWardrobeController';
import { CharacterAppearanceRecoveryStore } from './CharacterAppearanceRecoveryStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CharacterAppearanceRecoveryStore', () => {
  it('keeps at most five UID-isolated recovery points', () => {
    const storage = new MemoryStorage();
    const store = new CharacterAppearanceRecoveryStore(storage);
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    for (let index = 1; index <= 7; index += 1) store.create('user-a', wardrobe.exportPresetArchive(index), 'manual', index);
    expect(store.list('user-a')).toHaveLength(5);
    expect(store.list('user-b')).toHaveLength(0);
    expect(store.list('user-a')[0]?.createdAt).toBe(7);
    store.create('user-b', wardrobe.exportPresetArchive(8), 'manual', 8);
    expect(store.list('user-a')).toHaveLength(5);
    expect(store.list('user-b')).toHaveLength(1);
  });

  it('exports and imports only for the matching owner UID', () => {
    const source = new CharacterAppearanceRecoveryStore(new MemoryStorage());
    const wardrobe = new CharacterWardrobeController(new MemoryStorage());
    source.create('user-a', wardrobe.exportPresetArchive(10), 'pre-conflict-merge', 10);
    const archive = source.export('user-a', 20);
    const target = new CharacterAppearanceRecoveryStore(new MemoryStorage());
    expect(target.import('user-a', archive)).toBe(1);
    expect(target.import('user-b', archive)).toBe(0);
  });
});
