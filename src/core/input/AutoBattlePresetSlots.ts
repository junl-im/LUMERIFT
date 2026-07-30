import type {
  AutoSkillHpRule,
  AutoTargetPriority,
  BossAutoMode,
  BossDodgePolicy,
  CombatAssistSettings,
  CombatDevicePreset,
  ManualResumeDelay,
} from './CombatAssistController';

export type AutoBattlePresetSlotId = 1 | 2 | 3;

export interface AutoBattlePresetSnapshot {
  readonly targetPriority: AutoTargetPriority;
  readonly autoSkills: boolean;
  readonly autoDodge: boolean;
  readonly bossAutoMode: BossAutoMode;
  readonly devicePreset: CombatDevicePreset;
  readonly autoSkillHpRule: AutoSkillHpRule;
  readonly bossDodgePolicy: BossDodgePolicy;
  readonly manualResumeDelay: ManualResumeDelay;
}

export interface AutoBattlePresetSlot {
  readonly id: AutoBattlePresetSlotId;
  readonly updatedAt: number;
  readonly snapshot: AutoBattlePresetSnapshot;
}

export interface AutoBattlePresetSlotState {
  readonly selectedSlot: AutoBattlePresetSlotId;
  readonly slots: Readonly<Partial<Record<AutoBattlePresetSlotId, AutoBattlePresetSlot>>>;
}

const STORAGE_KEY = 'lumerift.autoBattlePresetSlots.v1';
const SLOT_ORDER: readonly AutoBattlePresetSlotId[] = [1, 2, 3];
const EMPTY_STATE: AutoBattlePresetSlotState = { selectedSlot: 1, slots: {} };

export class AutoBattlePresetSlotStore {
  private state: AutoBattlePresetSlotState;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined) {
    this.state = readState(storage);
    this.persist();
  }

  public get current(): AutoBattlePresetSlotState {
    return this.state;
  }

  public cycleSelectedSlot(): AutoBattlePresetSlotId {
    const index = SLOT_ORDER.indexOf(this.state.selectedSlot);
    const selectedSlot = SLOT_ORDER[(index + 1) % SLOT_ORDER.length] ?? 1;
    this.state = { ...this.state, selectedSlot };
    this.persist();
    return selectedSlot;
  }

  public selectSlot(slotId: AutoBattlePresetSlotId): AutoBattlePresetSlotId {
    this.state = { ...this.state, selectedSlot: slotId };
    this.persist();
    return slotId;
  }

  public save(settings: CombatAssistSettings, updatedAt = Date.now()): AutoBattlePresetSlot {
    const slot: AutoBattlePresetSlot = {
      id: this.state.selectedSlot,
      updatedAt: Math.max(0, Math.floor(updatedAt)),
      snapshot: captureAutoBattlePreset(settings),
    };
    this.state = {
      ...this.state,
      slots: { ...this.state.slots, [slot.id]: slot },
    };
    this.persist();
    return slot;
  }

  public load(): AutoBattlePresetSnapshot | undefined {
    return this.state.slots[this.state.selectedSlot]?.snapshot;
  }

  public clear(): void {
    const slots = { ...this.state.slots };
    delete slots[this.state.selectedSlot];
    this.state = { ...this.state, slots };
    this.persist();
  }

  private persist(): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export function captureAutoBattlePreset(settings: CombatAssistSettings): AutoBattlePresetSnapshot {
  return {
    targetPriority: settings.targetPriority,
    autoSkills: settings.autoSkills,
    autoDodge: settings.autoDodge,
    bossAutoMode: settings.bossAutoMode,
    devicePreset: settings.devicePreset,
    autoSkillHpRule: settings.autoSkillHpRule,
    bossDodgePolicy: settings.bossDodgePolicy,
    manualResumeDelay: settings.manualResumeDelay,
  };
}

