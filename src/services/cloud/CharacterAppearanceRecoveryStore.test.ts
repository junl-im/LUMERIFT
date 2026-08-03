import { describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../../app/brand';
import { CharacterWardrobeController } from '../../core/presentation/CharacterWardrobeController';
import {
  CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT,
  CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT,
  CHARACTER_APPEARANCE_RECOVERY_TOTAL_LIMIT,
  CharacterAppearanceRecoveryStore,
} from './CharacterAppearanceRecoveryStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

function archive(now: number) {
  return new CharacterWardrobeController(new MemoryStorage()).exportPresetArchive(now);
}

describe('CharacterAppearanceRecoveryStore', () => {
  it('keeps five recent points plus up to three pinned points per UID', () => {
    const store = new CharacterAppearanceRecoveryStore(new MemoryStorage());
    for (let index = 1; index <= CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT; index += 1) {
      const point = store.create('user-a', archive(index), 'manual', index, `고정 ${index}`);
      expect(store.togglePin('user-a', point.id)).toBe('pinned');
    }
    for (let index = 4; index <= 12; index += 1) store.create('user-a', archive(index), 'manual', index);
    expect(store.list('user-a')).toHaveLength(CHARACTER_APPEARANCE_RECOVERY_TOTAL_LIMIT);
    expect(store.list('user-a').filter((point) => point.pinned)).toHaveLength(CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT);
    expect(store.list('user-a').filter((point) => !point.pinned)).toHaveLength(CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT);
    expect(store.list('user-b')).toHaveLength(0);
  });

  it('renames, searches, and protects the pin limit', () => {
    const store = new CharacterAppearanceRecoveryStore(new MemoryStorage());
    const first = store.create('user-a', archive(10), 'pre-conflict-merge', 10);
    expect(store.rename('user-a', first.id, '전투형 외형 복구')?.name).toBe('전투형 외형 복구');
    expect(store.search('user-a', '전투형')).toHaveLength(1);
    for (let index = 0; index < CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT; index += 1) {
      const point = index === 0 ? first : store.create('user-a', archive(20 + index), 'manual', 20 + index);
      expect(store.togglePin('user-a', point.id)).toBe('pinned');
    }
    const overflow = store.create('user-a', archive(99), 'manual', 99);
    expect(store.togglePin('user-a', overflow.id)).toBe('limit');
  });

  it('migrates a v1 recovery archive and rejects a different UID', () => {
    const storage = new MemoryStorage();
    const legacyArchive = archive(10);
    storage.setItem(STORAGE_KEYS.characterAppearanceRecovery, JSON.stringify({
      schema: 'lumerift-character-appearance-recovery-store-v1',
      owners: {
        'user-a': [{
          schema: 'lumerift-character-appearance-recovery-point-v1',
          id: 'legacy-point',
          ownerUid: 'user-a',
          reason: 'manual',
          createdAt: 10,
          archive: legacyArchive,
        }],
      },
    }));
    const store = new CharacterAppearanceRecoveryStore(storage);
    expect(store.list('user-a')[0]?.schema).toBe('lumerift-character-appearance-recovery-point-v2');
    expect(store.list('user-a')[0]?.name).toContain('수동');
    const exported = store.export('user-a', 20);
    expect(exported.schema).toBe('lumerift-character-appearance-recovery-archive-v2');
    expect(new CharacterAppearanceRecoveryStore(new MemoryStorage()).import('user-b', exported)).toBe(0);
  });
});
