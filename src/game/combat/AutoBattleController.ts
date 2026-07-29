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
}

export interface AutoBattleDecision {
  readonly moveAxis: Vec2;
  readonly action: AutoBattleAction;
  readonly facing: Vec2;
  readonly reason: string;
}

export function resolveAutoBattle(input: AutoBattleInput): AutoBattleDecision {
  const facing = normalize(input.targetDirection, { x: 0, y: -1 });
  if (!input.enabled || input.playerState === 'dead' || input.playerState === 'hit') {
    return { moveAxis: input.manualMove, action: 'none', facing, reason: 'disabled-or-unavailable' };
  }
  if (Math.hypot(input.manualMove.x, input.manualMove.y) > 0.05) {
    return { moveAxis: input.manualMove, action: 'none', facing, reason: 'manual-override' };
  }

  const dangerRange = (input.targetTelegraphRange ?? 0) + input.targetRadius + 18;
  const imminent = (input.targetTelegraphProgress ?? 0) >= 0.62 && input.targetDistance <= dangerRange;
  if (imminent && input.dodgeCooldown <= 0 && (input.playerState === 'idle' || input.playerState === 'moving' || input.playerState === 'attacking' || input.playerState === 'skill')) {
    const perpendicular = input.targetRank === 'boss'
      ? normalize({ x: -facing.y, y: facing.x }, { x: 1, y: 0 })
      : { x: -facing.x, y: -facing.y };
    return { moveAxis: { x: 0, y: 0 }, action: 'dodge', facing: perpendicular, reason: 'telegraph-evade' };
  }

  const basicRange = input.basicAction.range + input.targetRadius * 0.45;
  const skill1Range = input.skill1Action.range + input.targetRadius * 0.35;
  const skill2Range = input.skill2Action.range + input.targetRadius * 0.35;
  if (input.playerState === 'attacking') {
    return input.targetDistance <= basicRange
      ? { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'queue-combo' }
      : { moveAxis: { x: 0, y: 0 }, action: 'none', facing, reason: 'attack-in-progress' };
  }
  if (input.playerState === 'skill' || input.playerState === 'dodging') {
    return { moveAxis: { x: 0, y: 0 }, action: 'none', facing, reason: 'action-in-progress' };
  }

  if (input.skill2Cooldown <= 0 && input.targetDistance <= skill2Range && (input.targetRank === 'boss' || input.playerHpRatio < 0.72)) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill2', facing, reason: 'priority-skill2' };
  }
  if (input.skill1Cooldown <= 0 && input.targetDistance <= skill1Range) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill1', facing, reason: 'skill1-ready' };
  }
  if (input.targetDistance <= basicRange) {
    return { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'basic-range' };
  }

  const preferredRange = Math.max(52, basicRange * 0.78);
  if (input.targetDistance > preferredRange) {
    return { moveAxis: facing, action: 'none', facing, reason: 'approach-target' };
  }
  return { moveAxis: { x: 0, y: 0 }, action: 'none', facing, reason: 'hold-range' };
}
