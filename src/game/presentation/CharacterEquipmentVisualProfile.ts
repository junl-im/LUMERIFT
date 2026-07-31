import type { GameDataRegistry } from '../data/GameDataRegistry';
import type { EquipmentSlot, ItemDefinition, ItemGrade } from '../items/itemTypes';
import type { PlayerProfile } from '../../repositories/PlayerRepository';
import { resolveCharacterDyeProfile, type CharacterDyePreset } from '../../core/presentation/CharacterDyeController';
import type {
  CharacterCostumeSet,
  CharacterDyeChannels,
} from '../../core/presentation/CharacterWardrobeController';

export type WeaponVisualFamily = 'blade' | 'greatblade' | 'riftlance';
export type CharacterCapeStyle = 'short-scout' | 'split-warden' | 'long-harbinger';
export type CharacterArmorSilhouette = 'light' | 'guarded' | 'royal';

export interface CharacterAppearanceOptions {
  readonly costumeSet?: CharacterCostumeSet;
  readonly dyeChannels?: CharacterDyeChannels;
  readonly equipmentOverrides?: Readonly<Partial<Record<EquipmentSlot, string>>>;
}

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
  readonly weaponVisualFamily: WeaponVisualFamily;
  readonly setHarmony: boolean;
  readonly setLabel: string;
  readonly dyePreset: CharacterDyePreset;
  readonly bodyTint: number;
  readonly materialFrameKeys: Readonly<Record<EquipmentSlot, string>>;
  readonly costumeSet: CharacterCostumeSet;
  readonly costumeLabel: string;
  readonly dyeChannels: CharacterDyeChannels;
  readonly capeStyle: CharacterCapeStyle;
  readonly armorSilhouette: CharacterArmorSilhouette;
}

const DEFAULT_DYE_CHANNELS: CharacterDyeChannels = { primary: 1, secondary: 1, rune: 1 };

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

const COSTUME_STYLE: Readonly<Record<CharacterCostumeSet, {
  readonly label: string;
  readonly accentColor: number;
  readonly bodyTint: number;
  readonly auraMultiplier: number;
  readonly capeStyle: CharacterCapeStyle;
  readonly armorSilhouette: CharacterArmorSilhouette;
}>> = {
  'scout-steel': {
    label: 'SCOUT STEEL',
    accentColor: 0x83c9d8,
    bodyTint: 0xf0f6f5,
    auraMultiplier: 0.9,
    capeStyle: 'short-scout',
    armorSilhouette: 'light',
  },
  'warden-rift': {
    label: 'WARDEN RIFT',
    accentColor: 0x58e0d5,
    bodyTint: 0xe3fffb,
    auraMultiplier: 1,
    capeStyle: 'split-warden',
    armorSilhouette: 'guarded',
  },
  'harbinger-heir': {
    label: 'HARBINGER HEIR',
    accentColor: 0xffcf74,
    bodyTint: 0xfff2d8,
    auraMultiplier: 1.12,
    capeStyle: 'long-harbinger',
    armorSilhouette: 'royal',
  },
};

