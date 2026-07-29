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
};

describe('resolveAutoBattle', () => {
  it('lets manual movement override automation', () => {
    const result = resolveAutoBattle({ ...base, manualMove: { x: 0, y: -1 } });
    expect(result.reason).toBe('manual-override');
  });

  it('dodges an imminent telegraph', () => {
    const result = resolveAutoBattle({ ...base, targetDistance: 80, targetTelegraphProgress: 0.8, targetTelegraphRange: 120 });
    expect(result.action).toBe('dodge');
  });


  it('queues the next combo attack while already attacking in range', () => {
    const result = resolveAutoBattle({ ...base, playerState: 'attacking', targetDistance: 70, skill1Cooldown: 2, skill2Cooldown: 2 });
    expect(result.action).toBe('attack');
    expect(result.reason).toBe('queue-combo');
  });

  it('approaches a distant target', () => {
    const result = resolveAutoBattle({ ...base, targetDistance: 320, skill1Cooldown: 2, skill2Cooldown: 2 });
    expect(result.moveAxis.x).toBeGreaterThan(0.9);
  });
});
