import { describe, expect, it } from 'vitest';
import { GameDataRegistry } from '../data/GameDataRegistry';
import { CombatMomentumController, resolveStyleRank } from './CombatMomentumController';

const registry = new GameDataRegistry();

describe('CombatMomentumController', () => {
  it('builds drive and style rank from successful hits', () => {
    const momentum = new CombatMomentumController();
    const attack = registry.getAction('basic_03');
    momentum.registerHit(attack, 3, 1);
    const snapshot = momentum.snapshot();
    expect(snapshot.drive).toBeGreaterThan(attack.driveGain);
    expect(snapshot.chain).toBe(3);
    expect(snapshot.styleRank).toBe('C');
  });

  it('empowers a skill only when enough drive is available', () => {
    const momentum = new CombatMomentumController();
    const basic = registry.getAction('basic_03');
    const skill = registry.getAction('skill_01');
    momentum.registerHit(basic, 2, 0);
    momentum.registerHit(basic, 2, 0);
    const boost = momentum.prepareSkill(skill);
    expect(boost.empowered).toBe(true);
    expect(boost.spent).toBe(skill.driveCost);
    expect(boost.multiplier).toBeGreaterThan(1);
  });

  it('resets an expired chain', () => {
    const momentum = new CombatMomentumController();
    momentum.registerPerfectDodge();
    momentum.update(3);
    expect(momentum.snapshot().chain).toBe(0);
    expect(resolveStyleRank(32)).toBe('SS');
  });
});
