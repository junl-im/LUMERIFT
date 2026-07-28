export type DeviceCalibrationTier = 'entry' | 'balanced' | 'performance';

export interface DeviceCalibrationProbe {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly devicePixelRatio?: number;
  readonly touchPoints?: number;
  readonly platform?: string;
}

export interface DeviceCalibrationThresholds {
  readonly severeFps: number;
  readonly severeOnePercentLow: number;
  readonly severeLongFrameRatio: number;
  readonly constrainedFps: number;
  readonly constrainedOnePercentLow: number;
  readonly constrainedLongFrameRatio: number;
  readonly healthyFps: number;
  readonly healthyOnePercentLow: number;
  readonly healthyLongFrameRatio: number;
  readonly degradeToBalancedWindows: number;
  readonly degradeToSafeWindows: number;
  readonly recoverToBalancedWindows: number;
  readonly recoverToFullWindows: number;
  readonly combatRenderBias: number;
}

export interface DeviceCalibrationProfile {
  readonly tier: DeviceCalibrationTier;
  readonly label: string;
  readonly reason: string;
  readonly thresholds: DeviceCalibrationThresholds;
}

const PROFILES: Readonly<Record<DeviceCalibrationTier, DeviceCalibrationThresholds>> = {
  entry: {
    severeFps: 34,
    severeOnePercentLow: 24,
    severeLongFrameRatio: 0.16,
    constrainedFps: 45,
    constrainedOnePercentLow: 34,
    constrainedLongFrameRatio: 0.075,
    healthyFps: 53,
    healthyOnePercentLow: 45,
    healthyLongFrameRatio: 0.03,
    degradeToBalancedWindows: 2,
    degradeToSafeWindows: 4,
    recoverToBalancedWindows: 24,
    recoverToFullWindows: 38,
    combatRenderBias: 0.82,
  },
  balanced: {
    severeFps: 38,
    severeOnePercentLow: 28,
    severeLongFrameRatio: 0.18,
    constrainedFps: 50,
    constrainedOnePercentLow: 42,
    constrainedLongFrameRatio: 0.08,
    healthyFps: 56,
    healthyOnePercentLow: 50,
    healthyLongFrameRatio: 0.035,
    degradeToBalancedWindows: 3,
    degradeToSafeWindows: 6,
    recoverToBalancedWindows: 20,
    recoverToFullWindows: 30,
    combatRenderBias: 1,
  },
  performance: {
    severeFps: 42,
    severeOnePercentLow: 32,
    severeLongFrameRatio: 0.2,
    constrainedFps: 52,
    constrainedOnePercentLow: 44,
    constrainedLongFrameRatio: 0.095,
    healthyFps: 57,
    healthyOnePercentLow: 52,
    healthyLongFrameRatio: 0.04,
    degradeToBalancedWindows: 4,
    degradeToSafeWindows: 8,
    recoverToBalancedWindows: 18,
    recoverToFullWindows: 26,
    combatRenderBias: 1.08,
  },
};

export function resolveDeviceCalibration(probe: DeviceCalibrationProbe = browserProbe()): DeviceCalibrationProfile {
  const memory = probe.deviceMemory ?? 6;
  const cores = probe.hardwareConcurrency ?? 6;
  const dpr = probe.devicePixelRatio ?? 1;
  const touch = probe.touchPoints ?? 0;
  const normalizedPlatform = (probe.platform ?? '').toLowerCase();

  let score = 0;
  if (memory <= 3) score -= 3;
  else if (memory <= 4) score -= 1;
  else if (memory >= 8) score += 2;

  if (cores <= 3) score -= 3;
  else if (cores <= 4) score -= 1;
  else if (cores >= 8) score += 2;

  if (dpr >= 3) score -= 1;
  if (touch > 0 && dpr >= 2.5) score -= 0.5;
  if (normalizedPlatform.includes('iphone') || normalizedPlatform.includes('ipad')) score += 0.25;

  const tier: DeviceCalibrationTier = score <= -2 ? 'entry' : score >= 2.5 ? 'performance' : 'balanced';
  const labels: Readonly<Record<DeviceCalibrationTier, string>> = {
    entry: '저사양 안정형',
    balanced: '표준 균형형',
    performance: '고성능 확장형',
  };
  return {
    tier,
    label: labels[tier],
    reason: `메모리 ${memory}GB · ${cores}코어 · DPR ${dpr.toFixed(2)} · 터치 ${touch}`,
    thresholds: PROFILES[tier],
  };
}

export function calibrationTierLabel(tier: DeviceCalibrationTier): string {
  return tier === 'entry' ? '저사양 안정형' : tier === 'performance' ? '고성능 확장형' : '표준 균형형';
}

function browserProbe(): DeviceCalibrationProbe {
  if (typeof navigator === 'undefined') return {};
  const extended = navigator as Navigator & { readonly deviceMemory?: number };
  return {
    deviceMemory: extended.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
    touchPoints: navigator.maxTouchPoints,
    platform: document.documentElement.dataset.platform || navigator.platform,
  };
}
