export interface CombatAssistSettings {
  readonly autoTarget: boolean;
  readonly autoBattle: boolean;
}

const STORAGE_KEY = 'lumerift.combatAssist.v1';
const DEFAULT_SETTINGS: CombatAssistSettings = {
  autoTarget: true,
  autoBattle: false,
};

export class CombatAssistController {
  private settings: CombatAssistSettings;

  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    this.settings = readSettings(storage);
    this.applyDocumentState();
  }

  public get current(): CombatAssistSettings {
    return this.settings;
  }

  public toggleAutoTarget(): boolean {
    this.settings = { ...this.settings, autoTarget: !this.settings.autoTarget };
    if (!this.settings.autoTarget && this.settings.autoBattle) {
      this.settings = { autoTarget: false, autoBattle: false };
    }
    this.persist();
    return this.settings.autoTarget;
  }

  public toggleAutoBattle(): boolean {
    const enabled = !this.settings.autoBattle;
    this.settings = {
      autoTarget: enabled ? true : this.settings.autoTarget,
      autoBattle: enabled,
    };
    this.persist();
    return this.settings.autoBattle;
  }

  public set(next: Partial<CombatAssistSettings>): CombatAssistSettings {
    const autoBattle = next.autoBattle ?? this.settings.autoBattle;
    const autoTarget = autoBattle ? true : (next.autoTarget ?? this.settings.autoTarget);
    this.settings = { autoTarget, autoBattle };
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
  }
}

function readSettings(storage: Pick<Storage, 'getItem'> | undefined): CombatAssistSettings {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<CombatAssistSettings>;
    return {
      autoTarget: parsed.autoBattle ? true : parsed.autoTarget !== false,
      autoBattle: parsed.autoBattle === true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
