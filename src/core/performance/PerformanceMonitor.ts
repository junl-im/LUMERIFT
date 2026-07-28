export type PerformanceTier = 'low' | 'medium' | 'high';

export interface PerformanceSnapshot {
  readonly fps: number;
  readonly onePercentLow: number;
  readonly averageFrameMs: number;
  readonly p99FrameMs: number;
  readonly longFrameRatio: number;
  readonly severeFrameRatio: number;
  readonly maxFrameMs: number;
  readonly sampleCount: number;
  readonly tier: PerformanceTier;
  readonly trend: 'improving' | 'stable' | 'degrading';
}

export class PerformanceMonitor {
  private readonly samples = new Float32Array(120);
  private sampleCount = 0;
  private sampleIndex = 0;
  private sampleTotal = 0;
  private _fps = 60;
  private _tier: PerformanceTier = 'high';

  public get fps(): number {
    return this._fps;
  }

  public get tier(): PerformanceTier {
    return this._tier;
  }

  public sample(deltaMs: number): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;

    if (this.sampleCount < this.samples.length) {
      this.sampleCount += 1;
    } else {
      this.sampleTotal -= this.samples[this.sampleIndex] ?? 0;
    }

    this.samples[this.sampleIndex] = deltaMs;
    this.sampleTotal += deltaMs;
    this.sampleIndex = (this.sampleIndex + 1) % this.samples.length;

    if (this.sampleCount >= 30) {
      this._fps = Math.round(1000 / (this.sampleTotal / this.sampleCount));
      this._tier = this._fps < 38 ? 'low' : this._fps < 52 ? 'medium' : 'high';
    }
  }

  public snapshot(): PerformanceSnapshot {
    const values = this.values();
    if (values.length === 0) {
      return {
        fps: 60,
        onePercentLow: 60,
        averageFrameMs: 16.67,
        p99FrameMs: 16.67,
        longFrameRatio: 0,
        severeFrameRatio: 0,
        maxFrameMs: 16.67,
        sampleCount: 0,
        tier: 'high',
        trend: 'stable',
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const averageFrameMs = values.reduce((total, value) => total + value, 0) / values.length;
    const p99Index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * 0.99) - 1));
    const p99FrameMs = sorted[p99Index] ?? averageFrameMs;
    const longFrames = values.filter((value) => value > 33.34).length;
    const severeFrames = values.filter((value) => value > 50).length;
    const midpoint = Math.max(1, Math.floor(values.length / 2));
    const firstAverage = average(values.slice(0, midpoint));
    const secondAverage = average(values.slice(midpoint));
    const trendDelta = secondAverage - firstAverage;

    return {
      fps: Math.round(1000 / averageFrameMs),
      onePercentLow: Math.max(1, Math.round(1000 / Math.max(1, p99FrameMs))),
      averageFrameMs: round(averageFrameMs),
      p99FrameMs: round(p99FrameMs),
      longFrameRatio: round(longFrames / values.length, 4),
      severeFrameRatio: round(severeFrames / values.length, 4),
      maxFrameMs: round(Math.max(...values)),
      sampleCount: values.length,
      tier: this._tier,
      trend: trendDelta > 2.5 ? 'degrading' : trendDelta < -2.5 ? 'improving' : 'stable',
    };
  }

  private values(): number[] {
    if (this.sampleCount === 0) return [];
    if (this.sampleCount < this.samples.length) {
      return Array.from(this.samples.slice(0, this.sampleCount));
    }
    const result: number[] = [];
    for (let index = 0; index < this.samples.length; index += 1) {
      const position = (this.sampleIndex + index) % this.samples.length;
      result.push(this.samples[position] ?? 0);
    }
    return result;
  }
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
