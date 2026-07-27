import { describe, expect, it } from 'vitest';
import { GameDataRegistry } from '../../data/GameDataRegistry';
import { PlayerCombatController } from './PlayerCombatController';

const config = new GameDataRegistry().player;

describe('PlayerCombatController', () => {
  it('기본 공격을 3연속 콤보로 연결한다', () => {
    const player = new PlayerCombatController(config, { x: 0, y: 0 });

    player.requestAttack();
    player.update(0.13, { x: 0, y: 0 });
    expect(player.drainHitEvents()[0]?.action.id).toBe('basic_01');

    player.requestAttack();
    player.update(0.11, { x: 0, y: 0 });
    player.update(0.15, { x: 0, y: 0 });
    expect(player.drainHitEvents()[0]?.action.id).toBe('basic_02');

    player.requestAttack();
    player.update(0.12, { x: 0, y: 0 });
    player.update(0.2, { x: 0, y: 0 });
    expect(player.drainHitEvents()[0]?.action.id).toBe('basic_03');
  });

  it('회피 무적 시간에는 피해를 받지 않는다', () => {
    const player = new PlayerCombatController(config, { x: 0, y: 0 });
    expect(player.requestDodge({ x: 1, y: 0 })).toBe(true);
    expect(player.receiveDamage(100)).toBe(false);
    expect(player.hp).toBe(player.maxHp);

    player.update(0.3, { x: 0, y: 0 });
    expect(player.receiveDamage(100)).toBe(true);
    expect(player.hp).toBe(player.maxHp - 100);
  });

  it('스킬 쿨다운 중 재사용을 막는다', () => {
    const player = new PlayerCombatController(config, { x: 0, y: 0 });
    expect(player.requestSkill('skill1')).toBe(true);
    expect(player.requestSkill('skill1')).toBe(false);
  });
});
