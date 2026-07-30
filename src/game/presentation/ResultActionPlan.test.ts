import { describe, expect, it } from 'vitest';
import { resolveResultActionPlan } from './ResultActionPlan';

describe('resolveResultActionPlan', () => {
  it('recommends the next stage after a victory with progression available', () => {
    const plan = resolveResultActionPlan({ victory: true, clearSeconds: 48, maxCombo: 4, nextStageId: 'stage_002', itemDropCount: 1 });
    expect(plan.performanceLabel).toBe('SPEED FOCUS');
    expect(plan.primaryLabel).toBe('다음 스테이지 진행');
  });

  it('recommends recovery after defeat', () => {
    expect(resolveResultActionPlan({ victory: false, clearSeconds: 95, maxCombo: 1, itemDropCount: 0 }).performanceLabel).toBe('TACTICAL RESET');
  });
});
