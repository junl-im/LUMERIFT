import type { AutoBattleStrategyPreset, BossDodgePolicy } from '../../core/input/CombatAssistController';
import type { TelegraphUrgency } from './BossTelegraphLanguage';

export interface BossThreatHudInput {
  readonly urgency: TelegraphUrgency;
  readonly patternLabel: string;
  readonly remainingSeconds: number;
  readonly autoBattle: boolean;
  readonly autoDodge: boolean;
  readonly bossDodgePolicy: BossDodgePolicy;
  readonly strategyPreset: AutoBattleStrategyPreset;
}

export interface BossThreatHudPresentation {
  readonly headline: string;
  readonly guidance: string;
  readonly tone: 'warning' | 'danger' | 'critical';
  readonly pulseRate: number;
  readonly showAutoBadge: boolean;
}

export function resolveBossThreatHud(input: BossThreatHudInput): BossThreatHudPresentation {
  const autoEvadeAvailable = input.autoBattle && input.autoDodge && input.bossDodgePolicy !== 'off';
  const criticalOnlyHold = input.bossDodgePolicy === 'critical-only' && input.urgency !== 'critical';
  const presetLabel = input.strategyPreset === 'aggressive'
    ? '공격형'
    : input.strategyPreset === 'conservative'
      ? '보존형'
      : input.strategyPreset === 'custom'
        ? '사용자'
        : '균형형';

  if (input.urgency === 'critical') {
    return {
      headline: `즉시 회피 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
      guidance: autoEvadeAvailable
        ? `AUTO EVADE READY · ${presetLabel} 프리셋`
        : '수동 회피 버튼 또는 안전 방향 이동',
      tone: 'critical',
      pulseRate: 18,
      showAutoBadge: autoEvadeAvailable,
    };
  }

  if (input.urgency === 'danger') {
    return {
      headline: `위험 접근 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
      guidance: autoEvadeAvailable && !criticalOnlyHold
        ? `자동 회피 준비 · ${presetLabel} 프리셋`
        : criticalOnlyHold
          ? '치명 단계까지 거리 유지 · 수동 회피 준비'
          : '안전 방향 확보 · 회피 쿨다운 확인',
      tone: 'danger',
      pulseRate: 10,
      showAutoBadge: autoEvadeAvailable && !criticalOnlyHold,
    };
  }

  return {
    headline: `공격 예고 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
    guidance: autoEvadeAvailable
      ? `회피 판단 대기 · ${presetLabel} 프리셋`
      : '텔레그래프 범위와 이동 경로 확인',
    tone: 'warning',
    pulseRate: 5,
    showAutoBadge: autoEvadeAvailable,
  };
}
