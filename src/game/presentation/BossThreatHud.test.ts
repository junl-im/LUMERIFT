import { describe, expect, it } from 'vitest';
import { resolveBossThreatHud } from './BossThreatHud';

const base = {
  patternId: 'boss_nova',
  patternLabel: '심연 폭발',
  remainingSeconds: 0.6,
  autoBattle: true,
  autoDodge: true,
  bossDodgePolicy: 'critical-only' as const,
  strategyPreset: 'balanced' as const,
};

describe('resolveBossThreatHud', () => {
  it('shows auto evade readiness on a critical pattern', () => {
    const presentation = resolveBossThreatHud({ ...base, urgency: 'critical' });
    expect(presentation.headline).toContain('즉시 회피');
    expect(presentation.guidance).toContain('AUTO EVADE READY');
    expect(presentation.showAutoBadge).toBe(true);
    expect(presentation.accentColor).toBeGreaterThan(0);
    expect(presentation.headline).toContain('◎');
  });

  it('holds critical-only automation before the critical stage', () => {
    const presentation = resolveBossThreatHud({ ...base, urgency: 'danger' });
    expect(presentation.guidance).toContain('치명 단계까지');
    expect(presentation.showAutoBadge).toBe(false);
  });

  it('falls back to manual guidance when auto dodge is disabled', () => {
    const presentation = resolveBossThreatHud({ ...base, urgency: 'critical', autoDodge: false });
    expect(presentation.guidance).toContain('수동 회피');
  });
});
