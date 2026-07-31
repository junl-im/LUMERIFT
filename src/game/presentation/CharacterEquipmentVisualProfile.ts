import type { GameDataRegistry } from '../data/GameDataRegistry';
import type { EquipmentSlot, ItemDefinition, ItemGrade } from '../items/itemTypes';
import type { PlayerProfile } from '../../repositories/PlayerRepository';

export interface CharacterEquipmentAppearance {
  readonly weaponGrade: ItemGrade;
  readonly armorGrade: ItemGrade;
  readonly accessoryGrade: ItemGrade;
  readonly dominantGrade: ItemGrade;
  readonly label: string;
  readonly primaryColor: number;
  readonly secondaryColor: number;
  readonly runeColor: number;
  readonly weaponTrailColor: number;
  readonly auraStrength: number;
  readonly materialFrameKeys: Readonly<Record<EquipmentSlot, string>>;
}

const GRADE_WEIGHT: Readonly<Record<ItemGrade, number>> = {
  common: 1,
  rare: 2,
  heroic: 3,
};

const GRADE_STYLE: Readonly<Record<ItemGrade, {
  readonly label: string;
  readonly primaryColor: number;
  readonly secondaryColor: number;
  readonly runeColor: number;
  readonly weaponTrailColor: number;
  readonly auraStrength: number;
}>> = {
  common: {
    label: 'STEEL',
    primaryColor: 0x9fb4bd,
    secondaryColor: 0xdfe9ec,
    runeColor: 0x76d9ce,
    weaponTrailColor: 0xa8f3e8,
    auraStrength: 0.82,
  },
  rare: {
    label: 'RIFT BLUE',
    primaryColor: 0x47cde9,
    secondaryColor: 0x7ff5df,
    runeColor: 0x76f8e4,
    weaponTrailColor: 0x62e9ff,
    auraStrength: 1,
  },
  heroic: {
    label: 'HEIR GOLD',
    primaryColor: 0xc57aff,
    secondaryColor: 0xffd77c,
    runeColor: 0xffe2a0,
    weaponTrailColor: 0xffcf70,
    auraStrength: 1.22,
  },
};

export function resolveCharacterEquipmentAppearance(
  profile: PlayerProfile,
  registry: GameDataRegistry,
): CharacterEquipmentAppearance {
  const weaponGrade = equippedDefinition(profile, registry, 'weapon')?.grade ?? 'common';
  const armorGrade = equippedDefinition(profile, registry, 'armor')?.grade ?? 'common';
  const accessoryGrade = equippedDefinition(profile, registry, 'accessory')?.grade ?? 'common';
  const dominantGrade = [weaponGrade, armorGrade, accessoryGrade]
    .sort((left, right) => GRADE_WEIGHT[right] - GRADE_WEIGHT[left])[0] ?? 'common';
  const style = GRADE_STYLE[dominantGrade];

  return {
    weaponGrade,
    armorGrade,
    accessoryGrade,
    dominantGrade,
    label: style.label,
    primaryColor: style.primaryColor,
    secondaryColor: style.secondaryColor,
    runeColor: style.runeColor,
    weaponTrailColor: GRADE_STYLE[weaponGrade].weaponTrailColor,
    auraStrength: (style.auraStrength + GRADE_STYLE[accessoryGrade].auraStrength) / 2,
    materialFrameKeys: {
      weapon: materialFrameKey('weapon', weaponGrade),
      armor: materialFrameKey('armor', armorGrade),
      accessory: materialFrameKey('accessory', accessoryGrade),
    },
  };
}

export function materialFrameKey(slot: EquipmentSlot, grade: ItemGrade): string {
  return `equipment_material.${slot}.${grade}`;
}

export function resolveEquipmentDefinition(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  slot: EquipmentSlot,
): ItemDefinition | undefined {
  return equippedDefinition(profile, registry, slot);
}

function equippedDefinition(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  slot: EquipmentSlot,
): ItemDefinition | undefined {
  const uid = profile.equipped[slot];
  const item = uid ? profile.inventory[uid] : undefined;
  if (!item) return undefined;
  try {
    return registry.getItem(item.itemId);
  } catch {
    return undefined;
  }
}
