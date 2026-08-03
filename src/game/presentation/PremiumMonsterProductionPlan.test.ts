import { describe, expect, it } from 'vitest';
import { PREMIUM_MONSTER_PRODUCTION_PLAN, premiumMonsterPlanTotals } from './PremiumMonsterProductionPlan';

describe('PremiumMonsterProductionPlan', () => {
  it('plans three elites and one boss', () => {
    const totals = premiumMonsterPlanTotals();
    expect(totals.eliteCount).toBe(3);
    expect(totals.bossCount).toBe(1);
    expect(totals.plannedFrames).toBe(936);
    expect(totals.initialBundleEntries).toBe(0);
  });

  it('keeps every target on eight directions', () => {
    expect(PREMIUM_MONSTER_PRODUCTION_PLAN.every((entry) => entry.directions === 8)).toBe(true);
  });
});
