import { Graphics, type Container } from 'pixi.js';
import { COLORS } from '../../app/constants';
import type { AppContext } from '../../app/AppContext';
import type { Scene } from './Scene';

interface SceneSize {
  readonly width: number;
  readonly height: number;
}

export class SceneManager {
  private activeScene?: Scene;
  private context?: AppContext;
  private transitionLocked = false;
  private readonly fadeOverlay: Graphics;

  public constructor(
    private readonly root: Container,
    public readonly size: SceneSize,
  ) {
    this.fadeOverlay = new Graphics()
      .rect(0, 0, size.width, size.height)
      .fill(COLORS.background);
    this.fadeOverlay.alpha = 1;
    this.fadeOverlay.eventMode = 'static';
  }

  public setContext(context: AppContext): void {
    this.context = context;
  }

  public async change(factory: () => Scene): Promise<void> {
    if (this.transitionLocked || !this.context) return;
    this.transitionLocked = true;

    try {
      this.fadeOverlay.eventMode = 'static';
      this.root.addChild(this.fadeOverlay);
      if (this.activeScene) await this.fadeTo(1, 130);

      if (this.activeScene) {
        await this.activeScene.exit();
        this.root.removeChild(this.activeScene.view);
        this.activeScene.view.destroy({ children: true });
      }

      const next = factory();
      this.activeScene = next;
      this.root.addChild(next.view);
      this.root.addChild(this.fadeOverlay);
      await next.enter(this.context);
      await this.fadeTo(0, 190);
      this.fadeOverlay.eventMode = 'none';
    } finally {
      this.transitionLocked = false;
    }
  }

  public update(deltaSeconds: number): void {
    this.activeScene?.update(deltaSeconds);
  }

  private async fadeTo(target: number, durationMs: number): Promise<void> {
    const startAlpha = this.fadeOverlay.alpha;
    if (Math.abs(startAlpha - target) < 0.001) {
      this.fadeOverlay.alpha = target;
      return;
    }

    const start = now();
    await new Promise<void>((resolve) => {
      const step = (): void => {
        const progress = Math.min(1, (now() - start) / Math.max(1, durationMs));
        const eased = progress * progress * (3 - 2 * progress);
        this.fadeOverlay.alpha = startAlpha + (target - startAlpha) * eased;
        if (progress >= 1) {
          resolve();
          return;
        }
        schedule(step);
      };
      schedule(step);
    });
  }
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function schedule(callback: () => void): void {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(callback);
  else setTimeout(callback, 16);
}
