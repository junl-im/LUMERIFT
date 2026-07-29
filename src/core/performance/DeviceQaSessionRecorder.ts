import type { MobileViewportMetrics } from '../layout/MobileViewportController';
import type { AdaptivePerformanceSnapshot } from './AdaptivePerformanceController';

export interface DeviceQaSessionSampleInput {
  readonly adaptive: AdaptivePerformanceSnapshot;
  readonly viewport: MobileViewportMetrics;
  readonly graphicsEffective: string;
  readonly targetFps: number;
}

export interface DeviceQaSessionSample {
  readonly capturedAt: string;
  readonly elapsedSeconds: number;
  readonly fps: number;
  readonly onePercentLow: number;
  readonly longFrameRatio: number;
  readonly severeFrameRatio: number;
  readonly p99FrameMs: number;
  readonly adaptiveLevel: string;
  readonly estimatedPressure: string;
  readonly canvasResolution: number;
  readonly graphicsEffective: string;
  readonly targetFps: number;
  readonly viewport: MobileViewportMetrics;
  readonly visibility: DocumentVisibilityState | 'unknown';
  readonly orientation: string;
}

export interface DeviceQaBatterySummary {
  readonly supported: boolean;
  readonly charging?: boolean;
  readonly startLevel?: number;
  readonly endLevel?: number;
  readonly consumedPercent?: number;
}

export interface DeviceQaSessionArchive {
  readonly schema: 'lumerift-device-qa-session-v1';
  readonly state: 'running' | 'stopped';
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly durationSeconds: number;
  readonly sampleIntervalSeconds: number;
  readonly samples: readonly DeviceQaSessionSample[];
  readonly summary: {
    readonly averageFps: number;
    readonly minimumFps: number;
    readonly averageOnePercentLow: number;
    readonly minimumOnePercentLow: number;
    readonly averageLongFrameRatio: number;
    readonly maximumLongFrameRatio: number;
    readonly maximumP99FrameMs: number;
    readonly adaptiveLevelChanges: number;
    readonly visibilityChanges: number;
    readonly orientationChanges: number;
  };
  readonly battery: DeviceQaBatterySummary;
  readonly physicalMeasurements: {
    readonly surfaceTemperatureC: null;
    readonly gpuMemoryMb: null;
    readonly note: string;
  };
}

interface BatteryManagerLike extends EventTarget {
  readonly charging: boolean;
  readonly level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

const SAMPLE_INTERVAL_SECONDS = 3;
const MAX_SAMPLES = 1_200;

export class DeviceQaSessionRecorder {
  private running = false;
  private startedAtMs = 0;
  private endedAtMs?: number;
  private sampleElapsed = 0;
  private readonly samples: DeviceQaSessionSample[] = [];
  private batteryStart?: number;
  private batteryEnd?: number;
  private batteryCharging?: boolean;
  private batterySupported = false;
  private previousVisibility?: string;
  private previousOrientation?: string;
  private visibilityChanges = 0;
  private orientationChanges = 0;
  private adaptiveLevelChanges = 0;
  private previousAdaptiveLevel?: string;

  public get isRunning(): boolean {
    return this.running;
  }

  public get hasSession(): boolean {
    return this.startedAtMs > 0;
  }

  public async start(initial: DeviceQaSessionSampleInput): Promise<void> {
    this.reset();
    this.running = true;
    this.startedAtMs = Date.now();
    const battery = await readBattery();
    this.batterySupported = battery.supported;
    this.batteryStart = battery.level;
    this.batteryCharging = battery.charging;
    this.capture(initial);
  }

  public async stop(finalSample: DeviceQaSessionSampleInput): Promise<void> {
    if (!this.running) return;
    this.capture(finalSample);
    this.running = false;
    this.endedAtMs = Date.now();
    const battery = await readBattery();
    this.batterySupported ||= battery.supported;
    this.batteryEnd = battery.level;
    this.batteryCharging = battery.charging ?? this.batteryCharging;
  }

