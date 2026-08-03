import { describe, expect, it } from 'vitest';
import { MONSTER_DAMAGE_PARTS_V20_SCHEMA, monsterDamageStateV20 } from './MonsterDamagePartsV20';

describe('MonsterDamagePartsV20', () => {
  it('separates hit and down states without changing gameplay state', () => {
    expect(MONSTER_DAMAGE_PARTS_V20_SCHEMA).toBe('lumerift-monster-damage-parts-v20');
    expect(monsterDamageStateV20('hit', true)).toBe('hit');
    expect(monsterDamageStateV20('idle', false)).toBe('down');
    expect(monsterDamageStateV20('idle', true)).toBeUndefined();
  });
});
