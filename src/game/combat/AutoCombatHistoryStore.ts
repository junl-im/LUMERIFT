import type { AutoBattleStrategyPreset } from '../../core/input/CombatAssistController';
import type { AutoCombatSessionSummary } from './AutoCombatSessionLog';

export interface AutoCombatHistoryEntry {
  readonly id: string;
  readonly completedAt: number;
  readonly stageId: string;
  readonly stageLabel: string;
  readonly victory: boolean;
  readonly clearSeconds: number;
  readonly maxCombo: number;
  readonly defeated: number;
  readonly summary: AutoCombatSessionSummary;
}

export interface AutoCombatHistoryRecordInput {
  readonly stageId: string;
  readonly stageLabel: string;
  readonly victory: boolean;
  readonly clearSeconds: number;
  readonly maxCombo: number;
  readonly defeated: number;
  readonly summary: AutoCombatSessionSummary;
}

const STORAGE_KEY = 'lumerift.autoCombatHistory.v1';
const MAX_ENTRIES = 18;

export class AutoCombatHistoryStore {
  private entries: AutoCombatHistoryEntry[];

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    this.entries = readEntries(storage);
    this.persist();
  }

  public get current(): readonly AutoCombatHistoryEntry[] {
    return this.entries;
  }

  public record(input: AutoCombatHistoryRecordInput, completedAt = Date.now()): AutoCombatHistoryEntry {
    const timestamp = Number.isFinite(completedAt) ? Math.max(0, Math.floor(completedAt)) : Date.now();
    const entry: AutoCombatHistoryEntry = {
      id: `${timestamp}-${input.stageId}-${this.entries.length}`,
      completedAt: timestamp,
      stageId: input.stageId,
      stageLabel: input.stageLabel,
      victory: input.victory,
      clearSeconds: positive(input.clearSeconds),
      maxCombo: whole(input.maxCombo),
      defeated: whole(input.defeated),
      summary: normalizeSummary(input.summary),
    };
    this.entries = [entry, ...this.entries].slice(0, MAX_ENTRIES);
    this.persist();
    return entry;
  }

  public clear(): void {
    this.entries = [];
    this.persist();
  }

  private persist(): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.entries));
  }
}

function readEntries(storage: Pick<Storage, 'getItem'> | undefined): AutoCombatHistoryEntry[] {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is AutoCombatHistoryEntry => entry !== undefined)
      .sort((left, right) => right.completedAt - left.completedAt)
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function normalizeEntry(value: unknown): AutoCombatHistoryEntry | undefined {
  if (!isRecord(value) || !isRecord(value.summary)) return undefined;
  if (typeof value.stageId !== 'string' || typeof value.stageLabel !== 'string') return undefined;
  if (typeof value.victory !== 'boolean') return undefined;
  const summary = normalizeSummary(value.summary as unknown as AutoCombatSessionSummary);
  const completedAt = typeof value.completedAt === 'number' && Number.isFinite(value.completedAt) ? Math.max(0, Math.floor(value.completedAt)) : 0;
  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : `${completedAt}-${value.stageId}`,
    completedAt,
    stageId: value.stageId,
    stageLabel: value.stageLabel,
    victory: value.victory,
    clearSeconds: positive(value.clearSeconds),
    maxCombo: whole(value.maxCombo),
    defeated: whole(value.defeated),
    summary,
  };
}

function normalizeSummary(value: unknown): AutoCombatSessionSummary {
  const record: Record<string, unknown> = isRecord(value) ? value : {};
  const preset = isStrategyPreset(record.strategyPreset) ? record.strategyPreset : 'balanced';
  return {
    enabledSeconds: positive(record.enabledSeconds),
    strategyPreset: preset,
    targetChanges: whole(record.targetChanges),
    attacks: whole(record.attacks),
    skill1Uses: whole(record.skill1Uses),
    skill2Uses: whole(record.skill2Uses),
    dodges: whole(record.dodges),
    manualInterventions: whole(record.manualInterventions),
    bossPatternDodges: normalizeCounts(record.bossPatternDodges),
    topReason: typeof record.topReason === 'string' ? record.topReason : 'auto-idle',
    recentReasons: Array.isArray(record.recentReasons)
      ? record.recentReasons.filter((reason: unknown): reason is string => typeof reason === 'string').slice(0, 5)
      : [],
  };
}

function normalizeCounts(value: unknown): Readonly<Record<string, number>> {
  if (!isRecord(value)) return {};
  const result: Record<string, number> = {};
  for (const [key, count] of Object.entries(value)) {
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) result[key] = Math.floor(count);
  }
  return result;
}

function positive(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value * 10) / 10) : 0;
}

function whole(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function isStrategyPreset(value: unknown): value is AutoBattleStrategyPreset {
  return value === 'aggressive' || value === 'balanced' || value === 'conservative' || value === 'custom';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
