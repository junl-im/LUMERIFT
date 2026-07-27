export type PerformanceTier = 'low' | 'medium' | 'high';

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
}
