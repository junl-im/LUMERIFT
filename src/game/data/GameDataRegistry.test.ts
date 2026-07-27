import { describe, expect, it } from 'vitest';
import { GameDataRegistry, GameDataValidationError } from './GameDataRegistry';

describe('GameDataRegistry', () => {
  it('loads bundled MVP data and keeps cross references valid', () => {
    const registry = new GameDataRegistry();
    expect(registry.player.combo).toHaveLength(3);
    expect(registry.getMonster('boss_harbinger').combat.patterns).toHaveLength(3);
    expect(registry.stagesInOrder).toHaveLength(10);
    expect(registry.getStage('stage_010').nodeType).toBe('boss');
    expect(registry.itemIds).toHaveLength(9);
    expect(registry.questsInOrder).toHaveLength(9);
  });

  it('rejects broken cross references', () => {
    const registry = () => new GameDataRegistry({
      actions: { version: 1, actions: [] },
      player: {
        version: 1,
        player: {
          id: 'p', name: 'p', maxHp: 1, attack: 1, defense: 0, moveSpeed: 1, radius: 1,
          hitRecovery: 0, dodge: { duration: 1, speed: 1, cooldown: 0, invulnerability: 0 },
          comboActionIds: ['missing'], skills: { skill1: 'missing', skill2: 'missing' },
        },
      },
      monsters: { version: 1, monsters: [] },
      items: { version: 1, items: [] },
      stages: { version: 2, stages: [] },
      quests: { version: 1, quests: [] },
    });
    expect(registry).toThrow(GameDataValidationError);
  });
});