export function resolveCharacterEquipmentAppearance(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  dyePreset: CharacterDyePreset = 'heir-gold',
  options: CharacterAppearanceOptions = {},
): CharacterEquipmentAppearance {
  const costumeSet = options.costumeSet ?? 'scout-steel';
  const dyeChannels = options.dyeChannels ?? DEFAULT_DYE_CHANNELS;
  const weaponDefinition = definitionForSlot(profile, registry, 'weapon', options.equipmentOverrides);
  const armorDefinition = definitionForSlot(profile, registry, 'armor', options.equipmentOverrides);
  const accessoryDefinition = definitionForSlot(profile, registry, 'accessory', options.equipmentOverrides);
  const weaponGrade = weaponDefinition?.grade ?? 'common';
  const armorGrade = armorDefinition?.grade ?? 'common';
  const accessoryGrade = accessoryDefinition?.grade ?? 'common';
  const dominantGrade = [weaponGrade, armorGrade, accessoryGrade]
    .sort((left, right) => GRADE_WEIGHT[right] - GRADE_WEIGHT[left])[0] ?? 'common';
  const style = GRADE_STYLE[dominantGrade];
  const dye = resolveCharacterDyeProfile(dyePreset);
  const costume = COSTUME_STYLE[costumeSet];
  const setHarmony = weaponGrade === armorGrade && armorGrade === accessoryGrade;
  const primaryBase = blendColor(style.primaryColor, dye.primaryColor, 0.56);
  const secondaryBase = blendColor(style.secondaryColor, dye.secondaryColor, 0.58);
  const runeBase = blendColor(style.runeColor, dye.runeColor, 0.68);
  const primaryColor = applyChannel(primaryBase, dyeChannels.primary, costume.accentColor);
  const secondaryColor = applyChannel(secondaryBase, dyeChannels.secondary, costume.accentColor);
  const runeColor = applyChannel(runeBase, dyeChannels.rune, 0xffffff);
  const runeMultiplier = dyeChannels.rune === 0 ? 0.78 : dyeChannels.rune === 2 ? 1.14 : 1;

  return {
    weaponGrade,
    armorGrade,
    accessoryGrade,
    dominantGrade,
    label: `${style.label} · ${costume.label}`,
    primaryColor,
    secondaryColor,
    runeColor,
    weaponTrailColor: applyChannel(
      blendColor(GRADE_STYLE[weaponGrade].weaponTrailColor, dye.weaponTrailColor, 0.64),
      dyeChannels.rune,
      runeColor,
    ),
    auraStrength: ((style.auraStrength + GRADE_STYLE[accessoryGrade].auraStrength) / 2)
      * (setHarmony ? 1.08 : 1)
      * costume.auraMultiplier
      * runeMultiplier,
    weaponVisualFamily: resolveWeaponVisualFamily(weaponDefinition?.id),
    setHarmony,
    setLabel: setHarmony ? `${style.label} SET` : `${style.label} MIX`,
    dyePreset,
    bodyTint: blendColor(dye.tint, costume.bodyTint, 0.34),
    materialFrameKeys: {
      weapon: materialFrameKey('weapon', weaponGrade),
      armor: materialFrameKey('armor', armorGrade),
      accessory: materialFrameKey('accessory', accessoryGrade),
    },
    costumeSet,
    costumeLabel: costume.label,
    dyeChannels,
    capeStyle: costume.capeStyle,
    armorSilhouette: costume.armorSilhouette,
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

export function resolveWeaponVisualFamily(itemId: string | undefined): WeaponVisualFamily {
  if (itemId?.includes('heroic')) return 'riftlance';
  if (itemId?.includes('rare')) return 'greatblade';
  return 'blade';
}

export function weaponVisualFamilyLabel(value: WeaponVisualFamily): string {
  if (value === 'greatblade') return '대검';
  if (value === 'riftlance') return '균열 장창';
  return '균열검';
}

export function characterCapeStyleLabel(value: CharacterCapeStyle): string {
  if (value === 'split-warden') return '분할 감시자 망토';
  if (value === 'long-harbinger') return '장식형 전령 망토';
  return '단형 정찰 망토';
}

function applyChannel(base: number, level: 0 | 1 | 2, accent: number): number {
  if (level === 0) return blendColor(base, 0x081018, 0.28);
  if (level === 2) return blendColor(base, accent, 0.28);
  return base;
}

function blendColor(base: number, overlay: number, ratio: number): number {
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const inverse = 1 - safeRatio;
  const red = Math.round(((base >> 16) & 0xff) * inverse + ((overlay >> 16) & 0xff) * safeRatio);
  const green = Math.round(((base >> 8) & 0xff) * inverse + ((overlay >> 8) & 0xff) * safeRatio);
  const blue = Math.round((base & 0xff) * inverse + (overlay & 0xff) * safeRatio);
  return (red << 16) | (green << 8) | blue;
}

function definitionForSlot(
  profile: PlayerProfile,
  registry: GameDataRegistry,
  slot: EquipmentSlot,
  overrides: CharacterAppearanceOptions['equipmentOverrides'],
): ItemDefinition | undefined {
  const overrideId = overrides?.[slot];
  if (overrideId) {
    try {
      const definition = registry.getItem(overrideId);
      return definition.slot === slot ? definition : equippedDefinition(profile, registry, slot);
    } catch {
      return equippedDefinition(profile, registry, slot);
    }
  }
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
