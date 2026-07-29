import {
  autoSkillHpThreshold,
  type AutoSkillHpRule,
  type BossAutoMode,
  type BossDodgePolicy,
  type CombatDevicePreset,
} from '../../core/input/CombatAssistController';
import type { CombatActionConfig, MonsterRank } from './combatData';
import { resolveBossDodgeDirection, resolveBossDodgeRule, bossDodgeReasonLabel } from './BossDodgeRules';
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
  readonly targetHpRatio?: number;
  readonly driveRatio?: number;
  readonly targetPatternId?: string;
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
  readonly autoSkillHpRule: AutoSkillHpRule;
  readonly bossDodgePolicy: BossDodgePolicy;
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
  const telegraphProgress = input.targetTelegraphProgress ?? 0;
  const bossRule = input.targetRank === 'boss' ? resolveBossDodgeRule(input.targetPatternId) : undefined;
  const dodgeThreshold = bossRule?.triggerProgress ?? tuning.imminentThreshold;
  const imminent = telegraphProgress >= dodgeThreshold && input.targetDistance <= dangerRange;
  const bossDodgeAllowed = input.targetRank !== 'boss'
    || input.bossDodgePolicy === 'all'
    || (input.bossDodgePolicy === 'critical-only'
      && ((bossRule?.critical ?? true) || input.playerHpRatio <= 0.36));
  if (input.useDodge && imminent && bossDodgeAllowed && input.dodgeCooldown <= 0
    && (input.playerState === 'idle' || input.playerState === 'moving' || input.playerState === 'attacking' || input.playerState === 'skill')) {
    const dodgeDirection = bossRule
      ? resolveBossDodgeDirection(bossRule, facing)
      : { x: -facing.x, y: -facing.y };
    return {
      moveAxis: { x: 0, y: 0 },
      action: 'dodge',
      facing: dodgeDirection,
      reason: bossRule?.reason ?? (input.targetRank === 'boss' ? 'boss-critical-evade' : 'telegraph-evade'),
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

  const skillHpAllowed = input.autoSkillHpRule === 'always'
    || input.playerHpRatio <= autoSkillHpThreshold(input.autoSkillHpRule);
  const driveRatio = Math.max(0, Math.min(1, input.driveRatio ?? 1));
  const targetHpRatio = Math.max(0, Math.min(1, input.targetHpRatio ?? 1));
  const skill2DriveReady = driveRatio >= Math.max(0.42, input.skill2Action.driveCost / 100);
  const skill1DriveReady = driveRatio >= Math.max(0.16, input.skill1Action.driveCost / 140);
  const conserveFinisher = targetHpRatio <= 0.12 && input.targetRank !== 'boss';

  if (conserveFinisher && input.targetDistance <= basicRange) {
    return { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'target-finisher-save', cooldownSeconds: tuning.attackCooldown };
  }
  if (input.useSkills && skillHpAllowed && skill2DriveReady && input.skill2Cooldown <= 0 && input.targetDistance <= skill2Range
    && targetHpRatio > 0.16 && (input.targetRank === 'boss' || input.playerHpRatio < 0.72 || driveRatio >= 0.82)) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill2', facing, reason: 'priority-skill2', cooldownSeconds: tuning.skillCooldown + 0.04 };
  }
  if (input.useSkills && skillHpAllowed && skill1DriveReady && input.skill1Cooldown <= 0 && input.targetDistance <= skill1Range
    && targetHpRatio > 0.08) {
    return { moveAxis: { x: 0, y: 0 }, action: 'skill1', facing, reason: 'skill1-ready', cooldownSeconds: tuning.skillCooldown };
  }
  if (input.useSkills && (!skillHpAllowed || (!skill1DriveReady && !skill2DriveReady))
    && input.targetDistance <= Math.max(skill1Range, skill2Range)) {
    if (input.targetDistance <= basicRange) {
      return { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'skill-hp-gated', cooldownSeconds: tuning.attackCooldown };
    }
  }
  if (input.targetDistance <= basicRange) {
    return { moveAxis: { x: 0, y: 0 }, action: 'attack', facing, reason: 'basic-range', cooldownSeconds: tuning.attackCooldown };
  }

  const preferredRange = Math.max(52, basicRange * tuning.preferredRangeRatio);
  if (input.targetDistance > preferredRange) return { moveAxis: facing, action: 'none', facing, reason: 'approach-target', cooldownSeconds: 0 };
  if (input.targetRank === 'boss' && imminent && !bossDodgeAllowed) return idle('boss-dodge-policy-hold', { x: 0, y: 0 });
  return idle('hold-range', { x: 0, y: 0 });
}

export function autoBattleReasonLabel(reason: string): string {
  if (reason === 'manual-override') return '수동 입력 우선';
  if (reason === 'manual-action') return '직접 액션 개입';
  if (reason === 'manual-move') return '수동 이동 개입';
  if (reason === 'manual-recovery') return '수동 조작 후 복귀 대기';
  if (reason === 'boss-target-only') return '보스전 타겟만 유지';
  if (reason === 'boss-off') return '보스전 자동 기능 금지';
  if (reason === 'telegraph-evade') return '공격 예고 자동 회피';
  if (reason === 'boss-critical-evade' || reason === 'boss-cleave-evade' || reason === 'boss-nova-evade' || reason === 'boss-rupture-evade') return bossDodgeReasonLabel(reason);
  if (reason === 'queue-combo') return '3단 콤보 연결';
  if (reason === 'priority-skill2') return 'HP·Drive·보스 조건 스킬 2';
  if (reason === 'skill1-ready') return 'HP·Drive 조건 충족 스킬 1';
  if (reason === 'skill-hp-gated') return 'HP·Drive 조건 대기';
  if (reason === 'target-finisher-save') return '마무리 기본 공격으로 Drive 보존';
  if (reason === 'basic-range') return '기본 공격 거리 진입';
  if (reason === 'approach-target') return '타겟 공격 거리 접근';
  if (reason === 'hold-range') return '현재 공격 거리 유지';
  if (reason === 'boss-dodge-policy-hold') return '보스 회피 정책에 따라 유지';
  if (reason === 'action-in-progress') return '현재 액션 완료 대기';
  if (reason === 'attack-in-progress') return '공격 모션 완료 대기';
  return '자동 전투 대기';
}
