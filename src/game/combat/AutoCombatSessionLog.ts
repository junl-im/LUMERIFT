import type { AutoBattleStrategyPreset } from '../../core/input/CombatAssistController';
import type { AutoBattleAction } from './AutoBattleController';

export interface AutoCombatSessionSummary {
  readonly enabledSeconds: number;
  readonly strategyPreset: AutoBattleStrategyPreset;
  readonly targetChanges: number;
  readonly attacks: number;
  readonly skill1Uses: number;
  readonly skill2Uses: number;
  readonly dodges: number;
  readonly manualInterventions: number;
  readonly bossPatternDodges: Readonly<Record<string, number>>;
  readonly topReason: string;
  readonly recentReasons: readonly string[];
}

export class AutoCombatSessionLog {
  private enabledSeconds = 0;
  private strategyPreset: AutoBattleStrategyPreset = 'balanced';
  private targetChanges = 0;
  private attacks = 0;
  private skill1Uses = 0;
  private skill2Uses = 0;
  private dodges = 0;
  private manualInterventions = 0;
  private readonly bossPatternDodges: Record<string, number> = {};
  private readonly reasonCounts: Record<string, number> = {};
  private readonly recentReasons: string[] = [];
  private lastTargetId?: string;
  private lastReason = '';

  public update(deltaSeconds: number, enabled: boolean, strategyPreset?: AutoBattleStrategyPreset): void {
    if (enabled) this.enabledSeconds += Math.max(0, deltaSeconds);
    if (strategyPreset) this.strategyPreset = strategyPreset;
  }

  public setStrategyPreset(strategyPreset: AutoBattleStrategyPreset): void {
    this.strategyPreset = strategyPreset;
  }

  public recordTarget(targetId: string | undefined, reason: string): void {
    if (!targetId) {
      this.lastTargetId = undefined;
      return;
    }
    if (this.lastTargetId && this.lastTargetId !== targetId) this.targetChanges += 1;
    this.lastTargetId = targetId;
    this.recordReason(reason);
  }

  public recordReason(reason: string): void {
    if (!reason || reason === this.lastReason) return;
    this.lastReason = reason;
    this.reasonCounts[reason] = (this.reasonCounts[reason] ?? 0) + 1;
    this.recentReasons.unshift(reason);
    if (this.recentReasons.length > 5) this.recentReasons.length = 5;
  }

  public recordAction(action: AutoBattleAction, reason: string, bossPatternId?: string): void {
    if (action === 'attack') this.attacks += 1;
    else if (action === 'skill1') this.skill1Uses += 1;
    else if (action === 'skill2') this.skill2Uses += 1;
    else if (action === 'dodge') {
      this.dodges += 1;
      if (bossPatternId) {
        this.bossPatternDodges[bossPatternId] = (this.bossPatternDodges[bossPatternId] ?? 0) + 1;
      }
    }
    this.recordReason(reason);
  }

  public recordManualIntervention(reason: 'move' | 'action'): void {
    this.manualInterventions += 1;
    this.recordReason(reason === 'action' ? 'manual-action' : 'manual-move');
  }

  public snapshot(): AutoCombatSessionSummary {
    return {
      enabledSeconds: Math.round(this.enabledSeconds * 10) / 10,
      strategyPreset: this.strategyPreset,
      targetChanges: this.targetChanges,
      attacks: this.attacks,
      skill1Uses: this.skill1Uses,
      skill2Uses: this.skill2Uses,
      dodges: this.dodges,
      manualInterventions: this.manualInterventions,
      bossPatternDodges: { ...this.bossPatternDodges },
      topReason: topReason(this.reasonCounts),
      recentReasons: [...this.recentReasons],
    };
  }
}

function topReason(counts: Readonly<Record<string, number>>): string {
  let best = 'auto-idle';
  let bestCount = 0;
  for (const [reason, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = reason;
      bestCount = count;
    }
  }
  return best;
}
