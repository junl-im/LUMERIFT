export type AutoTargetPriority = 'balanced' | 'nearest' | 'boss' | 'weak' | 'threat';
export type BossAutoMode = 'full' | 'target-only' | 'off';
export type CombatDevicePreset = 'responsive' | 'balanced' | 'stable';
export type AutoSkillHpRule = 'always' | 'below-85' | 'below-65' | 'emergency';
export type BossDodgePolicy = 'all' | 'critical-only' | 'off';
export type ManualResumeDelay = 'instant' | 'brief' | 'delayed';

export interface CombatAssistSettings {
  readonly autoTarget: boolean;
  readonly autoBattle: boolean;
  readonly targetPriority: AutoTargetPriority;
  readonly autoSkills: boolean;
  readonly autoDodge: boolean;
  readonly bossAutoMode: BossAutoMode;
  readonly devicePreset: CombatDevicePreset;
  readonly autoSkillHpRule: AutoSkillHpRule;
  readonly bossDodgePolicy: BossDodgePolicy;
  readonly manualResumeDelay: ManualResumeDelay;
}

const STORAGE_KEY = 'lumerift.combatAssist.v3';
const LEGACY_V2_STORAGE_KEY = 'lumerift.combatAssist.v2';
const LEGACY_STORAGE_KEY = 'lumerift.combatAssist.v1';
const TARGET_PRIORITY_ORDER: readonly AutoTargetPriority[] = ['balanced', 'nearest', 'boss', 'weak', 'threat'];
const BOSS_MODE_ORDER: readonly BossAutoMode[] = ['target-only', 'full', 'off'];
const DEVICE_PRESET_ORDER: readonly CombatDevicePreset[] = ['balanced', 'responsive', 'stable'];
const AUTO_SKILL_HP_ORDER: readonly AutoSkillHpRule[] = ['below-85', 'below-65', 'emergency', 'always'];
const BOSS_DODGE_ORDER: readonly BossDodgePolicy[] = ['critical-only', 'all', 'off'];
const MANUAL_RESUME_ORDER: readonly ManualResumeDelay[] = ['brief', 'instant', 'delayed'];

const DEFAULT_SETTINGS: CombatAssistSettings = {
  autoTarget: true,
  autoBattle: false,
  targetPriority: 'balanced',
  autoSkills: true,
  autoDodge: true,
  bossAutoMode: 'target-only',
  devicePreset: 'balanced',
  autoSkillHpRule: 'below-85',
  bossDodgePolicy: 'critical-only',
  manualResumeDelay: 'brief',
};

export class CombatAssistController {
  private settings: CombatAssistSettings;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    this.settings = readSettings(storage);
    this.persist();
  }

  public get current(): CombatAssistSettings {
    return this.settings;
  }

  public toggleAutoTarget(): boolean {
    const autoTarget = !this.settings.autoTarget;
    this.settings = {
      ...this.settings,
      autoTarget,
      autoBattle: autoTarget ? this.settings.autoBattle : false,
    };
    this.persist();
    return this.settings.autoTarget;
  }

  public toggleAutoBattle(): boolean {
    const enabled = !this.settings.autoBattle;
    this.settings = {
      ...this.settings,
      autoTarget: enabled ? true : this.settings.autoTarget,
      autoBattle: enabled,
    };
    this.persist();
    return this.settings.autoBattle;
  }

  public toggleAutoSkills(): boolean {
    this.settings = { ...this.settings, autoSkills: !this.settings.autoSkills };
    this.persist();
    return this.settings.autoSkills;
  }

  public toggleAutoDodge(): boolean {
    this.settings = { ...this.settings, autoDodge: !this.settings.autoDodge };
    this.persist();
    return this.settings.autoDodge;
  }

  public cycleTargetPriority(): AutoTargetPriority {
    this.settings = {
      ...this.settings,
      targetPriority: nextValue(TARGET_PRIORITY_ORDER, this.settings.targetPriority),
    };
    this.persist();
    return this.settings.targetPriority;
  }

  public cycleBossAutoMode(): BossAutoMode {
    this.settings = {
      ...this.settings,
      bossAutoMode: nextValue(BOSS_MODE_ORDER, this.settings.bossAutoMode),
    };
    this.persist();
    return this.settings.bossAutoMode;
  }

  public cycleDevicePreset(): CombatDevicePreset {
    this.settings = {
      ...this.settings,
      devicePreset: nextValue(DEVICE_PRESET_ORDER, this.settings.devicePreset),
    };
    this.persist();
    return this.settings.devicePreset;
  }


  public cycleAutoSkillHpRule(): AutoSkillHpRule {
    this.settings = {
      ...this.settings,
      autoSkillHpRule: nextValue(AUTO_SKILL_HP_ORDER, this.settings.autoSkillHpRule),
    };
    this.persist();
    return this.settings.autoSkillHpRule;
  }

  public cycleBossDodgePolicy(): BossDodgePolicy {
    this.settings = {
      ...this.settings,
      bossDodgePolicy: nextValue(BOSS_DODGE_ORDER, this.settings.bossDodgePolicy),
    };
    this.persist();
    return this.settings.bossDodgePolicy;
  }

  public cycleManualResumeDelay(): ManualResumeDelay {
    this.settings = {
      ...this.settings,
      manualResumeDelay: nextValue(MANUAL_RESUME_ORDER, this.settings.manualResumeDelay),
    };
    this.persist();
    return this.settings.manualResumeDelay;
  }

  public set(next: Partial<CombatAssistSettings>): CombatAssistSettings {
    const autoBattle = next.autoBattle ?? this.settings.autoBattle;
    const autoTarget = autoBattle ? true : (next.autoTarget ?? this.settings.autoTarget);
    this.settings = sanitizeSettings({ ...this.settings, ...next, autoTarget, autoBattle });
    this.persist();
    return this.settings;
  }

  private persist(): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    this.applyDocumentState();
  }

  private applyDocumentState(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.autoTarget = this.settings.autoTarget ? 'on' : 'off';
    document.documentElement.dataset.autoBattle = this.settings.autoBattle ? 'on' : 'off';
    document.documentElement.dataset.autoTargetPriority = this.settings.targetPriority;
    document.documentElement.dataset.autoDevicePreset = this.settings.devicePreset;
    document.documentElement.dataset.autoSkillHpRule = this.settings.autoSkillHpRule;
    document.documentElement.dataset.bossDodgePolicy = this.settings.bossDodgePolicy;
    document.documentElement.dataset.manualResumeDelay = this.settings.manualResumeDelay;
  }
}

