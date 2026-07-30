import type { MobileViewportMetrics } from './MobileViewportController';

export interface BattleHudSafeAreaLayout {
  readonly compact: boolean;
  readonly profile: 'ios' | 'android' | 'desktop';
  readonly controlScale: number;
  readonly topOffset: number;
  readonly joystick: { readonly x: number; readonly y: number };
  readonly dodge: { readonly x: number; readonly y: number };
  readonly skill2: { readonly x: number; readonly y: number };
  readonly skill1: { readonly x: number; readonly y: number };
  readonly attack: { readonly x: number; readonly y: number };
}

export function resolveBattleHudSafeArea(
  metrics: MobileViewportMetrics,
  largeHud = false,
): BattleHudSafeAreaLayout {
  const profile = metrics.platform ?? 'desktop';
  const compactWidth = metrics.width <= 375;
  const shortViewport = metrics.height <= 720;
  const keyboardOpen = metrics.keyboardOffset > 80;
  const compact = compactWidth || shortViewport || keyboardOpen;
  const controlScale = clamp(
    largeHud ? (compact ? 0.92 : 1) : compactWidth ? 0.86 : shortViewport ? 0.91 : 1,
    0.82,
    1,
  );
  const viewportHeight = Math.max(1, metrics.height);
  const topOffset = clamp((metrics.offsetTop / viewportHeight) * 960, 0, 18);
  const platformLift = profile === 'ios' ? 14 : profile === 'android' ? 7 : 0;
  const bottomLift = (keyboardOpen ? 84 : shortViewport ? 34 : compactWidth ? 14 : 0) + platformLift;
  const baseY = 865 - bottomLift;
  const viewportInset = clamp((metrics.offsetLeft / Math.max(1, metrics.width)) * 540, 0, 14);
  const horizontalInset = (compactWidth ? 8 : 0) + viewportInset;
  const fingerClearance = compact ? 8 : 14;

  return {
    compact,
    profile,
    controlScale,
    topOffset,
    joystick: { x: 84 - horizontalInset, y: baseY },
    dodge: { x: 194 - horizontalInset * 0.6, y: baseY - 28 },
    skill2: { x: 284 - horizontalInset * 0.25, y: baseY + 20 },
    skill1: { x: 374 - horizontalInset * 0.1 - fingerClearance * 0.2, y: baseY - 10 },
    attack: { x: 484 - horizontalInset - fingerClearance * 0.15, y: baseY - 30 },
  };
}

export function battleHudLayoutKey(layout: BattleHudSafeAreaLayout): string {
  return [
    layout.compact ? 'compact' : 'standard',
    layout.profile,
    layout.controlScale.toFixed(2),
    layout.topOffset.toFixed(1),
    layout.joystick.x.toFixed(1),
    layout.joystick.y.toFixed(1),
  ].join(':');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
