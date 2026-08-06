import { describe, expect, it } from 'vitest';
import { MONSTER_RECOVERY_PARTS_V21_SCHEMA, monsterRecoveryTextureV21 } from './MonsterRecoveryPartsV21';

describe('MonsterRecoveryPartsV21', () => {
  it('keeps the v21 recovery schema and safe missing-sheet fallback', () => {
    expect(MONSTER_RECOVERY_PARTS_V21_SCHEMA).toBe('lumerift-monster-recovery-parts-v21');
    expect(monsterRecoveryTextureV21(undefined, 'void-warden', 0, 1, 'rise', 0)).toBeUndefined();
  });
});
