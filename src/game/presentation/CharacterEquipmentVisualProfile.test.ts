import { describe, expect, it } from 'vitest';
import { materialFrameKey } from './CharacterEquipmentVisualProfile';


describe('CharacterEquipmentVisualProfile', () => {
  it('maps slot and grade to the premium material atlas key', () => {
    expect(materialFrameKey('weapon', 'heroic')).toBe('equipment_material.weapon.heroic');
    expect(materialFrameKey('armor', 'rare')).toBe('equipment_material.armor.rare');
  });
});
