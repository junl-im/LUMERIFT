import { describe, expect, it } from 'vitest';
import { PerformanceMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
  it('reports fps, one percent low, long frames, and degrading trend', () => {
    const monitor = new PerformanceMonitor();
    for (let index = 0; index < 60; index += 1) monitor.sample(16.67);
    for (let index = 0; index < 55; index += 1) monitor.sample(24);
    for (let index = 0; index < 5; index += 1) monitor.sample(60);
    const snapshot = monitor.snapshot();
    expect(snapshot.sampleCount).toBe(120);
    expect(snapshot.fps).toBeLessThan(60);
    expect(snapshot.onePercentLow).toBeLessThanOrEqual(17);
    expect(snapshot.longFrameRatio).toBeGreaterThan(0);
    expect(snapshot.trend).toBe('degrading');
  });
});
