import { describe, expect, it } from 'vitest';
import { analyzeAutoCombatHistory } from './AutoCombatHistoryAnalysis';
import type { AutoCombatHistoryEntry } from '../combat/AutoCombatHistoryStore';

const entry: AutoCombatHistoryEntry = {
  id: '1', completedAt: 1, stageId: 'stage_1', stageLabel: 'stage', victory: true,
  clearSeconds: 42, maxCombo: 7, defeated: 8,
  summary: {
    enabledSeconds: 35, strategyPreset: 'aggressive', targetChanges: 2, attacks: 8,
    skill1Uses: 4, skill2Uses: 3, dodges: 2, manualInterventions: 0,
    bossPatternDodges: {}, topReason: 'priority-skill2', recentReasons: [],
  },
};

describe('analyzeAutoCombatHistory', () => {
  it('recommends an aggressive profile for fast skill-heavy clears', () => {
    const analysis = analyzeAutoCombatHistory([entry]);
    expect(analysis.recommendedPreset).toBe('aggressive');
    expect(analysis.totalSessions).toBe(1);
  });
});
