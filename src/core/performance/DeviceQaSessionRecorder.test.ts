import { describe, expect, it } from 'vitest';
import type { AdaptivePerformanceSnapshot } from './AdaptivePerformanceController';
import { DeviceQaSessionRecorder, type DeviceQaSessionSampleInput } from './DeviceQaSessionRecorder';

function input(fps: number, level: 'full' | 'balanced' | 'safe'): DeviceQaSessionSampleInput {
  return {
    adaptive: {
      level,
      estimatedPressure: level === 'safe' ? 'sustained' : 'stable',
      reason: 'test',
      resolution: level === 'safe' ? 1 : 2,
      changedAt: 0,
      performance: {
        fps,
        onePercentLow: fps - 8,
        averageFrameMs: 1000 / fps,
        p99FrameMs: 1000 / Math.max(1, fps - 8),
        longFrameRatio: level === 'safe' ? 0.2 : 0.01,
        severeFrameRatio: 0,
        maxFrameMs: 40,
        sampleCount: 120,
        tier: fps < 38 ? 'low' : fps < 52 ? 'medium' : 'high',
        trend: 'stable',
      },
      calibration: {
        tier: 'balanced',
        label: '표준 균형형',
        reason: 'test',
        thresholds: {
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
      },
    } satisfies AdaptivePerformanceSnapshot,
    viewport: { width: 390, height: 844, keyboardOffset: 0, offsetTop: 0, offsetLeft: 0, scale: 1 },
    graphicsEffective: level === 'safe' ? 'low' : 'high',
    targetFps: level === 'safe' ? 30 : 60,
  };
}

describe('DeviceQaSessionRecorder', () => {
  it('summarizes performance windows without claiming temperature data', async () => {
    const recorder = new DeviceQaSessionRecorder();
    await recorder.start(input(60, 'full'));
    recorder.update(3.1, input(42, 'safe'));
    await recorder.stop(input(48, 'balanced'));
    const archive = recorder.snapshot();
    expect(archive?.samples.length).toBeGreaterThanOrEqual(3);
    expect(archive?.summary.minimumFps).toBe(42);
    expect(archive?.summary.adaptiveLevelChanges).toBeGreaterThanOrEqual(1);
    expect(archive?.physicalMeasurements.surfaceTemperatureC).toBeNull();
  });
});
