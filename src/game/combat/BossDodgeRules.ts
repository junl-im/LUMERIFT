import { normalize, type Vec2 } from './geometry';

export type BossDodgeDirectionMode = 'perpendicular' | 'away' | 'diagonal';

export interface BossDodgeRule {
  readonly patternId: string;
  readonly label: string;
  readonly triggerProgress: number;
  readonly critical: boolean;
  readonly directionMode: BossDodgeDirectionMode;
  readonly reason: string;
}

const DEFAULT_RULE: BossDodgeRule = {
  patternId: 'unknown',
  label: '보스 패턴',
  triggerProgress: 0.72,
  critical: true,
  directionMode: 'perpendicular',
  reason: 'boss-critical-evade',
};

const BOSS_DODGE_RULES: Readonly<Record<string, BossDodgeRule>> = {
  boss_cleave: {
    patternId: 'boss_cleave',
    label: '심연 절단',
    triggerProgress: 0.54,
    critical: false,
    directionMode: 'perpendicular',
    reason: 'boss-cleave-evade',
  },
  boss_nova: {
    patternId: 'boss_nova',
    label: '심연 폭발',
    triggerProgress: 0.46,
    critical: true,
    directionMode: 'away',
    reason: 'boss-nova-evade',
  },
  boss_rupture: {
    patternId: 'boss_rupture',
    label: '추적 균열',
    triggerProgress: 0.66,
    critical: true,
    directionMode: 'diagonal',
    reason: 'boss-rupture-evade',
  },
};

export function resolveBossDodgeRule(patternId: string | undefined): BossDodgeRule {
  return patternId ? (BOSS_DODGE_RULES[patternId] ?? DEFAULT_RULE) : DEFAULT_RULE;
}

export function resolveBossDodgeDirection(rule: BossDodgeRule, targetDirection: Vec2): Vec2 {
  const facing = normalize(targetDirection, { x: 0, y: -1 });
  if (rule.directionMode === 'away') {
    return { x: -facing.x, y: -facing.y };
  }
  if (rule.directionMode === 'diagonal') {
    return normalize({
      x: -facing.x - facing.y * 0.72,
      y: -facing.y + facing.x * 0.72,
    }, { x: 1, y: 0 });
  }
  return normalize({ x: -facing.y, y: facing.x }, { x: 1, y: 0 });
}

export function bossDodgeReasonLabel(reason: string): string {
  if (reason === 'boss-cleave-evade') return '심연 절단 측면 회피';
  if (reason === 'boss-nova-evade') return '심연 폭발 범위 이탈';
  if (reason === 'boss-rupture-evade') return '추적 균열 대각 회피';
  return '보스 치명 패턴 회피';
}
