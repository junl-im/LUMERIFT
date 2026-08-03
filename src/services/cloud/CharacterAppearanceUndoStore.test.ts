import { describe, expect, it } from 'vitest';
import { CharacterWardrobeController } from '../../core/presentation/CharacterWardrobeController';
import { CharacterAppearanceUndoStore } from './CharacterAppearanceUndoStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

function archive(now: number) {
  return new CharacterWardrobeController(new MemoryStorage()).exportPresetArchive(now);
}

describe('CharacterAppearanceUndoStore', () => {
  it('keeps one 30-minute single-use point for each UID', () => {
    const store = new CharacterAppearanceUndoStore(new MemoryStorage());
    const point = store.create('user-a', archive(100), 'appearance-1a2b3c4d', 1_000);
    expect(point.expiresAt).toBe(1_801_000);
    expect(store.peek('user-a', 1_800_999)?.mergedRevision).toBe('appearance-1a2b3c4d');
    expect(store.peek('user-b', 1_001)).toBeUndefined();
    expect(store.consume('user-a', 1_100)?.ownerUid).toBe('user-a');
    expect(store.peek('user-a', 1_101)).toBeUndefined();
  });

  it('expires stale points and rejects invalid revisions', () => {
    const store = new CharacterAppearanceUndoStore(new MemoryStorage());
    store.create('user-a', archive(100), 'appearance-deadbeef', 1_000);
    expect(store.peek('user-a', 1_801_000)).toBeUndefined();
    expect(() => store.create('user-a', archive(200), 'invalid', 2_000)).toThrow();
  });
});
