import type { GraphicsQualityController, GraphicsQualityMode } from '../graphics/GraphicsQualityController';
import type { FrameRateController } from './FrameRateController';
import type { PerformanceMonitor, PerformanceSnapshot } from './PerformanceMonitor';

export type AdaptivePerformanceLevel = 'full' | 'balanced' | 'safe';
export type EstimatedPerformancePressure = 'stable' | 'elevated' | 'sustained';

export interface AdaptivePerformanceSnapshot {
  readonly level: AdaptivePerformanceLevel;
  readonly estimatedPressure: EstimatedPerformancePressure;
  readonly reason: string;
  readonly resolution: number;
  readonly changedAt: number;
  readonly performance: PerformanceSnapshot;
}

interface AdaptivePreset {
  readonly graphicsLimit: GraphicsQualityMode | null;
  readonly fpsCap: 30 | 60;
  readonly resolutionScale: number;
}

const PRESETS: Readonly<Record<AdaptivePerformanceLevel, AdaptivePreset>> = {
  full: { graphicsLimit: null, fpsCap: 60, resolutionScale: 1 },
  balanced: { graphicsLimit: 'balanced', fpsCap: 60, resolutionScale: 0.86 },
  safe: { graphicsLimit: 'low', fpsCap: 30, resolutionScale: 0.72 },
};

export class AdaptivePerformanceController {
  private level: AdaptivePerformanceLevel;
  private estimatedPressure: EstimatedPerformancePressure = 'stable';
  private reason = '초기 기기 프로필';
  private changedAt = Date.now();
  private elapsed = 0;
  private lowWindows = 0;
  private healthyWindows = 0;
  private resolution: number;

  public constructor(
    private readonly monitor: PerformanceMonitor,
    private readonly frameRate: FrameRateController,
    private readonly graphicsQuality: GraphicsQualityController,
    private readonly baseResolution: number,
    private readonly applyResolution: (resolution: number) => void,
    initialLevel: AdaptivePerformanceLevel = inferInitialLevel(),
  ) {
    this.level = initialLevel;
    this.resolution = baseResolution;
    this.applyLevel(initialLevel, '초기 기기 프로필');
  }

  public update(deltaSeconds: number): void {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
    this.elapsed += deltaSeconds;
    if (this.elapsed < 3) return;
    this.elapsed = 0;

    const snapshot = this.monitor.snapshot();
    if (snapshot.sampleCount < 90) return;

    const severe = snapshot.fps < 38 || snapshot.onePercentLow < 28 || snapshot.longFrameRatio > 0.18;
    const constrained = snapshot.fps < 50 || snapshot.onePercentLow < 42 || snapshot.longFrameRatio > 0.08;
    const healthy = snapshot.fps >= 56 && snapshot.onePercentLow >= 50 && snapshot.longFrameRatio < 0.035;

    if (severe) {
      this.lowWindows += 2;
      this.healthyWindows = 0;
    } else if (constrained) {
      this.lowWindows += 1;
      this.healthyWindows = 0;
    } else if (healthy) {
      this.healthyWindows += 1;
      this.lowWindows = Math.max(0, this.lowWindows - 1);
    } else {
      this.lowWindows = Math.max(0, this.lowWindows - 1);
      this.healthyWindows = Math.max(0, this.healthyWindows - 1);
    }

    this.estimatedPressure = this.lowWindows >= 5
      ? 'sustained'
      : this.lowWindows >= 2
        ? 'elevated'
        : 'stable';

    if (this.lowWindows >= 6 && this.level !== 'safe') {
      this.applyLevel('safe', '긴 프레임과 1% Low 저하가 연속 감지됨');
      this.lowWindows = 0;
      return;
    }
    if (this.lowWindows >= 3 && this.level === 'full') {
      this.applyLevel('balanced', '프레임 안정화를 위해 균형 단계 적용');
      this.lowWindows = 0;
      return;
    }
    if (this.healthyWindows >= 20 && this.level === 'safe') {
      this.applyLevel('balanced', '60초 이상 안정 상태가 유지됨');
      this.healthyWindows = 0;
      return;
    }
    if (this.healthyWindows >= 30 && this.level === 'balanced') {
      this.applyLevel('full', '90초 이상 안정 상태가 유지됨');
      this.healthyWindows = 0;
    }
  }

  public snapshot(): AdaptivePerformanceSnapshot {
    return {
      level: this.level,
      estimatedPressure: this.estimatedPressure,
      reason: this.reason,
      resolution: this.resolution,
      changedAt: this.changedAt,
      performance: this.monitor.snapshot(),
    };
  }

  private applyLevel(level: AdaptivePerformanceLevel, reason: string): void {
    this.level = level;
    this.reason = reason;
    this.changedAt = Date.now();
    const preset = PRESETS[level];
    this.graphicsQuality.setAdaptiveLimit(preset.graphicsLimit);
    this.frameRate.setAdaptiveCap(preset.fpsCap);
    this.resolution = Math.max(1, Number((this.baseResolution * preset.resolutionScale).toFixed(2)));
    this.applyResolution(this.resolution);
  }
}

export function performanceLevelLabel(level: AdaptivePerformanceLevel): string {
  const labels: Readonly<Record<AdaptivePerformanceLevel, string>> = {
    full: '최대 품질',
    balanced: '균형 품질',
    safe: '안정 우선',
  };
  return labels[level];
}

export function pressureLabel(pressure: EstimatedPerformancePressure): string {
  const labels: Readonly<Record<EstimatedPerformancePressure, string>> = {
    stable: '안정',
    elevated: '부하 상승 추정',
    sustained: '지속 부하 추정',
  };
  return labels[pressure];
}

function inferInitialLevel(): AdaptivePerformanceLevel {
  if (typeof navigator === 'undefined') return 'balanced';
  const extended = navigator as Navigator & { readonly deviceMemory?: number };
  const memory = extended.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency || 8;
  if (memory <= 3 || cores <= 3) return 'safe';
  if (memory <= 4 || cores <= 4) return 'balanced';
  return 'full';
}
