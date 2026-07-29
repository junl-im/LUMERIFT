import { describe, expect, it } from 'vitest';
import { analyzeDeviceQaSession } from './DeviceQaSessionAnalyzer';
import type { DeviceQaSessionArchive, DeviceQaSessionSample } from './DeviceQaSessionRecorder';

function sample(index: number, fps = 60, low = 52, long = 0.02): DeviceQaSessionSample {
  return {
    capturedAt: new Date(index * 3_000).toISOString(),
    elapsedSeconds: index * 3,
    fps,
    onePercentLow: low,
    longFrameRatio: long,
    severeFrameRatio: 0,
    p99FrameMs: 24,
    adaptiveLevel: 'full',
    estimatedPressure: 'stable',
    canvasResolution: 2,
    graphicsEffective: 'high',
    targetFps: 60,
    viewport: { width: 390, height: 844, keyboardOffset: 0, offsetTop: 0, offsetLeft: 0, scale: 1 },
    visibility: 'visible',
    orientation: 'portrait-primary',
  };
}

function archive(samples: DeviceQaSessionSample[]): DeviceQaSessionArchive {
  return {
    schema: 'lumerift-device-qa-session-v1',
    state: 'stopped',
    startedAt: new Date(0).toISOString(),
    endedAt: new Date(samples.length * 3_000).toISOString(),
    durationSeconds: samples.length * 3,
    sampleIntervalSeconds: 3,
    samples,
    summary: {
      averageFps: 60,
      minimumFps: 60,
      averageOnePercentLow: 52,
      minimumOnePercentLow: 52,
      averageLongFrameRatio: 0.02,
      maximumLongFrameRatio: 0.02,
      maximumP99FrameMs: 24,
      adaptiveLevelChanges: 0,
      visibilityChanges: 0,
      orientationChanges: 0,
    },
    battery: { supported: false },
    physicalMeasurements: { surfaceTemperatureC: null, gpuMemoryMb: null, note: 'test' },
  };
}

describe('analyzeDeviceQaSession', () => {
  it('recommends 60 FPS for a sustained stable visible session', () => {
    const analysis = analyzeDeviceQaSession(archive(Array.from({ length: 130 }, (_, index) => sample(index))));
    expect(analysis?.recommendedFps).toBe(60);
    expect(analysis?.recommendedGraphics).toBe('high');
    expect(analysis?.confidence).toBe('high');
    expect(analysis?.score).toBeGreaterThanOrEqual(85);
  });

  it('uses aligned low, medium, and high confidence windows for three-second samples', () => {
    expect(analyzeDeviceQaSession(archive(Array.from({ length: 20 }, (_, index) => sample(index))))?.confidence).toBe('low');
    expect(analyzeDeviceQaSession(archive(Array.from({ length: 40 }, (_, index) => sample(index))))?.confidence).toBe('medium');
    expect(analyzeDeviceQaSession(archive(Array.from({ length: 120 }, (_, index) => sample(index))))?.confidence).toBe('high');
  });

  it('recommends a conservative profile for long-frame pressure', () => {
    const analysis = analyzeDeviceQaSession(archive(Array.from({ length: 40 }, (_, index) => sample(index, 38, 24, 0.2))));
    expect(analysis?.recommendedFps).toBe(30);
    expect(analysis?.recommendedGraphics).toBe('low');
    expect(analysis?.issues.length).toBeGreaterThan(0);
  });
});