export function autoBattlePresetSlotLabel(state: AutoBattlePresetSlotState): string {
  const slot = state.slots[state.selectedSlot];
  return `SLOT ${state.selectedSlot} · ${slot ? 'SAVED' : 'EMPTY'}`;
}

export function autoBattlePresetSlotUpdatedLabel(slot: AutoBattlePresetSlot | undefined): string {
  if (!slot) return '저장된 사용자 프리셋이 없습니다.';
  const date = new Date(slot.updatedAt);
  if (Number.isNaN(date.getTime())) return '사용자 프리셋 저장됨';
  return `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 저장`;
}

function readState(storage: Pick<Storage, 'getItem'> | undefined): AutoBattlePresetSlotState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return EMPTY_STATE;
    const selectedSlot = isSlotId(parsed.selectedSlot) ? parsed.selectedSlot : 1;
    const slotsValue = isRecord(parsed.slots) ? parsed.slots : {};
    const slots: Partial<Record<AutoBattlePresetSlotId, AutoBattlePresetSlot>> = {};
    for (const slotId of SLOT_ORDER) {
      const slot = normalizeSlot(slotsValue[String(slotId)], slotId);
      if (slot) slots[slotId] = slot;
    }
    return { selectedSlot, slots };
  } catch {
    return EMPTY_STATE;
  }
}

function normalizeSlot(value: unknown, id: AutoBattlePresetSlotId): AutoBattlePresetSlot | undefined {
  if (!isRecord(value) || !isRecord(value.snapshot)) return undefined;
  const snapshot = normalizeSnapshot(value.snapshot);
  if (!snapshot) return undefined;
  return {
    id,
    updatedAt: typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt) ? Math.max(0, Math.floor(value.updatedAt)) : 0,
    snapshot,
  };
}

function normalizeSnapshot(value: Record<string, unknown>): AutoBattlePresetSnapshot | undefined {
  if (!isTargetPriority(value.targetPriority)) return undefined;
  if (typeof value.autoSkills !== 'boolean' || typeof value.autoDodge !== 'boolean') return undefined;
  if (!isBossAutoMode(value.bossAutoMode)) return undefined;
  if (!isDevicePreset(value.devicePreset)) return undefined;
  if (!isAutoSkillHpRule(value.autoSkillHpRule)) return undefined;
  if (!isBossDodgePolicy(value.bossDodgePolicy)) return undefined;
  if (!isManualResumeDelay(value.manualResumeDelay)) return undefined;
  return {
    targetPriority: value.targetPriority,
    autoSkills: value.autoSkills,
    autoDodge: value.autoDodge,
    bossAutoMode: value.bossAutoMode,
    devicePreset: value.devicePreset,
    autoSkillHpRule: value.autoSkillHpRule,
    bossDodgePolicy: value.bossDodgePolicy,
    manualResumeDelay: value.manualResumeDelay,
  };
}

function isSlotId(value: unknown): value is AutoBattlePresetSlotId {
  return value === 1 || value === 2 || value === 3;
}

function isTargetPriority(value: unknown): value is AutoTargetPriority {
  return value === 'balanced' || value === 'nearest' || value === 'boss' || value === 'weak' || value === 'threat';
}

function isBossAutoMode(value: unknown): value is BossAutoMode {
  return value === 'full' || value === 'target-only' || value === 'off';
}

function isDevicePreset(value: unknown): value is CombatDevicePreset {
  return value === 'responsive' || value === 'balanced' || value === 'stable';
}

function isAutoSkillHpRule(value: unknown): value is AutoSkillHpRule {
  return value === 'always' || value === 'below-85' || value === 'below-65' || value === 'emergency';
}

function isBossDodgePolicy(value: unknown): value is BossDodgePolicy {
  return value === 'all' || value === 'critical-only' || value === 'off';
}

function isManualResumeDelay(value: unknown): value is ManualResumeDelay {
  return value === 'instant' || value === 'brief' || value === 'delayed';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
