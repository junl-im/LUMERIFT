import type { AutoBattleStrategyPreset } from '../../core/input/CombatAssistController';
import type { AutoCombatSessionSummary } from '../combat/AutoCombatSessionLog';

export type ComparableAutoBattlePreset = Exclude<AutoBattleStrategyPreset, 'custom'>;

export interface AutoPresetPerformanceInput {
  readonly victory: boolean;
  readonly clearSeconds: number;
  readonly maxCombo: number;
  readonly defeated: number;
  readonly summary?: AutoCombatSessionSummary;
}

export interface AutoPresetScore {
  readonly preset: ComparableAutoBattlePreset;
  readonly score: number;
  readonly reason: string;
}

export interface AutoPresetPerformanceReport {
  readonly recommendedPreset: ComparableAutoBattlePreset;
  readonly scores: readonly AutoPresetScore[];
  readonly headline: string;
}

export function resolveAutoPresetPerformance(input: AutoPresetPerformanceInput): AutoPresetPerformanceReport {
  const summary = input.summary;
  if (!summary || summary.enabledSeconds <= 0) {
    return {
      recommendedPreset: 'balanced',
      scores: [
        { preset: 'aggressive', score: 50, reason: '자동 전투 기록 부족' },
        { preset: 'balanced', score: 72, reason: '기본 추천' },
        { preset: 'conservative', score: 52, reason: '자동 전투 기록 부족' },
      ],
      headline: '자동 전투 기록이 부족해 균형형을 기본 추천합니다.',
    };
  }

  const totalActions = Math.max(1, summary.attacks + summary.skill1Uses + summary.skill2Uses + summary.dodges);
  const skills = summary.skill1Uses + summary.skill2Uses;
  const skillShare = skills / totalActions;
  const dodgeShare = summary.dodges / totalActions;
  const manualShare = summary.manualInterventions / Math.max(1, totalActions + summary.manualInterventions);
  const pace = clamp01((110 - input.clearSeconds) / 70);
  const combo = clamp01(input.maxCombo / 8);
  const clearBonus = input.victory ? 1 : 0;
  const targetFlow = clamp01((input.defeated + summary.targetChanges * 0.5) / 12);

  const aggressive = score(
    36
      + pace * 25
      + skillShare * 24
      + combo * 12
      + targetFlow * 8
      + clearBonus * 8
      - manualShare * 20
      - dodgeShare * 4,
  );
  const balanced = score(
    42
      + clearBonus * 10
      + (1 - Math.abs(skillShare - 0.32)) * 12
      + (1 - Math.abs(dodgeShare - 0.16)) * 10
      + combo * 7
      + targetFlow * 6
      - manualShare * 14,
  );
  const conservative = score(
    40
      + clearBonus * 12
      + dodgeShare * 22
      + (1 - skillShare) * 16
      + (1 - pace) * 8
      + targetFlow * 5
      - manualShare * 12,
  );

  const scores: AutoPresetScore[] = [
    { preset: 'aggressive', score: aggressive, reason: aggressiveReason(skillShare, pace, manualShare) },
    { preset: 'balanced', score: balanced, reason: balancedReason(skillShare, dodgeShare, manualShare) },
    { preset: 'conservative', score: conservative, reason: conservativeReason(skillShare, dodgeShare, pace) },
  ];
  scores.sort((left, right) => right.score - left.score || presetOrder(left.preset) - presetOrder(right.preset));
  const recommendedPreset = scores[0]?.preset ?? 'balanced';
  return {
    recommendedPreset,
    scores,
    headline: `${presetKoreanLabel(recommendedPreset)} 적합도 ${scores[0]?.score ?? 0}점 · ${scores[0]?.reason ?? '균형 운용 권장'}`,
  };
}

export function autoPresetPerformanceCompactLabel(report: AutoPresetPerformanceReport): string {
  const byPreset = new Map(report.scores.map((entry) => [entry.preset, entry.score] as const));
  return `공격 ${byPreset.get('aggressive') ?? 0} · 균형 ${byPreset.get('balanced') ?? 0} · 보존 ${byPreset.get('conservative') ?? 0}`;
}

function score(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function presetOrder(value: ComparableAutoBattlePreset): number {
  if (value === 'aggressive') return 0;
  if (value === 'balanced') return 1;
  return 2;
}

function presetKoreanLabel(value: ComparableAutoBattlePreset): string {
  if (value === 'aggressive') return '공격형';
  if (value === 'conservative') return '보존형';
  return '균형형';
}

function aggressiveReason(skillShare: number, pace: number, manualShare: number): string {
  if (manualShare > 0.25) return '수동 개입을 줄이면 공격형 효율 상승';
  if (skillShare >= 0.35 && pace >= 0.55) return '빠른 클리어와 높은 스킬 비중';
  return '스킬 사용과 진행 속도를 더 높일 여지';
}

function balancedReason(skillShare: number, dodgeShare: number, manualShare: number): string {
  if (manualShare <= 0.12 && skillShare >= 0.18 && dodgeShare >= 0.06) return '공격·회피·수동 개입 균형 안정';
  return '전반적인 전투 흐름 보정에 적합';
}

function conservativeReason(skillShare: number, dodgeShare: number, pace: number): string {
  if (dodgeShare >= 0.16 && skillShare <= 0.28) return '회피 중심과 Drive 보존 성향';
  if (pace < 0.4) return '긴 전투에서 안정 운용에 유리';
  return '스킬 소비를 줄인 안정 운용 후보';
}
