import { describe, expect, it } from 'vitest';
import { GameDataRegistry } from '../data/GameDataRegistry';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import {
  calculateEquipmentSummary,
  ensureStarterInventory,
  equipItem,
  sellItem,
  toggleItemLock,
  upgradeItem,
} from './inventoryLogic';

const registry = new GameDataRegistry();

describe('inventory logic', () => {
  it('creates and equips three starter items', () => {
    let index = 0;
    const profile = ensureStarterInventory(
      createDefaultProfile('u', 'p'),
      registry,
      () => `item-${index += 1}`,
    );
    expect(Object.keys(profile.inventory)).toHaveLength(3);
    expect(profile.equipped.weapon).toBeDefined();
    expect(calculateEquipmentSummary(profile, registry).power).toBeGreaterThan(0);
  });

  it('upgrades using gold and prevents locked sale', () => {
    let index = 0;
    const profile = ensureStarterInventory(
      createDefaultProfile('u', 'p'),
      registry,
      () => `item-${index += 1}`,
    );
    const weaponUid = profile.equipped.weapon!;
    const upgraded = upgradeItem(profile, weaponUid, registry);
    expect(upgraded.inventory[weaponUid]?.level).toBe(1);
    expect(upgraded.gold).toBeLessThan(profile.gold);

    const locked = toggleItemLock(upgraded, weaponUid);
    expect(sellItem(locked, weaponUid, registry).inventory[weaponUid]).toBeDefined();
  });

  it('equips an inventory item into its matching slot', () => {
    const profile = ensureStarterInventory(
      createDefaultProfile('u', 'p'),
      registry,
      (() => {
        let index = 0;
        return () => `item-${index += 1}`;
      })(),
    );
    const armor = Object.values(profile.inventory)
      .find((item) => registry.getItem(item.itemId).slot === 'armor')!;
    expect(equipItem(profile, armor.uid, registry).equipped.armor).toBe(armor.uid);
  });
});
