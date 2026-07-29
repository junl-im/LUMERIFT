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
});
