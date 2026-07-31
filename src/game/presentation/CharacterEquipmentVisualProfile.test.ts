import { describe, expect, it } from 'vitest';
import {
  materialFrameKey,
  resolveEquipmentLayerMaskProfile,
  resolveWeaponVisualFamily,
  weaponVisualFamilyLabel,
} from './CharacterEquipmentVisualProfile';

describe('CharacterEquipmentVisualProfile', () => {
  it('maps slot and grade to the premium material atlas key', () => {
    expect(materialFrameKey('weapon', 'heroic')).toBe('equipment_material.weapon.heroic');
    expect(materialFrameKey('armor', 'rare')).toBe('equipment_material.armor.rare');
  });

  it('maps equipment ids to distinct weapon silhouette families', () => {
    expect(resolveWeaponVisualFamily('weapon_rift_blade_common')).toBe('blade');
    expect(resolveWeaponVisualFamily('weapon_rift_blade_rare')).toBe('greatblade');
    expect(resolveWeaponVisualFamily('weapon_heir_heroic')).toBe('riftlance');
    expect(weaponVisualFamilyLabel('riftlance')).toBe('균열 장창');
  });

  it('maps each armor and accessory item to a distinct procedural layer mask', () => {
    expect(resolveEquipmentLayerMaskProfile('armor_scout_common', 'accessory_lumen_common')).toMatchObject({
      armor: 'scout-chevron', cape: 'scout-sash', rune: 'lumen-orbit',
    });
    expect(resolveEquipmentLayerMaskProfile('armor_warden_rare', 'accessory_core_rare')).toMatchObject({
      armor: 'warden-bastion', cape: 'warden-split', rune: 'core-hex',
    });
    expect(resolveEquipmentLayerMaskProfile('armor_harbinger_heroic', 'accessory_rift_heroic')).toMatchObject({
      armor: 'harbinger-crown', cape: 'harbinger-banner', rune: 'rift-crown',
    });
  });
});
