import { describe, expect, it } from 'vitest';
import { AutoCombatHistoryStore } from './AutoCombatHistoryStore';

class MemoryStorage {
  private readonly data = new Map<string, string>();
  public getItem(key: string): string | null { return this.data.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.data.set(key, value); }
}

const summary = {
  enabledSeconds: 10,
  strategyPreset: 'balanced' as const,
  targetChanges: 1,
  attacks: 4,
  skill1Uses: 1,
  skill2Uses: 0,
  dodges: 2,
  manualInterventions: 1,
  bossPatternDodges: { boss_nova: 1 },
  topReason: 'skill1-ready',
  recentReasons: ['skill1-ready'],
};

describe('AutoCombatHistoryStore', () => {
  it('persists newest combat sessions first', () => {
    const storage = new MemoryStorage();
    const store = new AutoCombatHistoryStore(storage);
    store.record({ stageId: '1', stageLabel: 'one', victory: true, clearSeconds: 50, maxCombo: 4, defeated: 5, summary }, 100);
    store.record({ stageId: '2', stageLabel: 'two', victory: false, clearSeconds: 80, maxCombo: 2, defeated: 3, summary }, 200);
    const restored = new AutoCombatHistoryStore(storage);
    expect(restored.current.map((entry) => entry.stageId)).toEqual(['2', '1']);
  });
});
