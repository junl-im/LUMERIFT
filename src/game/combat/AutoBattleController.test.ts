import { describe, expect, it } from 'vitest';
import { resolveAutoBattle } from './AutoBattleController';
import type { CombatActionConfig } from './combatData';

const action = (kind: 'basic' | 'skill1' | 'skill2', range: number): CombatActionConfig => ({
  id: kind,
  label: kind,
  kind,
  duration: 0.4,
  hitTime: 0.2,
  damageMultiplier: 1,
  range,
  halfAngleRadians: 1,
  hitShape: 'arc',
  cooldown: 1,
  hitStop: 0.02,
  shake: 1,
  lungeDistance: 0,
  effectColor: 0xffffff,
  impactTier: 'light',
  driveGain: 1,
  driveCost: 0,
  comboWindow: 0.2,
});

const base = {
  enabled: true,
  manualMove: { x: 0, y: 0 },
  playerState: 'idle' as const,
  playerHpRatio: 1,
  targetDirection: { x: 1, y: 0 },
  targetDistance: 180,
  targetRadius: 20,
  targetRank: 'normal' as const,
  dodgeCooldown: 0,
  skill1Cooldown: 0,
  skill2Cooldown: 0,
  basicAction: action('basic', 88),
  skill1Action: action('skill1', 120),
  skill2Action: action('skill2', 170),
  useSkills: true,
  useDodge: true,
  bossAutoMode: 'full' as const,
  devicePreset: 'balanced' as const,
  autoSkillHpRule: 'below-85' as const,
  strategyPreset: 'balanced' as const,
  bossDodgePolicy: 'critical-only' as const,
};

describe('resolveAutoBattle', () => {
  it('lets manual movement override automation', () => {
    const result = resolveAutoBattle({ ...base, manualMove: { x: 0, y: -1 } });
    expect(result.reason).toBe('manual-override');
  });

  it('dodges an imminent telegraph when enabled', () => {
    const result = resolveAutoBattle({ ...base, targetDistance: 80, targetTelegraphProgress: 0.8, targetTelegraphRange: 120 });
    expect(result.action).toBe('dodge');
  });

  it('respects target-only boss mode', () => {
    const result = resolveAutoBattle({ ...base, targetRank: 'boss', bossAutoMode: 'target-only' });
    expect(result.action).toBe('none');
    expect(result.reason).toBe('boss-target-only');
  });

  it('can disable skill automation while keeping basic attacks', () => {
    const result = resolveAutoBattle({ ...base, useSkills: false, targetDistance: 70 });
    expect(result.action).toBe('attack');
  });

  it('queues the next combo attack while already attacking in range', () => {
    const result = resolveAutoBattle({ ...base, playerState: 'attacking', targetDistance: 70, skill1Cooldown: 2, skill2Cooldown: 2 });
    expect(result.action).toBe('attack');
    expect(result.reason).toBe('queue-combo');
  });

  it('uses shorter cadence in responsive device preset', () => {
    const responsive = resolveAutoBattle({ ...base, targetDistance: 70, useSkills: false, devicePreset: 'responsive' });
    const stable = resolveAutoBattle({ ...base, targetDistance: 70, useSkills: false, devicePreset: 'stable' });
    expect(responsive.cooldownSeconds).toBeLessThan(stable.cooldownSeconds);
  });

  it('holds skills until the configured HP condition is met', () => {
    const gated = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.95,
      driveRatio: 0.3,
      autoSkillHpRule: 'below-85',
    });
    const allowed = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.8,
      driveRatio: 0.3,
      autoSkillHpRule: 'below-85',
    });
    expect(gated.action).toBe('attack');
    expect(gated.reason).toBe('skill-hp-gated');
    expect(allowed.action).toBe('skill1');
  });

  it('only dodges critical boss patterns in critical-only mode', () => {
    const early = resolveAutoBattle({ ...base, targetRank: 'boss', targetDistance: 80, targetTelegraphProgress: 0.68, targetTelegraphRange: 120 });
    const critical = resolveAutoBattle({ ...base, targetRank: 'boss', targetDistance: 80, targetTelegraphProgress: 0.86, targetTelegraphRange: 120 });
    expect(early.action).not.toBe('dodge');
    expect(critical.action).toBe('dodge');
    expect(critical.reason).toBe('boss-critical-evade');
  });

  it('uses pattern-specific boss dodge timing and reason', () => {
    const result = resolveAutoBattle({
      ...base,
      targetRank: 'boss',
      targetPatternId: 'boss_nova',
      targetDistance: 80,
      targetTelegraphProgress: 0.5,
      targetTelegraphRange: 205,
    });
    expect(result.action).toBe('dodge');
    expect(result.reason).toBe('boss-nova-evade');
  });

  it('conserves Drive against a nearly defeated normal target', () => {
    const result = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.08,
      driveRatio: 1,
    });
    expect(result.action).toBe('attack');
    expect(result.reason).toBe('target-finisher-save');
  });

  it('requires enough Drive for automated skill use', () => {
    const result = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.8,
      driveRatio: 0.02,
    });
    expect(result.action).toBe('attack');
    expect(result.reason).toBe('skill-hp-gated');
  });

  it('uses skills earlier in aggressive mode than conservative mode', () => {
    const aggressive = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.7,
      driveRatio: 0.4,
      strategyPreset: 'aggressive',
      autoSkillHpRule: 'always',
    });
    const conservative = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.7,
      driveRatio: 0.4,
      strategyPreset: 'conservative',
      autoSkillHpRule: 'always',
    });
    expect(aggressive.action).toBe('skill2');
    expect(conservative.action).toBe('skill1');
  });

  it('conserves Drive earlier with the conservative preset', () => {
    const balanced = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.18,
      driveRatio: 1,
      strategyPreset: 'balanced',
    });
    const conservative = resolveAutoBattle({
      ...base,
      targetDistance: 70,
      playerHpRatio: 0.7,
      targetHpRatio: 0.18,
      driveRatio: 1,
      strategyPreset: 'conservative',
    });
    expect(balanced.action).not.toBe('attack');
    expect(conservative.action).toBe('attack');
    expect(conservative.reason).toBe('preset-conservative-save');
  });
});
