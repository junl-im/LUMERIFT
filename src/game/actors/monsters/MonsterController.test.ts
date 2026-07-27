import { describe, expect, it } from 'vitest';
import type { MonsterCombatConfig } from '../../combat/combatData';
import { MonsterController } from './MonsterController';

const config: MonsterCombatConfig = {
  id: 'test',
  name: 'test',
  rank: 'boss',
  maxHp: 100,
  attack: 20,
  defense: 0,
  radius: 20,
  moveSpeed: 40,
  detectionRange: 500,
  hitRecovery: 0.1,
  statusDurationMultiplier: 0.5,
  patterns: [
    {
      id: 'one',
      label: 'one',
      shape: 'arc',
      targetMode: 'self',
      damageMultiplier: 1,
      range: 100,
      triggerRange: 120,
      halfAngleRadians: Math.PI / 2,
      cooldown: 0.1,
      windup: 0.2,
      duration: 0.4,
      effectColor: 0xffffff,
    },
    {
      id: 'two',
      label: 'two',
      shape: 'circle',
      targetMode: 'self',
      damageMultiplier: 1,
      range: 100,
      triggerRange: 120,
      halfAngleRadians: Math.PI,
      cooldown: 0.1,
      windup: 0.2,
      duration: 0.4,
      effectColor: 0xffffff,
    },
    {
      id: 'three',
      label: 'three',
      shape: 'circle',
      targetMode: 'playerLocked',
      damageMultiplier: 1,
      range: 100,
      triggerRange: 300,
      halfAngleRadians: Math.PI,
      cooldown: 0.1,
      windup: 0.2,
      duration: 0.4,
      effectColor: 0xffffff,
    },
  ],
};

describe('MonsterController', () => {
  it('telegraphs and emits attack event', () => {
    const monster = new MonsterController(config, { x: 0, y: 0 });
    monster.update(0.01, { x: 50, y: 0 });
    expect(monster.state).toBe('telegraph');
    monster.update(0.21, { x: 50, y: 0 });
    monster.update(0.01, { x: 50, y: 0 });
    expect(monster.drainAttackEvents()).toHaveLength(1);
  });

  it('raises boss phase events at 65% and 30% hp thresholds', () => {
    const monster = new MonsterController(config, { x: 0, y: 0 });
    monster.receiveDamage(40, { x: 1, y: 0 }, 0);
    monster.update(0.01, { x: 300, y: 0 });
    expect(monster.phase).toBe(2);
    expect(monster.drainPhaseEvents()).toEqual([{ phase: 2, hpRatio: 0.6 }]);

    monster.receiveDamage(35, { x: 1, y: 0 }, 0);
    monster.update(0.01, { x: 300, y: 0 });
    expect(monster.phase).toBe(3);
    expect(monster.drainPhaseEvents()[0]?.phase).toBe(3);
  });

  it('applies status duration resistance', () => {
    const monster = new MonsterController(config, { x: 0, y: 0 });
    monster.applyStatusEffect({ id: 'slow', chance: 1, duration: 2, potency: 0.5 });
    expect(monster.statuses.moveSpeedMultiplier).toBeCloseTo(0.5);
    monster.update(1.1, { x: 400, y: 0 });
    expect(monster.statuses.moveSpeedMultiplier).toBe(1);
  });
});
