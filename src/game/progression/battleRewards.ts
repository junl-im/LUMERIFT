import type { StageConfig } from '../combat/combatData';
import { createInventoryItem } from '../items/inventoryLogic';
import type { PlayerProfile } from '../../repositories/PlayerRepository';

export interface BattleRewards {
  readonly exp: number;
  readonly gold: number;
  readonly itemIds?: readonly string[];
}

export interface StageClearResult {
  readonly profile: PlayerProfile;
  readonly firstClear: boolean;
  readonly exp: number;
  readonly gold: number;
  readonly itemIds: readonly string[];
}

export function applyBattleRewards(profile: PlayerProfile, rewards: BattleRewards): PlayerProfile {
  return applyProfileRewards(profile, rewards, true);
}

export function applyStageVictory(
  profile: PlayerProfile,
  stage: StageConfig,
  defeated: number,
  clearSeconds: number,
  droppedItemIds: readonly string[],
): StageClearResult {
  const previous = profile.stageProgress[stage.id];
  const firstClear = !previous?.firstClearReceived;
  const bonus = firstClear ? stage.rewards.firstClear : { exp: 0, gold: 0, itemIds: [] };
  const itemIds = [...droppedItemIds, ...bonus.itemIds];
  const exp = stage.rewards.exp + bonus.exp;
  const gold = stage.rewards.gold + bonus.gold;
  const rewarded = applyProfileRewards(profile, { exp, gold, itemIds }, false);
  const oldBest = previous?.bestSeconds ?? 0;
  const bestSeconds = oldBest === 0 ? clearSeconds : Math.min(oldBest, clearSeconds);

  return {
    firstClear,
    exp,
    gold,
    itemIds,
    profile: {
      ...rewarded,
      highestStage: Math.max(rewarded.highestStage, stage.order + 1),
      stageProgress: {
        ...rewarded.stageProgress,
        [stage.id]: {
          clearCount: (previous?.clearCount ?? 0) + 1,
          bestSeconds,
          firstClearReceived: true,
        },
      },
      statistics: {
        ...rewarded.statistics,
        monstersDefeated: rewarded.statistics.monstersDefeated + defeated,
        stagesCleared: rewarded.statistics.stagesCleared + 1,
      },
      dailyStatistics: {
        ...rewarded.dailyStatistics,
        monstersDefeated: rewarded.dailyStatistics.monstersDefeated + defeated,
        stagesCleared: rewarded.dailyStatistics.stagesCleared + 1,
      },
      tutorial: stage.order === 1
        ? { completed: true, skipped: false }
        : rewarded.tutorial,
      updatedAt: Date.now(),
    },
  };
}

export function applyProfileRewards(
  profile: PlayerProfile,
  rewards: BattleRewards,
  countItems = true,
): PlayerProfile {
  let level = profile.level;
  let exp = profile.exp + rewards.exp;
  let required = requiredExp(level);
  const inventory = { ...profile.inventory };
  const itemIds = rewards.itemIds ?? [];

  while (exp >= required) {
    exp -= required;
    level += 1;
    required = requiredExp(level);
  }

  for (const itemId of itemIds) {
    const item = createInventoryItem(itemId);
    inventory[item.uid] = item;
  }

  const obtained = countItems ? itemIds.length : itemIds.length;
  return {
    ...profile,
    level,
    exp,
    gold: profile.gold + rewards.gold,
    inventory,
    statistics: {
      ...profile.statistics,
      itemsObtained: profile.statistics.itemsObtained + obtained,
    },
    dailyStatistics: {
      ...profile.dailyStatistics,
      itemsObtained: profile.dailyStatistics.itemsObtained + obtained,
    },
    updatedAt: Date.now(),
  };
}

export function resolveStageDrops(
  stage: StageConfig,
  random: () => number = Math.random,
  maxDrops = 3,
): string[] {
  const drops: string[] = [];

  for (const entry of stage.rewards.dropTable) {
    if (drops.length >= maxDrops) break;
    if (random() <= entry.chance) drops.push(entry.itemId);
  }

  if (drops.length === 0 && stage.rewards.dropTable[0]) {
    drops.push(stage.rewards.dropTable[0].itemId);
  }

  return drops;
}

export function requiredExp(level: number): number {
  return 100 + Math.max(0, level - 1) * 45;
}
