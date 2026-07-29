import type { BossAutoMode, CombatDevicePreset } from '../../core/input/CombatAssistController';
import type { CombatActionConfig, MonsterRank } from './combatData';
import { normalize, type Vec2 } from './geometry';

export type AutoBattleAction = 'none' | 'attack' | 'skill1' | 'skill2' | 'dodge';

export interface AutoBattleInput {
  readonly enabled: boolean;
  readonly manualMove: Vec2;
  readonly playerState: 'idle' | 'moving' | 'attacking' | 'skill' | 'dodging' | 'hit' | 'dead';
  readonly playerHpRatio: number;
  readonly targetDirection: Vec2;
  readonly targetDistance: number;
  readonly targetRadius: number;
  readonly targetRank: MonsterRank;
  readonly targetTelegraphProgress?: number;
  readonly targetTelegraphRange?: number;
  readonly dodgeCooldown: number;
  readonly skill1Cooldown: number;
  readonly skill2Cooldown: number;
  readonly basicAction: CombatActionConfig;
  readonly skill1Action: CombatActionConfig;
  readonly skill2Action: CombatActionConfig;
  readonly useSkills: boolean;
  readonly useDodge: boolean;
  readonly bossAutoMode: BossAutoMode;
  readonly devicePreset: CombatDevicePreset;
}

export interface AutoBattleDecision {
  readonly moveAxis: Vec2;
  readonly action: AutoBattleAction;
  readonly facing: Vec2;
  readonly reason: string;
  readonly cooldownSeconds: number;
}

const DEVICE_TUNING: Readonly<Record<CombatDevicePreset, {
  imminentThreshold: number;
  preferredRangeRatio: number;
  attackCooldown: number;
  skillCooldown: number;
  dodgeCooldown: number;
}>> = {
  responsive: { imminentThreshold: 0.54, preferredRangeRatio: 0.74, attackCooldown: 0.12, skillCooldown: 0.2, dodgeCooldown: 0.28 },
  balanced: { imminentThreshold: 0.62, preferredRangeRatio: 0.78, attackCooldown: 0.16, skillCooldown: 0.24, dodgeCooldown: 0.34 },
  stable: { imminentThreshold: 0.7, preferredRangeRatio: 0.82, attackCooldown: 0.21, skillCooldown: 0.3, dodgeCooldown: 0.4 },
};

export function resolveAutoBattle(input: AutoBattleInput): AutoBattleDecision {
  const facing = normalize(input.targetDirection, { x: 0, y: -1 });
  const tuning = DEVICE_TUNING[input.devicePreset];
  const idle = (reason: string, moveAxis = input.manualMove): AutoBattleDecision => ({
    moveAxis,
    action: 'none',
    facing,
    reason,
    cooldownSeconds: 0,
  });

  if (!input.enabled || input.playerState === 'dead' || input.playerState === 'hit') return idle('disabled-or-unavailable');
  if (Math.hypot(input.manualMove.x, input.manualMove.y) > 0.05) return idle('manual-override');
  if (input.targetRank === 'boss' && input.bossAutoMode !== 'full') return idle(`boss-${input.bossAutoMode}`);

  const dangerRange = (input.targetTelegraphRange ?? 0) + input.targetRadius + 18;
  const imminent = (input.targetTelegraphProgress ?? 0) >= tuning.imminentThreshold && input.targetDistance <= dangerRange;
  if (input.useDodge && imminent && input.dodgeCooldown <= 0
    && (input.playerState === 'idle' || input.playerState === 'moving' || input.playerState === 'attacking' || input.playerState === 'skill')) {
    const perpendicular = input.targetRank === 'boss'
      ? normalize({ x: -facing.y, y: facing.x }, { x: 1, y: 0 })
      : { x: -facing.x, y: -facing.y };
    return {
      moveAxis: { x: 0, y: 0 },
      action: 'dodge',
      facing: perpendicular,
      reason: 'telegraph-evade',
      cooldownSeconds: tuning.dodgeCooldown,
    };
  }

  const basicRange = input.basicAction.range + input.targetRadius * 0.45;
  const skill1Range = input.skill1Action.range + input.targetRadius * 0.35;
  const skill2Range = input.skill2Action.range + input.targetRadius * 0.35;
  if (input.playerState === 'attacking') {
    return input.targetDistance <= basicRange
      ? { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'queue-combo', cooldownSeconds: tuning.attackCooldown }
      : idle('attack-in-progress', { x: 0, y: 0 });
  }
  if (input.playerState === 'skill' || input.playerState === 'dodging') return idle('action-in-progress', { x: 0, y: 0 });

  if (input.useSkills && input.skill2Cooldown <= 0 && input.targetDistance <= skill2Range
    && (input.targetRank === 'boss' || input.playerHpRatio < 0.72)) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill2', facing, reason: 'priority-skill2', cooldownSeconds: tuning.skillCooldown + 0.04 };
  }
  if (input.useSkills && input.skill1Cooldown <= 0 && input.targetDistance <= skill1Range) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill1', facing, reason: 'skill1-ready', cooldownSeconds: tuning.skillCooldown };
  }
  if (input.targetDistance <= basicRange) {
    return { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'basic-range', cooldownSeconds: tuning.attackCooldown };
  }

  const preferredRange = Math.max(52, basicRange * tuning.preferredRangeRatio);
  if (input.targetDistance > preferredRange) return { moveAxis: facing, action: 'none', facing, reason: 'approach-target', cooldownSeconds: 0 };
  return idle('hold-range', { x: 0, y: 0 });
}
