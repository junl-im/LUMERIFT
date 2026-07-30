import { describe, expect, it } from 'vitest';
import type { CombatAssistSettings } from './CombatAssistController';
import { AutoBattlePresetSlotStore, autoBattlePresetSlotLabel } from './AutoBattlePresetSlots';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  public getItem(key: string): string | null { return this.values.get(key) ?? null; }
  public setItem(key: string, value: string): void { this.values.set(key, value); }
}

const settings: CombatAssistSettings = {
  autoTarget: true,
  autoBattle: true,
  strategyPreset: 'custom',
  targetPriority: 'boss',
  autoSkills: true,
  autoDodge: false,
  bossAutoMode: 'full',
  devicePreset: 'responsive',
  autoSkillHpRule: 'always',
  bossDodgePolicy: 'all',
  manualResumeDelay: 'instant',
};

describe('AutoBattlePresetSlotStore', () => {
  it('saves and loads the selected custom slot', () => {
    const storage = new MemoryStorage();
    const store = new AutoBattlePresetSlotStore(storage);
    store.selectSlot(2);
    store.save(settings, 1234);
    expect(autoBattlePresetSlotLabel(store.current)).toBe('SLOT 2 · SAVED');
    expect(store.load()).toMatchObject({ targetPriority: 'boss', autoDodge: false });
  });

  it('cycles through three slots and clears only the selected slot', () => {
    const store = new AutoBattlePresetSlotStore(new MemoryStorage());
    expect(store.cycleSelectedSlot()).toBe(2);
    expect(store.cycleSelectedSlot()).toBe(3);
    store.save(settings, 1);
    store.clear();
    expect(store.load()).toBeUndefined();
  });
});
