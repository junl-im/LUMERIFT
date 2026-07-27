import { describe, expect, it } from 'vitest';
import type { StageConfig } from '../combat/combatData';
import { applyBattleRewards, resolveStageDrops } from './battleRewards';
import { createDefaultProfile } from '../../repositories/PlayerRepository';

const profile = {
  ...createDefaultProfile('test', '계승자'),
  exp: 80,
  gold: 10,
};

describe('battle rewards', () => {
  it('경험치가 기준치를 넘으면 레벨을 올리고 아이템을 저장한다', () => {
    const result = applyBattleRewards(profile, {
      exp: 40,
      gold: 50,
      itemIds: ['weapon_rift_blade_common'],
    });
    expect(result.level).toBe(2);
    expect(result.exp).toBe(20);
    expect(result.gold).toBe(60);
    expect(Object.values(result.inventory)[0]?.itemId).toBe('weapon_rift_blade_common');
  });

  it('드롭이 하나도 없으면 첫 보상을 보장한다', () => {
    const stage = {
      rewards: {
        exp: 1,
        gold: 1,
        dropTable: [{ itemId: 'starter', chance: 0 }],
      },
    } as unknown as StageConfig;
    expect(resolveStageDrops(stage, () => 1)).toEqual(['starter']);
  });
});
