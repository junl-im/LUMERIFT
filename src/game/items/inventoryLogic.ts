import type { PlayerCombatConfig } from '../combat/combatData';
import type { GameDataRegistry } from '../data/GameDataRegistry';
import type { PlayerProfile } from '../../repositories/PlayerRepository';
import type {
  EquipmentSlot,
  InventoryItem,
  ItemDefinition,
  ItemGrade,
  ItemStats,
} from './itemTypes';

export const STARTER_ITEM_IDS = [
  'weapon_rift_blade_common',
  'armor_scout_common',
  'accessory_lumen_common',
] as const;

export interface EquipmentSummary extends ItemStats {
  readonly power: number;
}

export type InventorySortMode = 'power' | 'grade' | 'recent';

let fallbackUid = 0;

export function createInventoryItem(
  itemId: string,
  uidFactory: () => string = createUid,
  acquiredAt = Date.now(),
): InventoryItem {
  const uid = uidFactory();
  return {
    uid,
    itemId,
    level: 0,
    locked: false,
    acquiredAt,
  };
}

export function ensureStarterInventory(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  uidFactory: () => string = createUid,
): PlayerProfile {
  if (Object.keys(profile.inventory).length > 0) return profile;

  const inventory = { ...profile.inventory };
  const equipped = { ...profile.equipped };

  for (const itemId of STARTER_ITEM_IDS) {
    const definition = registry.getItem(itemId);
    const item = createInventoryItem(itemId, uidFactory);
    inventory[item.uid] = item;
    equipped[definition.slot] = item.uid;
  }

  return { ...profile, inventory, equipped, updatedAt: Date.now() };
}

export function calculateItemStats(definition: ItemDefinition, level: number): ItemStats {
  const multiplier = 1 + Math.max(0, level) * 0.12;
  return {
    attack: Math.round(definition.baseStats.attack * multiplier),
    defense: Math.round(definition.baseStats.defense * multiplier),
    maxHp: Math.round(definition.baseStats.maxHp * multiplier),
  };
}

export function calculateItemPower(definition: ItemDefinition, level: number): number {
  const stats = calculateItemStats(definition, level);
  return Math.round(stats.attack * 3 + stats.defense * 2.2 + stats.maxHp * 0.18);
}

export function calculateEquipmentSummary(
  profile: PlayerProfile,
  registry: GameDataRegistry,
): EquipmentSummary {
  let attack = 0;
  let defense = 0;
  let maxHp = 0;

  for (const itemUid of Object.values(profile.equipped)) {
    if (!itemUid) continue;
    const item = profile.inventory[itemUid];
    if (!item) continue;
    const definition = registry.getItem(item.itemId);
    const stats = calculateItemStats(definition, item.level);
    attack += stats.attack;
    defense += stats.defense;
    maxHp += stats.maxHp;
  }

  return {
    attack,
    defense,
    maxHp,
    power: Math.round(attack * 3 + defense * 2.2 + maxHp * 0.18),
  };
}

export function calculateTotalPower(
  base: PlayerCombatConfig,
  profile: PlayerProfile,
  registry: GameDataRegistry,
): number {
  const equipment = calculateEquipmentSummary(profile, registry);
  const basePower = base.attack * 3 + base.defense * 2.2 + base.maxHp * 0.18;
  return Math.round(basePower + equipment.power + Math.max(0, profile.level - 1) * 18);
}

export function buildPlayerCombatConfig(
  base: PlayerCombatConfig,
  profile: PlayerProfile,
  registry: GameDataRegistry,
): PlayerCombatConfig {
  const equipment = calculateEquipmentSummary(profile, registry);
  const levelBonus = Math.max(0, profile.level - 1);
  return {
    ...base,
    maxHp: base.maxHp + equipment.maxHp + levelBonus * 16,
    attack: base.attack + equipment.attack + levelBonus * 3,
    defense: base.defense + equipment.defense + levelBonus * 2,
  };
}

export function equipItem(
  profile: PlayerProfile,
  itemUid: string,
  registry: GameDataRegistry,
): PlayerProfile {
  const item = requireItem(profile, itemUid);
  const definition = registry.getItem(item.itemId);
  return {
    ...profile,
    equipped: { ...profile.equipped, [definition.slot]: itemUid },
    updatedAt: Date.now(),
  };
}

