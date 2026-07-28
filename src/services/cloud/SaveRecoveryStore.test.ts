import { describe, expect, it } from 'vitest';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import { SaveRecoveryStore, recoveryReasonLabel, type RecoveryStorage } from './SaveRecoveryStore';

class MemoryStorage implements RecoveryStorage {
  private readonly data = new Map<string, string>();
  public getItem(key: string): string | null { return this.data.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.data.set(key, value); }
  public removeItem(key: string): void { this.data.delete(key); }
}

describe('SaveRecoveryStore', () => {
  it('keeps only the newest five recovery points', () => {
    const store = new SaveRecoveryStore(new MemoryStorage(), 5);
    const profile = createDefaultProfile('u1', '계승자');
    for (let index = 0; index < 7; index += 1) {
      store.capture({ ...profile, updatedAt: 100 + index, gold: index }, 'manual', 1_000 + index);
    }
    const points = store.list('u1');
    expect(points).toHaveLength(5);
    expect(points[0]?.profile.gold).toBe(6);
    expect(points[4]?.profile.gold).toBe(2);
  });

  it('deduplicates the same profile and reason', () => {
    const store = new SaveRecoveryStore(new MemoryStorage());
    const profile = { ...createDefaultProfile('u2', '계승자'), updatedAt: 200 };
    const first = store.capture(profile, 'pre-cloud-download', 1_000);
    const second = store.capture(profile, 'pre-cloud-download', 2_000);
    expect(second.id).toBe(first.id);
    expect(store.list('u2')).toHaveLength(1);
  });

  it('returns cloned profiles and Korean labels', () => {
    const store = new SaveRecoveryStore(new MemoryStorage());
    const profile = createDefaultProfile('u3', '계승자');
    const point = store.capture(profile, 'pre-logout', 1_000);
    const found = store.find('u3', point.id);
    expect(found?.profile).not.toBe(profile);
    expect(recoveryReasonLabel('pre-logout')).toBe('로그아웃 전');
  });
});
