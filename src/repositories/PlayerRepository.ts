import type { EquipmentSlot, InventoryItem } from '../game/items/itemTypes';
import { createDefaultOperationsState, normalizeOperationsState } from '../game/operations/operationsLogic';
import type { PlayerOperationsState } from '../game/operations/operationsTypes';

export const PLAYER_SAVE_VERSION = 4;

export interface StageProgress {
  clearCount: number;
  bestSeconds: number;
  firstClearReceived: boolean;
}

export interface QuestClaimState {
  claimed: boolean;
  claimedAt: number;
}

export interface PlayerStatistics {
  monstersDefeated: number;
  stagesCleared: number;
  equipmentUpgrades: number;
  itemsObtained: number;
}

export interface PlayerTutorialState {
  completed: boolean;
  skipped: boolean;
}

export interface PlayerProfile {
  readonly saveVersion: 4;
  readonly uid: string;
  nickname: string;
  level: number;
  exp: number;
  highestStage: number;
  gold: number;
  inventory: Record<string, InventoryItem>;
  equipped: Partial<Record<EquipmentSlot, string>>;
  stageProgress: Record<string, StageProgress>;
  questClaims: Record<string, QuestClaimState>;
  dailyQuestDate: string;
  dailyQuestClaims: Record<string, QuestClaimState>;
  statistics: PlayerStatistics;
  dailyStatistics: PlayerStatistics;
  tutorial: PlayerTutorialState;
  operations: PlayerOperationsState;
  updatedAt: number;
}

export interface PlayerRepository {
  load(uid: string): Promise<PlayerProfile | null>;
  save(profile: PlayerProfile): Promise<void>;
}

export function createDefaultProfile(uid: string, nickname: string): PlayerProfile {
  return {
    saveVersion: PLAYER_SAVE_VERSION,
    uid,
    nickname,
    level: 1,
    exp: 0,
    highestStage: 1,
    gold: 900,
    inventory: {},
    equipped: {},
    stageProgress: {},
    questClaims: {},
    dailyQuestDate: currentDayKey(),
    dailyQuestClaims: {},
    statistics: {
      monstersDefeated: 0,
      stagesCleared: 0,
      equipmentUpgrades: 0,
      itemsObtained: 0,
    },
    dailyStatistics: {
      monstersDefeated: 0,
      stagesCleared: 0,
      equipmentUpgrades: 0,
      itemsObtained: 0,
    },
    tutorial: { completed: false, skipped: false },
    operations: createDefaultOperationsState(),
    updatedAt: Date.now(),
  };
}

export function migratePlayerProfile(
  raw: unknown,
  uid: string,
  fallbackNickname = '계승자',
): PlayerProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createDefaultProfile(uid, fallbackNickname);
  }

  const value = raw as Record<string, unknown>;
  const inventory = parseInventory(value.inventory);
  const equipped = parseEquipped(value.equipped);

  for (const [slot, itemUid] of Object.entries(equipped)) {
    if (!itemUid || !inventory[itemUid]) delete equipped[slot as EquipmentSlot];
  }

  const today = currentDayKey();
  const storedDailyDate = typeof value.dailyQuestDate === 'string' ? value.dailyQuestDate : today;
  const dailyChanged = storedDailyDate !== today;

  return {
    saveVersion: PLAYER_SAVE_VERSION,
    uid,
    nickname: typeof value.nickname === 'string' && value.nickname.trim()
      ? value.nickname
      : fallbackNickname,
    level: positiveInteger(value.level, 1),
    exp: nonNegativeNumber(value.exp, 0),
    highestStage: positiveInteger(value.highestStage, 1),
    gold: nonNegativeNumber(value.gold, 0),
    inventory,
    equipped,
    stageProgress: parseStageProgress(value.stageProgress),
    questClaims: parseQuestClaims(value.questClaims),
    dailyQuestDate: today,
    dailyQuestClaims: dailyChanged ? {} : parseQuestClaims(value.dailyQuestClaims),
    statistics: parseStatistics(value.statistics),
    dailyStatistics: dailyChanged
      ? { monstersDefeated: 0, stagesCleared: 0, equipmentUpgrades: 0, itemsObtained: 0 }
      : parseStatistics(value.dailyStatistics),
    tutorial: parseTutorial(value.tutorial),
    operations: normalizeOperationsState(value.operations),
    updatedAt: nonNegativeNumber(value.updatedAt, Date.now()),
  };
}

export function currentDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function parseInventory(value: unknown): Record<string, InventoryItem> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, InventoryItem> = {};

  for (const [uid, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.itemId !== 'string' || item.itemId.trim() === '') continue;
    result[uid] = {
      uid,
      itemId: item.itemId,
      level: Math.max(0, positiveIntegerOrZero(item.level, 0)),
      locked: item.locked === true,
      acquiredAt: nonNegativeNumber(item.acquiredAt, Date.now()),
    };
  }

  return result;
}

function parseEquipped(value: unknown): Partial<Record<EquipmentSlot, string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const result: Partial<Record<EquipmentSlot, string>> = {};

  for (const slot of ['weapon', 'armor', 'accessory'] as const) {
    if (typeof raw[slot] === 'string') result[slot] = raw[slot];
  }
  return result;
}

function parseStageProgress(value: unknown): Record<string, StageProgress> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, StageProgress> = {};
  for (const [stageId, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const progress = raw as Record<string, unknown>;
    result[stageId] = {
      clearCount: positiveIntegerOrZero(progress.clearCount, 0),
      bestSeconds: nonNegativeNumber(progress.bestSeconds, 0),
      firstClearReceived: progress.firstClearReceived === true,
    };
  }
  return result;
}

function parseQuestClaims(value: unknown): Record<string, QuestClaimState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, QuestClaimState> = {};
  for (const [questId, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const state = raw as Record<string, unknown>;
    result[questId] = {
      claimed: state.claimed === true,
      claimedAt: nonNegativeNumber(state.claimedAt, 0),
    };
  }
  return result;
}

function parseStatistics(value: unknown): PlayerStatistics {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { monstersDefeated: 0, stagesCleared: 0, equipmentUpgrades: 0, itemsObtained: 0 };
  }
  const raw = value as Record<string, unknown>;
  return {
    monstersDefeated: positiveIntegerOrZero(raw.monstersDefeated, 0),
    stagesCleared: positiveIntegerOrZero(raw.stagesCleared, 0),
    equipmentUpgrades: positiveIntegerOrZero(raw.equipmentUpgrades, 0),
    itemsObtained: positiveIntegerOrZero(raw.itemsObtained, 0),
  };
}

function parseTutorial(value: unknown): PlayerTutorialState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { completed: false, skipped: false };
  }
  const raw = value as Record<string, unknown>;
  return { completed: raw.completed === true, skipped: raw.skipped === true };
}

function positiveInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

function positiveIntegerOrZero(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
