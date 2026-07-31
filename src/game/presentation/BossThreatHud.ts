import type { AutoBattleStrategyPreset, BossDodgePolicy } from '../../core/input/CombatAssistController';
import { resolveBossDodgeRule } from '../combat/BossDodgeRules';
import type { TelegraphUrgency } from './BossTelegraphLanguage';

export interface BossThreatHudInput {
  readonly urgency: TelegraphUrgency;
  readonly patternId?: string;
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
  readonly accentColor: number;
  readonly icon: string;
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
  const rule = resolveBossDodgeRule(input.patternId);

  if (input.urgency === 'critical') {
    return {
      headline: `${rule.hudIcon} 즉시 회피 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
      guidance: autoEvadeAvailable
        ? `AUTO EVADE READY · ${presetLabel} · ${rule.safeMoveLabel}`
        : `수동 회피 · ${rule.safeMoveLabel}`,
      tone: 'critical',
      pulseRate: 18,
      showAutoBadge: autoEvadeAvailable,
      accentColor: rule.criticalColor,
      icon: rule.hudIcon,
    };
  }

  if (input.urgency === 'danger') {
    return {
      headline: `${rule.hudIcon} 위험 접근 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
      guidance: autoEvadeAvailable && !criticalOnlyHold
        ? `자동 회피 준비 · ${presetLabel} · ${rule.safeMoveLabel}`
        : criticalOnlyHold
          ? `치명 단계까지 대기 · ${rule.safeMoveLabel}`
          : `회피 준비 · ${rule.safeMoveLabel}`,
      tone: 'danger',
      pulseRate: 10,
      showAutoBadge: autoEvadeAvailable && !criticalOnlyHold,
      accentColor: rule.dangerColor,
      icon: rule.hudIcon,
    };
  }

  return {
    headline: `${rule.hudIcon} 공격 예고 · ${input.patternLabel} · ${input.remainingSeconds.toFixed(1)}s`,
    guidance: autoEvadeAvailable
      ? `회피 판단 대기 · ${presetLabel} · ${rule.safeMoveLabel}`
      : `텔레그래프 확인 · ${rule.safeMoveLabel}`,
    tone: 'warning',
    pulseRate: 5,
    showAutoBadge: autoEvadeAvailable,
    accentColor: rule.warningColor,
    icon: rule.hudIcon,
  };
}
