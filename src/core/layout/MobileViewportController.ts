export interface MobileViewportMetrics {
  readonly width: number;
  readonly height: number;
  readonly keyboardOffset: number;
  readonly offsetTop: number;
  readonly offsetLeft: number;
  readonly scale: number;
}

type MobilePlatform = 'ios' | 'android' | 'desktop';

export class MobileViewportController {
  private active = false;
  private animationFrame = 0;
  private readonly handleChange = (): void => this.scheduleApply();

  public start(): void {
    if (this.active || typeof window === 'undefined') return;
    this.active = true;
    window.addEventListener('resize', this.handleChange, { passive: true });
    window.addEventListener('orientationchange', this.handleChange, { passive: true });
    window.addEventListener('pageshow', this.handleChange, { passive: true });
    window.addEventListener('focus', this.handleChange, { passive: true });
    document.addEventListener('visibilitychange', this.handleChange, { passive: true });
    window.visualViewport?.addEventListener('resize', this.handleChange, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.handleChange, { passive: true });
    this.apply();
  }

  public destroy(): void {
    if (!this.active || typeof window === 'undefined') return;
    this.active = false;
    window.removeEventListener('resize', this.handleChange);
    window.removeEventListener('orientationchange', this.handleChange);
    window.removeEventListener('pageshow', this.handleChange);
    window.removeEventListener('focus', this.handleChange);
    document.removeEventListener('visibilitychange', this.handleChange);
    window.visualViewport?.removeEventListener('resize', this.handleChange);
    window.visualViewport?.removeEventListener('scroll', this.handleChange);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
  }

  public metrics(): MobileViewportMetrics {
    if (typeof window === 'undefined') {
      return { width: 540, height: 960, keyboardOffset: 0, offsetTop: 0, offsetLeft: 0, scale: 1 };
    }

    const viewport = window.visualViewport;
    const width = Math.round(viewport?.width ?? window.innerWidth);
    const height = Math.round(viewport?.height ?? window.innerHeight);
    const offsetTop = Math.max(0, Math.round(viewport?.offsetTop ?? 0));
    const offsetLeft = Math.max(0, Math.round(viewport?.offsetLeft ?? 0));
    const scale = Number((viewport?.scale ?? 1).toFixed(3));
    const keyboardOffset = Math.max(0, Math.round(window.innerHeight - height - offsetTop));
    return { width, height, keyboardOffset, offsetTop, offsetLeft, scale };
  }

  private scheduleApply(): void {
    if (!this.active || typeof window === 'undefined') return;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = 0;
      this.apply();
    });
  }

  private apply(): void {
    if (typeof document === 'undefined') return;
    const metrics = this.metrics();
    const root = document.documentElement;
    root.style.setProperty('--lumerift-viewport-width', `${metrics.width}px`);
    root.style.setProperty('--lumerift-viewport-height', `${metrics.height}px`);
    root.style.setProperty('--lumerift-viewport-offset-top', `${metrics.offsetTop}px`);
    root.style.setProperty('--lumerift-viewport-offset-left', `${metrics.offsetLeft}px`);
    root.style.setProperty('--lumerift-viewport-scale', metrics.scale.toString());
    root.style.setProperty('--lumerift-keyboard-offset', `${metrics.keyboardOffset}px`);
    root.dataset.keyboardOpen = metrics.keyboardOffset > 80 ? 'true' : 'false';
    root.dataset.platform = this.detectPlatform();
    root.dataset.pointer = window.matchMedia?.('(pointer: coarse)').matches ? 'coarse' : 'fine';
    root.dataset.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'true' : 'false';
  }

  private detectPlatform(): MobilePlatform {
    if (typeof navigator === 'undefined') return 'desktop';
    const userAgent = navigator.userAgent.toLowerCase();
    const touchMac = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    if (/iphone|ipad|ipod/.test(userAgent) || touchMac) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'desktop';
  }
}