export function autoTargetPriorityLabel(value: AutoTargetPriority): string {
  if (value === 'nearest') return '가까운 적';
  if (value === 'boss') return '보스·엘리트';
  if (value === 'weak') return '낮은 HP';
  if (value === 'threat') return '공격 예고';
  return '균형';
}

export function bossAutoModeLabel(value: BossAutoMode): string {
  if (value === 'full') return '보스전 전체 자동';
  if (value === 'off') return '보스전 자동 금지';
  return '보스전 타겟만';
}

export function combatDevicePresetLabel(value: CombatDevicePreset): string {
  if (value === 'responsive') return '즉응형';
  if (value === 'stable') return '안정형';
  return '균형형';
}


export function autoSkillHpRuleLabel(value: AutoSkillHpRule): string {
  if (value === 'always') return 'HP 조건 없음';
  if (value === 'below-65') return 'HP 65% 이하';
  if (value === 'emergency') return 'HP 40% 이하';
  return 'HP 85% 이하';
}

export function bossDodgePolicyLabel(value: BossDodgePolicy): string {
  if (value === 'all') return '모든 패턴 회피';
  if (value === 'off') return '보스 자동 회피 OFF';
  return '치명 패턴만 회피';
}

export function manualResumeDelayLabel(value: ManualResumeDelay): string {
  if (value === 'instant') return '즉시 복귀';
  if (value === 'delayed') return '0.9초 후 복귀';
  return '0.45초 후 복귀';
}

export function autoSkillHpThreshold(value: AutoSkillHpRule): number {
  if (value === 'always') return 1;
  if (value === 'below-65') return 0.65;
  if (value === 'emergency') return 0.4;
  return 0.85;
}

export function manualResumeDelaySeconds(value: ManualResumeDelay): number {
  if (value === 'instant') return 0;
  if (value === 'delayed') return 0.9;
  return 0.45;
}

function readSettings(storage: Pick<Storage, 'getItem'> | undefined): CombatAssistSettings {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) return sanitizeSettings(JSON.parse(raw) as Partial<CombatAssistSettings>);
    const legacyRaw = storage?.getItem(LEGACY_V2_STORAGE_KEY) ?? storage?.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return DEFAULT_SETTINGS;
    const legacy = JSON.parse(legacyRaw) as Partial<CombatAssistSettings>;
    return sanitizeSettings({
      ...DEFAULT_SETTINGS,
      autoTarget: legacy.autoBattle ? true : legacy.autoTarget !== false,
      autoBattle: legacy.autoBattle === true,
    });
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function sanitizeSettings(value: Partial<CombatAssistSettings>): CombatAssistSettings {
  const autoBattle = value.autoBattle === true;
  return {
    autoTarget: autoBattle ? true : value.autoTarget !== false,
    autoBattle,
    targetPriority: TARGET_PRIORITY_ORDER.includes(value.targetPriority as AutoTargetPriority)
      ? value.targetPriority as AutoTargetPriority
      : DEFAULT_SETTINGS.targetPriority,
    autoSkills: value.autoSkills !== false,
    autoDodge: value.autoDodge !== false,
    bossAutoMode: BOSS_MODE_ORDER.includes(value.bossAutoMode as BossAutoMode)
      ? value.bossAutoMode as BossAutoMode
      : DEFAULT_SETTINGS.bossAutoMode,
    devicePreset: DEVICE_PRESET_ORDER.includes(value.devicePreset as CombatDevicePreset)
      ? value.devicePreset as CombatDevicePreset
      : DEFAULT_SETTINGS.devicePreset,
    autoSkillHpRule: AUTO_SKILL_HP_ORDER.includes(value.autoSkillHpRule as AutoSkillHpRule)
      ? value.autoSkillHpRule as AutoSkillHpRule
      : DEFAULT_SETTINGS.autoSkillHpRule,
    bossDodgePolicy: BOSS_DODGE_ORDER.includes(value.bossDodgePolicy as BossDodgePolicy)
      ? value.bossDodgePolicy as BossDodgePolicy
      : DEFAULT_SETTINGS.bossDodgePolicy,
    manualResumeDelay: MANUAL_RESUME_ORDER.includes(value.manualResumeDelay as ManualResumeDelay)
      ? value.manualResumeDelay as ManualResumeDelay
      : DEFAULT_SETTINGS.manualResumeDelay,
  };
}

function nextValue<T extends string>(values: readonly T[], current: T): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0]!;
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
