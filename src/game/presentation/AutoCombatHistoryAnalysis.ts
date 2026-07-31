import type { AutoBattleStrategyPreset } from '../../core/input/CombatAssistController';
import type { AutoCombatHistoryEntry } from '../combat/AutoCombatHistoryStore';
import { resolveAutoPresetPerformance } from './AutoPresetPerformance';

export type BuiltInAutoBattlePreset = Exclude<AutoBattleStrategyPreset, 'custom'>;

export interface AutoCombatPresetAggregate {
  readonly preset: BuiltInAutoBattlePreset;
  readonly score: number;
  readonly sessions: number;
  readonly victories: number;
  readonly averageClearSeconds: number;
  readonly averageManualInterventions: number;
}

export interface AutoCombatHistoryAnalysis {
  readonly totalSessions: number;
  readonly victories: number;
  readonly recommendedPreset: BuiltInAutoBattlePreset;
  readonly aggregates: readonly AutoCombatPresetAggregate[];
  readonly recent: readonly AutoCombatHistoryEntry[];
}

const PRESETS: readonly BuiltInAutoBattlePreset[] = ['aggressive', 'balanced', 'conservative'];

export function analyzeAutoCombatHistory(entries: readonly AutoCombatHistoryEntry[]): AutoCombatHistoryAnalysis {
  const reports = entries.map((entry) => ({
    entry,
    report: resolveAutoPresetPerformance({
      victory: entry.victory,
      clearSeconds: entry.clearSeconds,
      maxCombo: entry.maxCombo,
      defeated: entry.defeated,
      summary: entry.summary,
    }),
  }));

  const aggregates = PRESETS.map((preset) => {
    const scores = reports.map(({ report }) => report.scores.find((score) => score.preset === preset)?.score ?? 0);
    const used = entries.filter((entry) => entry.summary.strategyPreset === preset);
    return {
      preset,
      score: average(scores),
      sessions: used.length,
      victories: used.filter((entry) => entry.victory).length,
      averageClearSeconds: average(used.map((entry) => entry.clearSeconds)),
      averageManualInterventions: average(used.map((entry) => entry.summary.manualInterventions)),
    };
  }).sort((left, right) => right.score - left.score);

  return {
    totalSessions: entries.length,
    victories: entries.filter((entry) => entry.victory).length,
    recommendedPreset: aggregates[0]?.preset ?? 'balanced',
    aggregates,
    recent: entries.slice(0, 6),
  };
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
