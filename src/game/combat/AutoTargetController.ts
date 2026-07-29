import type { AutoTargetPriority, CombatDevicePreset } from '../../core/input/CombatAssistController';
import type { MonsterRank } from './combatData';
import { distance, normalize, type Vec2 } from './geometry';

export interface AutoTargetCandidate {
  readonly id: string;
  readonly position: Vec2;
  readonly rank: MonsterRank;
  readonly hp: number;
  readonly maxHp: number;
  readonly alive: boolean;
  readonly telegraphing: boolean;
}

export interface AutoTargetPolicy {
  readonly priority: AutoTargetPriority;
  readonly devicePreset: CombatDevicePreset;
}

export type AutoTargetReason = 'balanced-score' | 'nearest-target' | 'boss-priority' | 'weak-target' | 'threat-priority' | 'lock-stability';

export interface AutoTargetScoreBreakdown {
  readonly distance: number;
  readonly facing: number;
  readonly rank: number;
  readonly telegraph: number;
  readonly finish: number;
  readonly priority: number;
  readonly total: number;
}

export interface AutoTargetScoreDetails {
  readonly score: number;
  readonly reason: Exclude<AutoTargetReason, 'lock-stability'>;
  readonly breakdown: AutoTargetScoreBreakdown;
}

export interface AutoTargetSnapshot {
  readonly targetId?: string;
  readonly distance: number;
  readonly direction: Vec2;
  readonly score: number;
  readonly reason: AutoTargetReason;
  readonly breakdown: AutoTargetScoreBreakdown;
}

const DEVICE_POLICY: Readonly<Record<CombatDevicePreset, { maxDistance: number; switchHysteresis: number }>> = {
  responsive: { maxDistance: 500, switchHysteresis: 18 },
  balanced: { maxDistance: 430, switchHysteresis: 34 },
  stable: { maxDistance: 390, switchHysteresis: 52 },
};

export class AutoTargetController {
  private targetId?: string;

  public clear(): void {
    this.targetId = undefined;
  }

  public lock(targetId: string | undefined): void {
    this.targetId = targetId;
  }

  public get currentTargetId(): string | undefined {
    return this.targetId;
  }

  public update(
    origin: Vec2,
    facing: Vec2,
    candidates: readonly AutoTargetCandidate[],
    policy: AutoTargetPolicy = { priority: 'balanced', devicePreset: 'balanced' },
  ): AutoTargetSnapshot | undefined {
    const device = DEVICE_POLICY[policy.devicePreset];
    const viable = candidates.filter((candidate) => candidate.alive && distance(origin, candidate.position) <= device.maxDistance);
    if (viable.length === 0) {
      this.targetId = undefined;
      return undefined;
    }

    const scored = viable
      .map((candidate) => ({ candidate, details: targetScoreDetails(origin, facing, candidate, policy.priority) }))
      .sort((left, right) => right.details.score - left.details.score);
    const best = scored[0];
    if (!best) return undefined;

    const current = this.targetId
      ? scored.find((entry) => entry.candidate.id === this.targetId)
      : undefined;
    const keepCurrent = Boolean(current && current.details.score + device.switchHysteresis >= best.details.score);
    const selected = keepCurrent && current ? current : best;
    this.targetId = selected.candidate.id;
    const offset = {
      x: selected.candidate.position.x - origin.x,
      y: selected.candidate.position.y - origin.y,
    };
    return {
      targetId: selected.candidate.id,
      distance: Math.hypot(offset.x, offset.y),
      direction: normalize(offset, facing),
      score: selected.details.score,
      reason: keepCurrent && selected.candidate.id !== best.candidate.id ? 'lock-stability' : selected.details.reason,
      breakdown: selected.details.breakdown,
    };
  }
}

export function targetScore(
  origin: Vec2,
  facing: Vec2,
  candidate: AutoTargetCandidate,
  priority: AutoTargetPriority = 'balanced',
): number {
  return targetScoreDetails(origin, facing, candidate, priority).score;
}

export function targetScoreDetails(
  origin: Vec2,
  facing: Vec2,
  candidate: AutoTargetCandidate,
  priority: AutoTargetPriority = 'balanced',
): AutoTargetScoreDetails {
  const offset = { x: candidate.position.x - origin.x, y: candidate.position.y - origin.y };
  const targetDistance = Math.hypot(offset.x, offset.y);
  const direction = normalize(offset, facing);
  const normalizedFacing = normalize(facing, { x: 0, y: -1 });
  const forward = direction.x * normalizedFacing.x + direction.y * normalizedFacing.y;
  const hpRatio = Math.max(0, Math.min(1, candidate.hp / Math.max(1, candidate.maxHp)));

  const distanceScore = 500 - targetDistance;
  const facingScore = forward * 52;
  const rankScore = candidate.rank === 'boss' ? 165 : candidate.rank === 'elite' ? 72 : 0;
  const telegraphScore = candidate.telegraphing ? 42 : 0;
  const finishScore = (1 - hpRatio) * 28;

  let priorityScore = 0;
  let reason: Exclude<AutoTargetReason, 'lock-stability'> = 'balanced-score';
  if (priority === 'nearest') {
    priorityScore = Math.max(0, 220 - targetDistance) * 0.72;
    reason = 'nearest-target';
  } else if (priority === 'boss') {
    priorityScore = candidate.rank === 'boss' ? 220 : candidate.rank === 'elite' ? 100 : -20;
    reason = 'boss-priority';
  } else if (priority === 'weak') {
    priorityScore = (1 - hpRatio) * 180;
    reason = 'weak-target';
  } else if (priority === 'threat') {
    priorityScore = candidate.telegraphing ? 210 : -10;
    reason = 'threat-priority';
  }

  const total = distanceScore + facingScore + rankScore + telegraphScore + finishScore + priorityScore;
  return {
    score: total,
    reason,
    breakdown: {
      distance: distanceScore,
      facing: facingScore,
      rank: rankScore,
      telegraph: telegraphScore,
      finish: finishScore,
      priority: priorityScore,
      total,
    },
  };
}

export function autoTargetReasonLabel(reason: AutoTargetReason): string {
  if (reason === 'nearest-target') return '가까운 거리 우선';
  if (reason === 'boss-priority') return '보스·엘리트 우선';
  if (reason === 'weak-target') return '마무리 가능성 우선';
  if (reason === 'threat-priority') return '공격 예고 대응';
  if (reason === 'lock-stability') return '타겟 흔들림 방지 유지';
  return '거리·방향·등급 종합';
}
