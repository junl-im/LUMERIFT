import { STORAGE_KEYS } from '../../app/brand';

export type GraphicsQualityMode = 'high' | 'balanced' | 'low';

export interface GraphicsQualityPreset {
  readonly mode: GraphicsQualityMode;
  readonly label: string;
  readonly effectDensity: number;
  readonly cameraShakeScale: number;
  readonly worldDecorationCount: number;
  readonly showStatusLabels: boolean;
  readonly particleMultiplier: number;
  readonly backgroundAnimationRate: number;
}

const PRESETS: Readonly<Record<GraphicsQualityMode, GraphicsQualityPreset>> = {
  high: {
    mode: 'high',
    label: '고품질',
    effectDensity: 1,
    cameraShakeScale: 1,
    worldDecorationCount: 8,
    showStatusLabels: true,
    particleMultiplier: 1,
    backgroundAnimationRate: 1,
  },
  balanced: {
    mode: 'balanced',
    label: '균형',
    effectDensity: 0.72,
    cameraShakeScale: 0.82,
    worldDecorationCount: 5,
    showStatusLabels: true,
    particleMultiplier: 0.68,
    backgroundAnimationRate: 0.62,
  },
  low: {
    mode: 'low',
    label: '절전',
    effectDensity: 0.45,
    cameraShakeScale: 0.55,
    worldDecorationCount: 2,
    showStatusLabels: false,
    particleMultiplier: 0.36,
    backgroundAnimationRate: 0,
  },
};

const ORDER: readonly GraphicsQualityMode[] = ['high', 'balanced', 'low'];

export class GraphicsQualityController {
  private modeValue: GraphicsQualityMode;

  public constructor(storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {
    const stored = storage?.getItem(STORAGE_KEYS.graphicsQuality);
    this.modeValue = isMode(stored) ? stored : 'balanced';
    this.storage = storage;
  }

  private readonly storage?: Pick<Storage, 'getItem' | 'setItem'>;

  public get current(): GraphicsQualityPreset {
    return PRESETS[this.modeValue];
  }

  public get mode(): GraphicsQualityMode {
    return this.modeValue;
  }

  public cycle(): GraphicsQualityPreset {
    const index = ORDER.indexOf(this.modeValue);
    this.setMode(ORDER[(index + 1) % ORDER.length] ?? 'balanced');
    return this.current;
  }

  public setMode(mode: GraphicsQualityMode): void {
    this.modeValue = mode;
    this.storage?.setItem(STORAGE_KEYS.graphicsQuality, mode);
  }
}

function isMode(value: string | null | undefined): value is GraphicsQualityMode {
  return value === 'high' || value === 'balanced' || value === 'low';
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
