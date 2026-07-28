import type { MonsterPatternConfig, MonsterRank } from '../combat/combatData';

export type TelegraphUrgency = 'warning' | 'danger' | 'critical';

export interface BossTelegraphStyle {
  readonly urgency: TelegraphUrgency;
  readonly label: string;
  readonly symbol: string;
  readonly tickCount: number;
  readonly lineWidth: number;
  readonly fillAlpha: number;
  readonly pulseScale: number;
  readonly whiteFlashAlpha: number;
}

export function resolveBossTelegraphStyle(
  pattern: MonsterPatternConfig,
  progress: number,
  phase: number,
  rank: MonsterRank,
): BossTelegraphStyle {
  const clamped = Math.max(0, Math.min(1, progress));
  const urgency: TelegraphUrgency = clamped >= 0.78 ? 'critical' : clamped >= 0.46 ? 'danger' : 'warning';
  const isBoss = rank === 'boss';
  const symbol = pattern.shape === 'circle' ? '◎' : '◢';
  const urgencyLabel = urgency === 'critical' ? '회피' : urgency === 'danger' ? '위험' : '예고';
  return {
    urgency,
    label: `${symbol} ${urgencyLabel} · ${pattern.label}`,
    symbol,
    tickCount: Math.max(8, Math.min(24, 8 + (isBoss ? phase * 4 : 0))),
    lineWidth: 3 + clamped * (isBoss ? 8 : 5),
    fillAlpha: 0.08 + clamped * (isBoss ? 0.2 : 0.13),
    pulseScale: 1 + Math.sin(clamped * Math.PI) * (isBoss ? 0.06 : 0.03),
    whiteFlashAlpha: urgency === 'critical' ? (clamped - 0.78) / 0.22 : 0,
  };
}
