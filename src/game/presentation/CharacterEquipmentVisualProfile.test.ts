import { describe, expect, it } from 'vitest';
import { materialFrameKey, resolveWeaponVisualFamily, weaponVisualFamilyLabel } from './CharacterEquipmentVisualProfile';

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
});
