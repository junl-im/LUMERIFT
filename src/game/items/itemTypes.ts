export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type ItemGrade = 'common' | 'rare' | 'heroic';

export interface ItemStats {
  readonly attack: number;
  readonly defense: number;
  readonly maxHp: number;
}

export interface ItemDefinition {
  readonly id: string;
  readonly name: string;
  readonly slot: EquipmentSlot;
  readonly grade: ItemGrade;
  readonly baseStats: ItemStats;
  readonly sellPrice: number;
  readonly upgradeBaseCost: number;
  readonly maxUpgrade: number;
}

export interface InventoryItem {
  readonly uid: string;
  readonly itemId: string;
  level: number;
  locked: boolean;
  readonly acquiredAt: number;
}
