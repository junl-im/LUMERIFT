import { describe, expect, it } from 'vitest';
import { AutoCombatSessionLog } from './AutoCombatSessionLog';

describe('AutoCombatSessionLog', () => {
  it('summarizes target changes, automated actions, and manual intervention', () => {
    const log = new AutoCombatSessionLog();
    log.update(1.2, true);
    log.recordTarget('enemy-1', 'nearest-target');
    log.recordTarget('enemy-2', 'boss-priority');
    log.recordAction('attack', 'basic-range');
    log.recordAction('skill1', 'skill1-ready');
    log.recordAction('dodge', 'boss-nova-evade', 'boss_nova');
    log.recordManualIntervention('move');

    const summary = log.snapshot();
    expect(summary.enabledSeconds).toBe(1.2);
    expect(summary.targetChanges).toBe(1);
    expect(summary.attacks).toBe(1);
    expect(summary.skill1Uses).toBe(1);
    expect(summary.dodges).toBe(1);
    expect(summary.manualInterventions).toBe(1);
    expect(summary.bossPatternDodges.boss_nova).toBe(1);
  });
});
