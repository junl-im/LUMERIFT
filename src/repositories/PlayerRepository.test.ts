import { describe, expect, it } from 'vitest';
import { migratePlayerProfile, PLAYER_SAVE_VERSION } from './PlayerRepository';

describe('player save migration', () => {
  it('migrates v1 profile into the current progression structure', () => {
    const migrated = migratePlayerProfile({
      uid: 'old',
      nickname: '이전 계승자',
      level: 3,
      exp: 10,
      highestStage: 2,
      gold: 500,
      updatedAt: 1,
    }, 'old');

    expect(migrated.saveVersion).toBe(PLAYER_SAVE_VERSION);
    expect(migrated.level).toBe(3);
    expect(migrated.inventory).toEqual({});
    expect(migrated.stageProgress).toEqual({});
    expect(migrated.statistics.stagesCleared).toBe(0);
    expect(migrated.tutorial.completed).toBe(false);
    expect(migrated.operations.attendanceClaims).toEqual([]);
  });

  it('preserves v2 equipment while adding current fields', () => {
    const migrated = migratePlayerProfile({
      saveVersion: 2,
      nickname: '장비 계승자',
      level: 2,
      exp: 20,
      highestStage: 1,
      gold: 200,
      inventory: {
        item1: { uid: 'item1', itemId: 'weapon_rift_blade_common', level: 2, locked: true, acquiredAt: 5 },
      },
      equipped: { weapon: 'item1' },
    }, 'v2-user');
    expect(migrated.inventory.item1?.level).toBe(2);
    expect(migrated.equipped.weapon).toBe('item1');
    expect(migrated.dailyQuestClaims).toEqual({});
  });
});
