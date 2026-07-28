import { Rectangle, type Container } from 'pixi.js';
import { ASSET_PATHS } from '../core/assets/AssetCatalog';

export interface PressFeedbackOptions {
  readonly width: number;
  readonly height: number;
  readonly minTouchSize?: number;
  readonly pressScale?: number;
  readonly hoverAlpha?: number;
  readonly playSound?: boolean;
  readonly isEnabled?: () => boolean;
  readonly onPress: () => void | Promise<void>;
}

export function bindPressFeedback(target: Container, options: PressFeedbackOptions): void {
  const minimum = options.minTouchSize ?? 48;
  const hitWidth = Math.max(minimum, options.width);
  const hitHeight = Math.max(minimum, options.height);
  const hitX = (options.width - hitWidth) / 2;
  const hitY = (options.height - hitHeight) / 2;
  const enabled = (): boolean => options.isEnabled?.() ?? true;
  const reducedMotion = (): boolean => typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  target.eventMode = 'static';
  target.cursor = 'pointer';
  target.hitArea = new Rectangle(hitX, hitY, hitWidth, hitHeight);

  const reset = (): void => {
    target.scale.set(1);
    target.alpha = enabled() ? 1 : 0.42;
  };

  target.on('pointerover', () => {
    if (enabled()) target.alpha = options.hoverAlpha ?? 0.94;
  });
  target.on('pointerout', reset);
  target.on('pointercancel', reset);
  target.on('pointerupoutside', reset);
  target.on('pointerdown', () => {
    if (!enabled()) return;
    target.alpha = 1;
    target.scale.set(reducedMotion() ? 1 : (options.pressScale ?? 0.982));
  });
  target.on('pointerup', reset);
  target.on('pointertap', () => {
    if (!enabled()) return;
    if (options.playSound !== false && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lumerift:ui-press', { detail: ASSET_PATHS.uiClick }));
    }
    void options.onPress();
  });
}
