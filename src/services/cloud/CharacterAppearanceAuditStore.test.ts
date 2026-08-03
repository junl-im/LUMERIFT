import { describe, expect, it } from 'vitest';
import { CHARACTER_APPEARANCE_AUDIT_LIMIT, CharacterAppearanceAuditStore } from './CharacterAppearanceAuditStore';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

describe('CharacterAppearanceAuditStore', () => {
  it('keeps account-scoped records and exports selected recovery history', () => {
    const store = new CharacterAppearanceAuditStore(new MemoryStorage());
    store.record('user-a', { action: 'recovery-created', title: 'A', recoveryPointIds: ['point-a'] }, 10);
    store.record('user-a', { action: 'recovery-restored', title: 'B', recoveryPointIds: ['point-b'] }, 20);
    store.record('user-b', { action: 'recovery-created', title: 'C', recoveryPointIds: ['point-a'] }, 30);
    expect(store.list('user-a')).toHaveLength(2);
    expect(store.list('user-b')).toHaveLength(1);
    const exported = store.export('user-a', ['point-a'], 40);
    expect(exported.records).toHaveLength(1);
    expect(exported.records[0]?.title).toBe('A');
  });

  it('limits records per account', () => {
    const store = new CharacterAppearanceAuditStore(new MemoryStorage());
    for (let index = 1; index <= CHARACTER_APPEARANCE_AUDIT_LIMIT + 10; index += 1) {
      store.record('user-a', { action: 'cloud-sync-checked', title: `sync-${index}` }, index);
    }
    expect(store.list('user-a')).toHaveLength(CHARACTER_APPEARANCE_AUDIT_LIMIT);
    expect(store.list('user-a')[0]?.title).toBe(`sync-${CHARACTER_APPEARANCE_AUDIT_LIMIT + 10}`);
  });
});
