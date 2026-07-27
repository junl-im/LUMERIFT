import type { GameDataRegistry } from '../data/GameDataRegistry';
import { applyProfileRewards } from '../progression/battleRewards';
import type { PlayerProfile, QuestClaimState } from '../../repositories/PlayerRepository';
import type { QuestCondition, QuestDefinition } from './questTypes';

export interface QuestProgressSummary {
  readonly current: number;
  readonly target: number;
  readonly complete: boolean;
}

export function isQuestUnlocked(
  quest: QuestDefinition,
  profile: PlayerProfile,
): boolean {
  if (quest.type === 'daily' || !quest.prerequisiteQuestId) return true;
  return profile.questClaims[quest.prerequisiteQuestId]?.claimed === true;
}

export function isQuestClaimed(quest: QuestDefinition, profile: PlayerProfile): boolean {
  return quest.type === 'daily'
    ? profile.dailyQuestClaims[quest.id]?.claimed === true
    : profile.questClaims[quest.id]?.claimed === true;
}

export function getQuestProgress(
  quest: QuestDefinition,
  profile: PlayerProfile,
): QuestProgressSummary {
  const conditionProgress = quest.conditions.map((condition) => conditionValue(condition, quest, profile));
  const complete = conditionProgress.every((entry) => entry.current >= entry.target);
  const current = conditionProgress.reduce((sum, entry) => sum + Math.min(entry.current, entry.target), 0);
  const target = conditionProgress.reduce((sum, entry) => sum + entry.target, 0);
  return { current, target, complete };
}

export function claimQuestReward(
  quest: QuestDefinition,
  profile: PlayerProfile,
  registry: GameDataRegistry,
): PlayerProfile {
  if (!isQuestUnlocked(quest, profile) || isQuestClaimed(quest, profile)) return profile;
  if (!getQuestProgress(quest, profile).complete) return profile;
  for (const itemId of quest.rewards.itemIds) registry.getItem(itemId);

  const rewarded = applyProfileRewards(profile, quest.rewards);
  const state: QuestClaimState = { claimed: true, claimedAt: Date.now() };
  return quest.type === 'daily'
    ? {
      ...rewarded,
      dailyQuestClaims: { ...rewarded.dailyQuestClaims, [quest.id]: state },
      updatedAt: Date.now(),
    }
    : {
      ...rewarded,
      questClaims: { ...rewarded.questClaims, [quest.id]: state },
      updatedAt: Date.now(),
    };
}

export function countClaimableQuests(
  profile: PlayerProfile,
  registry: GameDataRegistry,
): number {
  return registry.questsInOrder.filter((quest) => (
    isQuestUnlocked(quest, profile)
    && !isQuestClaimed(quest, profile)
    && getQuestProgress(quest, profile).complete
  )).length;
}

export function conditionLabel(condition: QuestCondition, quest: QuestDefinition): string {
  if (condition.type === 'clearStage') return `${condition.targetId ?? '스테이지'} 클리어`;
  if (condition.type === 'clearAnyStage') return quest.type === 'daily' ? '오늘 스테이지 클리어' : '스테이지 클리어';
  if (condition.type === 'defeatMonster') return quest.type === 'daily' ? '오늘 몬스터 처치' : '몬스터 처치';
  if (condition.type === 'upgradeItem') return quest.type === 'daily' ? '오늘 장비 강화' : '장비 강화';
  return quest.type === 'daily' ? '오늘 장비 획득' : '장비 획득';
}

function conditionValue(
  condition: QuestCondition,
  quest: QuestDefinition,
  profile: PlayerProfile,
): { current: number; target: number } {
  const stats = quest.type === 'daily' ? profile.dailyStatistics : profile.statistics;
  if (condition.type === 'clearStage') {
    return {
      current: profile.stageProgress[condition.targetId ?? '']?.clearCount ?? 0,
      target: condition.count,
    };
  }
  if (condition.type === 'clearAnyStage') return { current: stats.stagesCleared, target: condition.count };
  if (condition.type === 'defeatMonster') return { current: stats.monstersDefeated, target: condition.count };
  if (condition.type === 'upgradeItem') return { current: stats.equipmentUpgrades, target: condition.count };
  return { current: stats.itemsObtained, target: condition.count };
}
