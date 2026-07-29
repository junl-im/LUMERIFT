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

export interface AutoTargetSnapshot {
  readonly targetId?: string;
  readonly distance: number;
  readonly direction: Vec2;
  readonly score: number;
}

const MAX_LOCK_DISTANCE = 430;
const SWITCH_HYSTERESIS = 34;

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

  public update(origin: Vec2, facing: Vec2, candidates: readonly AutoTargetCandidate[]): AutoTargetSnapshot | undefined {
    const viable = candidates.filter((candidate) => candidate.alive && distance(origin, candidate.position) <= MAX_LOCK_DISTANCE);
    if (viable.length === 0) {
      this.targetId = undefined;
      return undefined;
    }

    const scored = viable
      .map((candidate) => ({ candidate, score: targetScore(origin, facing, candidate) }))
      .sort((left, right) => right.score - left.score);
    const best = scored[0];
    if (!best) return undefined;

    const current = this.targetId
      ? scored.find((entry) => entry.candidate.id === this.targetId)
      : undefined;
    const selected = current && current.score + SWITCH_HYSTERESIS >= best.score ? current : best;
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

export function targetScore(origin: Vec2, facing: Vec2, candidate: AutoTargetCandidate): number {
  const offset = { x: candidate.position.x - origin.x, y: candidate.position.y - origin.y };
  const targetDistance = Math.hypot(offset.x, offset.y);
  const direction = normalize(offset, facing);
  const normalizedFacing = normalize(facing, { x: 0, y: -1 });
  const forward = direction.x * normalizedFacing.x + direction.y * normalizedFacing.y;
  const rankBonus = candidate.rank === 'boss' ? 165 : candidate.rank === 'elite' ? 72 : 0;
  const telegraphBonus = candidate.telegraphing ? 42 : 0;
  const finishBonus = (1 - Math.max(0, Math.min(1, candidate.hp / Math.max(1, candidate.maxHp)))) * 28;
  return 500 - targetDistance + forward * 52 + rankBonus + telegraphBonus + finishBonus;
}
