import { describe, expect, it } from 'vitest';
import { GameDataRegistry } from '../data/GameDataRegistry';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import { claimQuestReward, getQuestProgress, isQuestUnlocked } from './questLogic';

const registry = new GameDataRegistry();

describe('quest progression', () => {
  it('tracks stage clear quests and grants rewards once', () => {
    const quest = registry.getQuest('main_001');
    const base = createDefaultProfile('quest-user', '계승자');
    const ready = {
      ...base,
      stageProgress: {
        stage_001: { clearCount: 1, bestSeconds: 45, firstClearReceived: true },
      },
    };

    expect(getQuestProgress(quest, ready).complete).toBe(true);
    const claimed = claimQuestReward(quest, ready, registry);
    expect(claimed.gold).toBe(ready.gold + quest.rewards.gold);
    expect(claimed.questClaims[quest.id]?.claimed).toBe(true);
    expect(claimQuestReward(quest, claimed, registry)).toBe(claimed);
  });

  it('locks chained main quests until the prerequisite reward is claimed', () => {
    const profile = createDefaultProfile('quest-user-2', '계승자');
    expect(isQuestUnlocked(registry.getQuest('main_002'), profile)).toBe(false);
  });
});
