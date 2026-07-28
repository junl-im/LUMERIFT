import type { Ticker } from 'pixi.js';
import { STORAGE_KEYS } from '../../app/brand';
import type { PerformanceMonitor } from './PerformanceMonitor';

export type FpsMode = 'auto' | '60' | '30';

export class FrameRateController {
  private mode: FpsMode = this.readInitialMode();
  private slowFrames = 0;
  private framesAtThirty = 0;
  private adaptiveCap: 30 | 60 = 60;

  public constructor(
    private readonly ticker: Ticker,
    private readonly performance: PerformanceMonitor,
  ) {
    this.apply();
  }

  public get currentMode(): FpsMode {
    return this.mode;
  }

  public get targetFps(): number {
    if (this.mode === '30') return 30;
    if (this.mode === '60') return 60;
    return Math.min(this.adaptiveCap, this.ticker.maxFPS <= 30 ? 30 : 60);
  }

  public setAdaptiveCap(cap: 30 | 60): void {
    this.adaptiveCap = cap;
    if (this.mode === 'auto') this.apply();
  }

  public setMode(mode: FpsMode): void {
    this.mode = mode;
    localStorage.setItem(STORAGE_KEYS.fpsMode, mode);
    this.slowFrames = 0;
    this.framesAtThirty = 0;
    this.apply();
  }

  public cycleMode(): void {
    const next: Record<FpsMode, FpsMode> = { auto: '60', '60': '30', '30': 'auto' };
    this.setMode(next[this.mode]);
  }

  public update(): void {
    if (this.mode !== 'auto') return;

    if (this.adaptiveCap <= 30) {
      this.ticker.maxFPS = 30;
      this.framesAtThirty = 0;
      this.slowFrames = 0;
      return;
    }

    if (this.ticker.maxFPS <= 30) {
      this.framesAtThirty += 1;
      if (this.framesAtThirty > 1800) {
        this.ticker.maxFPS = 60;
        this.framesAtThirty = 0;
        this.slowFrames = 0;
      }
      return;
    }

    if (this.performance.fps < 42) {
      this.slowFrames += 1;
    } else if (this.performance.fps > 56) {
      this.slowFrames = 0;
    }

    if (this.slowFrames > 180) {
      this.ticker.maxFPS = 30;
      this.slowFrames = 0;
      this.framesAtThirty = 0;
    }
  }

  private apply(): void {
    this.ticker.minFPS = 20;
    this.ticker.maxFPS = this.mode === '30' ? 30 : this.mode === '60' ? 60 : this.adaptiveCap;
  }

  private readInitialMode(): FpsMode {
    const stored = localStorage.getItem(STORAGE_KEYS.fpsMode) ?? localStorage.getItem('rpg.fpsMode');
    if (stored === 'auto' || stored === '60' || stored === '30') {
      return stored;
    }

    const configured = import.meta.env.VITE_DEFAULT_FPS_MODE;
    return configured === '60' || configured === '30' ? configured : 'auto';
  }
}
