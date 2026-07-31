import { describe, expect, it } from 'vitest';
import type { PlayerCombatConfig } from './combatData';
import { applyWeaponMotionProfile, resolveWeaponAttackTiming } from './WeaponMotionProfile';

const action = {
  id: 'basic', label: '공격', kind: 'basic' as const, duration: 0.5, hitTime: 0.2,
  damageMultiplier: 1, range: 100, halfAngleRadians: 0.8, hitShape: 'arc' as const,
  cooldown: 0, hitStop: 0.04, shake: 1, lungeDistance: 10, effectColor: 0xffffff,
  impactTier: 'light' as const, driveGain: 10, driveCost: 0, comboWindow: 0.3,
};
const config: PlayerCombatConfig = {
  id: 'player', name: 'player', maxHp: 100, attack: 10, defense: 0, moveSpeed: 100, radius: 20, hitRecovery: 0.2,
  dodge: { duration: 0.2, speed: 300, cooldown: 1, invulnerability: 0.15 },
  combo: [action, action, action],
  skills: {
    skill1: { ...action, id: 'skill1', kind: 'skill1', cooldown: 3 },
    skill2: { ...action, id: 'skill2', kind: 'skill2', cooldown: 6 },
  },
};

describe('applyWeaponMotionProfile', () => {
  it('makes blade faster and lance longer ranged without mutating the source', () => {
    const blade = applyWeaponMotionProfile(config, 'blade');
    const lance = applyWeaponMotionProfile(config, 'riftlance');
    expect(blade.combo[0]!.duration).toBeLessThan(config.combo[0]!.duration);
    expect(lance.combo[0]!.range).toBeGreaterThan(config.combo[0]!.range);
    expect(config.combo[0]!.duration).toBe(0.5);
  });

  it('makes greatblade heavier, wider, and later-contact than lance', () => {
    const heavy = applyWeaponMotionProfile(config, 'greatblade');
    expect(heavy.combo[2]!.damageMultiplier).toBeGreaterThan(config.combo[2]!.damageMultiplier);
    expect(heavy.combo[0]!.halfAngleRadians).toBeGreaterThan(config.combo[0]!.halfAngleRadians);
    expect(resolveWeaponAttackTiming('greatblade', 1).contactRatio)
      .toBeGreaterThan(resolveWeaponAttackTiming('riftlance', 1).contactRatio);
  });
});
