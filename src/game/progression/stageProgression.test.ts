import { describe, expect, it } from 'vitest';
import { GameDataRegistry } from '../data/GameDataRegistry';
import { createDefaultProfile } from '../../repositories/PlayerRepository';
import { applyStageVictory } from './battleRewards';

const registry = new GameDataRegistry();

describe('stage progression', () => {
  it('grants first-clear rewards once and unlocks the next stage', () => {
    const stage = registry.getStage('stage_001');
    const first = applyStageVictory(createDefaultProfile('stage-user', '계승자'), stage, 4, 50, []);
    expect(first.firstClear).toBe(true);
    expect(first.profile.highestStage).toBe(2);
    expect(first.profile.stageProgress.stage_001?.clearCount).toBe(1);
    expect(first.itemIds).toContain('weapon_rift_blade_common');

    const second = applyStageVictory(first.profile, stage, 4, 45, []);
    expect(second.firstClear).toBe(false);
    expect(second.profile.stageProgress.stage_001?.clearCount).toBe(2);
    expect(second.profile.stageProgress.stage_001?.bestSeconds).toBe(45);
  });
});
