export interface MobileViewportMetrics {
  readonly width: number;
  readonly height: number;
  readonly keyboardOffset: number;
}

export class MobileViewportController {
  private readonly handleChange = (): void => this.apply();
  private active = false;

  public start(): void {
    if (this.active || typeof window === 'undefined') return;
    this.active = true;
    window.addEventListener('resize', this.handleChange, { passive: true });
    window.addEventListener('orientationchange', this.handleChange, { passive: true });
    window.visualViewport?.addEventListener('resize', this.handleChange, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.handleChange, { passive: true });
    this.apply();
  }

  public destroy(): void {
    if (!this.active || typeof window === 'undefined') return;
    this.active = false;
    window.removeEventListener('resize', this.handleChange);
    window.removeEventListener('orientationchange', this.handleChange);
    window.visualViewport?.removeEventListener('resize', this.handleChange);
    window.visualViewport?.removeEventListener('scroll', this.handleChange);
  }

  public metrics(): MobileViewportMetrics {
    const viewport = typeof window === 'undefined' ? undefined : window.visualViewport;
    const width = Math.round(viewport?.width ?? window.innerWidth);
    const height = Math.round(viewport?.height ?? window.innerHeight);
    const keyboardOffset = Math.max(0, Math.round(window.innerHeight - height - (viewport?.offsetTop ?? 0)));
    return { width, height, keyboardOffset };
  }

  private apply(): void {
    if (typeof document === 'undefined') return;
    const metrics = this.metrics();
    const root = document.documentElement;
    root.style.setProperty('--lumerift-viewport-width', `${metrics.width}px`);
    root.style.setProperty('--lumerift-viewport-height', `${metrics.height}px`);
    root.style.setProperty('--lumerift-keyboard-offset', `${metrics.keyboardOffset}px`);
    root.dataset.keyboardOpen = metrics.keyboardOffset > 120 ? 'true' : 'false';
  }
}
