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

export interface AutoTargetSnapshot {
  readonly targetId?: string;
  readonly distance: number;
  readonly direction: Vec2;
  readonly score: number;
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
      .map((candidate) => ({ candidate, score: targetScore(origin, facing, candidate, policy.priority) }))
      .sort((left, right) => right.score - left.score);
    const best = scored[0];
    if (!best) return undefined;

    const current = this.targetId
      ? scored.find((entry) => entry.candidate.id === this.targetId)
      : undefined;
    const selected = current && current.score + device.switchHysteresis >= best.score ? current : best;
    this.targetId = selected.candidate.id;
    const offset = {
      x: selected.candidate.position.x - origin.x,
      y: selected.candidate.position.y - origin.y,
    };
    return {
      targetId: selected.candidate.id,
      distance: Math.hypot(offset.x, offset.y),
      direction: normalize(offset, facing),
      score: selected.score,
    };
  }
}

export function targetScore(
  origin: Vec2,
  facing: Vec2,
  candidate: AutoTargetCandidate,
  priority: AutoTargetPriority = 'balanced',
): number {
  const offset = { x: candidate.position.x - origin.x, y: candidate.position.y - origin.y };
  const targetDistance = Math.hypot(offset.x, offset.y);
  const direction = normalize(offset, facing);
  const normalizedFacing = normalize(facing, { x: 0, y: -1 });
  const forward = direction.x * normalizedFacing.x + direction.y * normalizedFacing.y;
  const hpRatio = Math.max(0, Math.min(1, candidate.hp / Math.max(1, candidate.maxHp)));
  const rankBonus = candidate.rank === 'boss' ? 165 : candidate.rank === 'elite' ? 72 : 0;
  const telegraphBonus = candidate.telegraphing ? 42 : 0;
  const finishBonus = (1 - hpRatio) * 28;

  let priorityBonus = 0;
  if (priority === 'nearest') priorityBonus = Math.max(0, 220 - targetDistance) * 0.72;
  if (priority === 'boss') priorityBonus = candidate.rank === 'boss' ? 220 : candidate.rank === 'elite' ? 100 : -20;
  if (priority === 'weak') priorityBonus = (1 - hpRatio) * 180;
  if (priority === 'threat') priorityBonus = candidate.telegraphing ? 210 : -10;

  return 500 - targetDistance + forward * 52 + rankBonus + telegraphBonus + finishBonus + priorityBonus;
}