export function unequipSlot(profile: PlayerProfile, slot: EquipmentSlot): PlayerProfile {
  const equipped = { ...profile.equipped };
  delete equipped[slot];
  return { ...profile, equipped, updatedAt: Date.now() };
}

export function toggleItemLock(profile: PlayerProfile, itemUid: string): PlayerProfile {
  const item = requireItem(profile, itemUid);
  return {
    ...profile,
    inventory: {
      ...profile.inventory,
      [itemUid]: { ...item, locked: !item.locked },
    },
    updatedAt: Date.now(),
  };
}

export function upgradeItem(
  profile: PlayerProfile,
  itemUid: string,
  registry: GameDataRegistry,
): PlayerProfile {
  const item = requireItem(profile, itemUid);
  const definition = registry.getItem(item.itemId);
  if (item.level >= definition.maxUpgrade) return profile;
  const cost = upgradeCost(definition, item.level);
  if (profile.gold < cost) return profile;

  return {
    ...profile,
    gold: profile.gold - cost,
    inventory: {
      ...profile.inventory,
      [itemUid]: { ...item, level: item.level + 1 },
    },
    statistics: {
      ...profile.statistics,
      equipmentUpgrades: profile.statistics.equipmentUpgrades + 1,
    },
    dailyStatistics: {
      ...profile.dailyStatistics,
      equipmentUpgrades: profile.dailyStatistics.equipmentUpgrades + 1,
    },
    updatedAt: Date.now(),
  };
}

export function upgradeCost(definition: ItemDefinition, currentLevel: number): number {
  return Math.round(definition.upgradeBaseCost * (1 + currentLevel * 0.55));
}

export function sellItem(
  profile: PlayerProfile,
  itemUid: string,
  registry: GameDataRegistry,
): PlayerProfile {
  const item = requireItem(profile, itemUid);
  if (item.locked || Object.values(profile.equipped).includes(itemUid)) return profile;
  const definition = registry.getItem(item.itemId);
  const inventory = { ...profile.inventory };
  delete inventory[itemUid];

  return {
    ...profile,
    gold: profile.gold + sellValue(definition, item.level),
    inventory,
    updatedAt: Date.now(),
  };
}

export function bulkSellCommon(
  profile: PlayerProfile,
  registry: GameDataRegistry,
): PlayerProfile {
  let gold = profile.gold;
  const equipped = new Set(Object.values(profile.equipped));
  const inventory: Record<string, InventoryItem> = {};

  for (const [uid, item] of Object.entries(profile.inventory)) {
    const definition = registry.getItem(item.itemId);
    if (definition.grade === 'common' && !item.locked && !equipped.has(uid)) {
      gold += sellValue(definition, item.level);
    } else {
      inventory[uid] = item;
    }
  }

  return { ...profile, gold, inventory, updatedAt: Date.now() };
}

export function sortInventory(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  mode: InventorySortMode,
  slot?: EquipmentSlot,
): InventoryItem[] {
  const gradeWeight: Record<ItemGrade, number> = { common: 1, rare: 2, heroic: 3 };
  return Object.values(profile.inventory)
    .filter((item) => !slot || registry.getItem(item.itemId).slot === slot)
    .sort((left, right) => {
      const leftDefinition = registry.getItem(left.itemId);
      const rightDefinition = registry.getItem(right.itemId);
      if (mode === 'recent') return right.acquiredAt - left.acquiredAt;
      if (mode === 'grade') {
        return gradeWeight[rightDefinition.grade] - gradeWeight[leftDefinition.grade]
          || right.level - left.level;
      }
      return calculateItemPower(rightDefinition, right.level)
        - calculateItemPower(leftDefinition, left.level);
    });
}

export function isEquipped(profile: PlayerProfile, itemUid: string): boolean {
  return Object.values(profile.equipped).includes(itemUid);
}

export function sellValue(definition: ItemDefinition, level: number): number {
  return definition.sellPrice + Math.round(definition.upgradeBaseCost * level * 0.35);
}

function requireItem(profile: PlayerProfile, itemUid: string): InventoryItem {
  const item = profile.inventory[itemUid];
  if (!item) throw new Error(`인벤토리 아이템이 없습니다: ${itemUid}`);
  return item;
}

function createUid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackUid += 1;
  return `item_${Date.now()}_${fallbackUid}`;
}