  public update(deltaSeconds: number, input: DeviceQaSessionSampleInput): void {
    if (!this.running || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
    this.sampleElapsed += deltaSeconds;
    if (this.sampleElapsed < SAMPLE_INTERVAL_SECONDS) return;
    this.sampleElapsed %= SAMPLE_INTERVAL_SECONDS;
    this.capture(input);
  }

  public snapshot(): DeviceQaSessionArchive | undefined {
    if (!this.hasSession) return undefined;
    const end = this.endedAtMs ?? Date.now();
    const fps = this.samples.map((sample) => sample.fps);
    const lows = this.samples.map((sample) => sample.onePercentLow);
    const longFrames = this.samples.map((sample) => sample.longFrameRatio);
    const p99Frames = this.samples.map((sample) => sample.p99FrameMs);
    const startLevel = normalizeBatteryLevel(this.batteryStart);
    const endLevel = normalizeBatteryLevel(this.batteryEnd);
    const consumedPercent = startLevel !== undefined && endLevel !== undefined
      ? round(Math.max(0, startLevel - endLevel), 2)
      : undefined;

    return {
      schema: 'lumerift-device-qa-session-v1',
      state: this.running ? 'running' : 'stopped',
      startedAt: new Date(this.startedAtMs).toISOString(),
      ...(this.endedAtMs ? { endedAt: new Date(this.endedAtMs).toISOString() } : {}),
      durationSeconds: round(Math.max(0, end - this.startedAtMs) / 1000),
      sampleIntervalSeconds: SAMPLE_INTERVAL_SECONDS,
      samples: [...this.samples],
      summary: {
        averageFps: round(average(fps)),
        minimumFps: minOrZero(fps),
        averageOnePercentLow: round(average(lows)),
        minimumOnePercentLow: minOrZero(lows),
        averageLongFrameRatio: round(average(longFrames), 4),
        maximumLongFrameRatio: round(maxOrZero(longFrames), 4),
        maximumP99FrameMs: round(maxOrZero(p99Frames)),
        adaptiveLevelChanges: this.adaptiveLevelChanges,
        visibilityChanges: this.visibilityChanges,
        orientationChanges: this.orientationChanges,
      },
      battery: {
        supported: this.batterySupported,
        ...(this.batteryCharging !== undefined ? { charging: this.batteryCharging } : {}),
        ...(startLevel !== undefined ? { startLevel } : {}),
        ...(endLevel !== undefined ? { endLevel } : {}),
        ...(consumedPercent !== undefined ? { consumedPercent } : {}),
      },
      physicalMeasurements: {
        surfaceTemperatureC: null,
        gpuMemoryMb: null,
        note: '브라우저는 표면 온도와 GPU 메모리를 신뢰성 있게 제공하지 않으므로 물리 측정값은 별도 기록해야 합니다.',
      },
    };
  }

  private capture(input: DeviceQaSessionSampleInput): void {
    const now = Date.now();
    const visibility = typeof document === 'undefined' ? 'unknown' : document.visibilityState;
    const orientation = readOrientation();
    const adaptiveLevel = input.adaptive.level;
    if (this.previousVisibility !== undefined && this.previousVisibility !== visibility) this.visibilityChanges += 1;
    if (this.previousOrientation !== undefined && this.previousOrientation !== orientation) this.orientationChanges += 1;
    if (this.previousAdaptiveLevel !== undefined && this.previousAdaptiveLevel !== adaptiveLevel) this.adaptiveLevelChanges += 1;
    this.previousVisibility = visibility;
    this.previousOrientation = orientation;
    this.previousAdaptiveLevel = adaptiveLevel;

    const performance = input.adaptive.performance;
    this.samples.push({
      capturedAt: new Date(now).toISOString(),
      elapsedSeconds: round(Math.max(0, now - this.startedAtMs) / 1000),
      fps: performance.fps,
      onePercentLow: performance.onePercentLow,
      longFrameRatio: performance.longFrameRatio,
      severeFrameRatio: performance.severeFrameRatio,
      p99FrameMs: performance.p99FrameMs,
      adaptiveLevel,
      estimatedPressure: input.adaptive.estimatedPressure,
      canvasResolution: input.adaptive.resolution,
      graphicsEffective: input.graphicsEffective,
      targetFps: input.targetFps,
      viewport: { ...input.viewport },
      visibility,
      orientation,
    });
    if (this.samples.length > MAX_SAMPLES) this.samples.splice(0, this.samples.length - MAX_SAMPLES);
  }

  private reset(): void {
    this.running = false;
    this.startedAtMs = 0;
    this.endedAtMs = undefined;
    this.sampleElapsed = 0;
    this.samples.length = 0;
    this.batteryStart = undefined;
    this.batteryEnd = undefined;
    this.batteryCharging = undefined;
    this.batterySupported = false;
    this.previousVisibility = undefined;
    this.previousOrientation = undefined;
    this.visibilityChanges = 0;
    this.orientationChanges = 0;
    this.adaptiveLevelChanges = 0;
    this.previousAdaptiveLevel = undefined;
  }
}

async function readBattery(): Promise<{ supported: boolean; level?: number; charging?: boolean }> {
  if (typeof navigator === 'undefined') return { supported: false };
  const extended = navigator as NavigatorWithBattery;
  if (typeof extended.getBattery !== 'function') return { supported: false };
  try {
    const battery = await extended.getBattery();
    return { supported: true, level: battery.level * 100, charging: battery.charging };
  } catch {
    return { supported: false };
  }
}

function readOrientation(): string {
  if (typeof screen === 'undefined') return 'unknown';
  return screen.orientation?.type ?? (typeof window !== 'undefined' && window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
}

function normalizeBatteryLevel(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : round(Math.max(0, Math.min(100, value)), 2);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function minOrZero(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

function maxOrZero(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
