import { BRAND } from '../../app/brand';
import type { AccessibilitySettings } from '../accessibility/AccessibilityController';
import type { MobileViewportMetrics } from '../layout/MobileViewportController';
import type { AdaptivePerformanceSnapshot } from './AdaptivePerformanceController';
import type { DeviceQaSessionArchive } from './DeviceQaSessionRecorder';
import { analyzeDeviceQaSession, type DeviceQaSessionAnalysis } from './DeviceQaSessionAnalyzer';

export interface DeviceQaReportInput {
  readonly adaptive: AdaptivePerformanceSnapshot;
  readonly viewport: MobileViewportMetrics;
  readonly accessibility: AccessibilitySettings;
  readonly graphicsPreference: string;
  readonly graphicsEffective: string;
  readonly fpsMode: string;
  readonly targetFps: number;
  readonly session?: DeviceQaSessionArchive;
}

export interface DeviceQaReport {
  readonly schema: 'lumerift-device-qa-v3';
  readonly appVersion: string;
  readonly generatedAt: string;
  readonly disclaimer: string;
  readonly device: {
    readonly userAgent: string;
    readonly platform: string;
    readonly language: string;
    readonly devicePixelRatio: number;
    readonly deviceMemory?: number;
    readonly hardwareConcurrency: number;
    readonly touchPoints: number;
    readonly online: boolean;
  };
  readonly viewport: MobileViewportMetrics;
  readonly rendering: {
    readonly canvasResolution: number;
    readonly adaptiveLevel: string;
    readonly estimatedPressure: string;
    readonly adaptiveReason: string;
    readonly graphicsPreference: string;
    readonly graphicsEffective: string;
    readonly fpsMode: string;
    readonly targetFps: number;
    readonly calibrationTier: string;
    readonly calibrationLabel: string;
    readonly calibrationReason: string;
    readonly combatRenderBias: number;
  };
  readonly performance: AdaptivePerformanceSnapshot['performance'];
  readonly accessibility: AccessibilitySettings;
  readonly session?: DeviceQaSessionArchive;
  readonly analysis?: DeviceQaSessionAnalysis;
}

export function buildDeviceQaReport(input: DeviceQaReportInput): DeviceQaReport {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const extended = nav as (Navigator & { readonly deviceMemory?: number }) | undefined;
  return {
    schema: 'lumerift-device-qa-v3',
    appVersion: BRAND.version,
    generatedAt: new Date().toISOString(),
    disclaimer: 'estimatedPressure는 브라우저 프레임 추세 기반 추정값입니다. 배터리는 지원 브라우저에서만 기록되며 표면 온도와 GPU 메모리는 물리 측정이 필요합니다.',
    device: {
      userAgent: nav?.userAgent ?? 'unknown',
      platform: document.documentElement.dataset.platform ?? 'unknown',
      language: nav?.language ?? 'unknown',
      devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
      deviceMemory: extended?.deviceMemory,
      hardwareConcurrency: nav?.hardwareConcurrency ?? 0,
      touchPoints: nav?.maxTouchPoints ?? 0,
      online: nav?.onLine ?? false,
    },
    viewport: input.viewport,
    rendering: {
      canvasResolution: input.adaptive.resolution,
      adaptiveLevel: input.adaptive.level,
      estimatedPressure: input.adaptive.estimatedPressure,
      adaptiveReason: input.adaptive.reason,
      graphicsPreference: input.graphicsPreference,
      graphicsEffective: input.graphicsEffective,
      fpsMode: input.fpsMode,
      targetFps: input.targetFps,
      calibrationTier: input.adaptive.calibration.tier,
      calibrationLabel: input.adaptive.calibration.label,
      calibrationReason: input.adaptive.calibration.reason,
      combatRenderBias: input.adaptive.calibration.thresholds.combatRenderBias,
    },
    performance: input.adaptive.performance,
    accessibility: input.accessibility,
    ...(input.session ? { session: input.session, analysis: analyzeDeviceQaSession(input.session) } : {}),
  };
}
