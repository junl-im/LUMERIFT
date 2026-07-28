import { STORAGE_KEYS } from '../../app/brand';

export type VisionMode = 'standard' | 'colorAssist' | 'highContrast';

export interface AccessibilitySettings {
  readonly visionMode: VisionMode;
  readonly largeHud: boolean;
  readonly reduceFlash: boolean;
}

export interface CombatAccessibilityPalette {
  readonly playerHp: number;
  readonly criticalHp: number;
  readonly bossHp: number;
  readonly cooldown: number;
  readonly outline: number;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  visionMode: 'standard',
  largeHud: false,
  reduceFlash: prefersReducedMotion(),
};

const PALETTES: Readonly<Record<VisionMode, CombatAccessibilityPalette>> = {
  standard: {
    playerHp: 0x7a5ac7,
    criticalHp: 0xc64453,
    bossHp: 0xc64453,
    cooldown: 0xcdaa5c,
    outline: 0xffffff,
  },
  colorAssist: {
    playerHp: 0x32c7d9,
    criticalHp: 0xf2b84b,
    bossHp: 0xc77dff,
    cooldown: 0xffffff,
    outline: 0x061018,
  },
  highContrast: {
    playerHp: 0x00e5ff,
    criticalHp: 0xffd000,
    bossHp: 0xff4fa3,
    cooldown: 0xffffff,
    outline: 0x000000,
  },
};

const VISION_ORDER: readonly VisionMode[] = ['standard', 'colorAssist', 'highContrast'];

export class AccessibilityController {
  private settings: AccessibilitySettings;

  public constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage(),
  ) {
    this.settings = readSettings(storage?.getItem(STORAGE_KEYS.accessibility));
    this.applyToDocument();
  }

  public get current(): AccessibilitySettings {
    return { ...this.settings };
  }

  public get palette(): CombatAccessibilityPalette {
    return PALETTES[this.settings.visionMode];
  }

  public cycleVisionMode(): AccessibilitySettings {
    const index = VISION_ORDER.indexOf(this.settings.visionMode);
    return this.update({ visionMode: VISION_ORDER[(index + 1) % VISION_ORDER.length] ?? 'standard' });
  }

  public toggleLargeHud(): AccessibilitySettings {
    return this.update({ largeHud: !this.settings.largeHud });
  }

  public toggleReduceFlash(): AccessibilitySettings {
    return this.update({ reduceFlash: !this.settings.reduceFlash });
  }

  public update(patch: Partial<AccessibilitySettings>): AccessibilitySettings {
    this.settings = {
      visionMode: isVisionMode(patch.visionMode) ? patch.visionMode : this.settings.visionMode,
      largeHud: typeof patch.largeHud === 'boolean' ? patch.largeHud : this.settings.largeHud,
      reduceFlash: typeof patch.reduceFlash === 'boolean' ? patch.reduceFlash : this.settings.reduceFlash,
    };
    this.storage?.setItem(STORAGE_KEYS.accessibility, JSON.stringify(this.settings));
    this.applyToDocument();
    return this.current;
  }

  private applyToDocument(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.visionMode = this.settings.visionMode;
    root.dataset.largeHud = this.settings.largeHud ? 'true' : 'false';
    root.dataset.reduceFlash = this.settings.reduceFlash ? 'true' : 'false';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lumerift:accessibility-change', { detail: this.current }));
    }
  }
}

export function visionModeLabel(mode: VisionMode): string {
  const labels: Readonly<Record<VisionMode, string>> = {
    standard: '표준 색상',
    colorAssist: '색상 보조',
    highContrast: '고대비',
  };
  return labels[mode];
}

function readSettings(raw: string | null | undefined): AccessibilitySettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const value = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return {
      visionMode: isVisionMode(value.visionMode) ? value.visionMode : DEFAULT_SETTINGS.visionMode,
      largeHud: typeof value.largeHud === 'boolean' ? value.largeHud : DEFAULT_SETTINGS.largeHud,
      reduceFlash: typeof value.reduceFlash === 'boolean' ? value.reduceFlash : DEFAULT_SETTINGS.reduceFlash,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function isVisionMode(value: unknown): value is VisionMode {
  return value === 'standard' || value === 'colorAssist' || value === 'highContrast';
}

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  } catch {
    return false;
  }
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
