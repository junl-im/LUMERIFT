import { Container, Graphics } from 'pixi.js';
import { COLORS } from '../app/constants';

export const PREMIUM_UI_FRAME_SCHEMA = 'lumerift-premium-ui-frame-v3' as const;
export const PREMIUM_UI_FRAME_RUNTIME_SCHEMA = 'lumerift-premium-ui-frame-v3.1' as const;

export type PremiumFrameRole = 'panel' | 'button' | 'boss' | 'compact';

export function createPremiumFrameAccents(
  x: number,
  y: number,
  width: number,
  height: number,
  role: PremiumFrameRole = 'panel',
): Container {
  const root = new Container();
  if (width < 44 || height < 24) return root;
  const compact = role === 'compact' || height < 52;
  const goldAlpha = role === 'boss' ? 0.66 : role === 'button' ? 0.42 : 0.32;
  const runeAlpha = role === 'boss' ? 0.48 : compact ? 0.14 : 0.24;
  const inset = compact ? 5 : 8;
  const corner = compact ? 7 : 13;

  const frame = new Graphics()
    .roundRect(x + 2, y + 2, width - 4, height - 4, compact ? 10 : 18)
    .stroke({ color: 0xd8b86e, alpha: goldAlpha, width: role === 'boss' ? 2.2 : 1.2 })
    .roundRect(x + inset, y + inset, width - inset * 2, height - inset * 2, compact ? 7 : 13)
    .stroke({ color: COLORS.primaryBright, alpha: compact ? 0.12 : 0.2, width: 1 });

  frame
    .moveTo(x + 4, y + corner)
    .lineTo(x + 4, y + 4)
    .lineTo(x + corner, y + 4)
    .stroke({ color: 0xf3dfb0, alpha: goldAlpha + 0.1, width: 1.6 })
    .moveTo(x + width - corner, y + 4)
    .lineTo(x + width - 4, y + 4)
    .lineTo(x + width - 4, y + corner)
    .stroke({ color: COLORS.primaryBright, alpha: 0.38, width: 1.4 })
    .moveTo(x + 4, y + height - corner)
    .lineTo(x + 4, y + height - 4)
    .lineTo(x + corner, y + height - 4)
    .stroke({ color: COLORS.primaryBright, alpha: 0.26, width: 1.4 })
    .moveTo(x + width - corner, y + height - 4)
    .lineTo(x + width - 4, y + height - 4)
    .lineTo(x + width - 4, y + height - corner)
    .stroke({ color: 0xf3dfb0, alpha: goldAlpha + 0.06, width: 1.6 });

  if (!compact && width >= 130) {
    const centerX = x + width / 2;
    frame
      .moveTo(centerX - 16, y + 5)
      .lineTo(centerX - 5, y + 5)
      .lineTo(centerX, y + 10)
      .lineTo(centerX + 5, y + 5)
      .lineTo(centerX + 16, y + 5)
      .stroke({ color: 0xf3dfb0, alpha: goldAlpha, width: 1.2 })
      .circle(centerX, y + 10, 2.3)
      .fill({ color: COLORS.primaryBright, alpha: runeAlpha });
  }

  if (!compact && width >= 150 && height >= 58) {
    const sideY = y + height * 0.52;
    const facet = Math.min(18, height * 0.18);
    frame
      .moveTo(x + 5, sideY - facet)
      .lineTo(x + 10, sideY)
      .lineTo(x + 5, sideY + facet)
      .stroke({ color: COLORS.primaryBright, alpha: 0.24, width: 1.2 })
      .moveTo(x + width - 5, sideY - facet)
      .lineTo(x + width - 10, sideY)
      .lineTo(x + width - 5, sideY + facet)
      .stroke({ color: 0xf3dfb0, alpha: 0.28, width: 1.2 })
      .circle(x + 10, sideY, 1.8)
      .fill({ color: COLORS.primaryBright, alpha: 0.28 })
      .circle(x + width - 10, sideY, 1.8)
      .fill({ color: 0xf3dfb0, alpha: 0.3 });

    const railWidth = Math.min(42, width * 0.12);
    frame
      .moveTo(x + 18, y + height - 9)
      .lineTo(x + 18 + railWidth, y + height - 9)
      .stroke({ color: COLORS.primaryBright, alpha: 0.18, width: 2 })
      .moveTo(x + width - 18 - railWidth, y + height - 9)
      .lineTo(x + width - 18, y + height - 9)
      .stroke({ color: 0xf3dfb0, alpha: 0.2, width: 2 });
  }

  if (role === 'boss') {
    const centerX = x + width / 2;
    frame
      .moveTo(centerX - 24, y + height - 6)
      .lineTo(centerX - 7, y + height - 6)
      .lineTo(centerX, y + height - 13)
      .lineTo(centerX + 7, y + height - 6)
      .lineTo(centerX + 24, y + height - 6)
      .stroke({ color: 0xf3dfb0, alpha: 0.72, width: 1.8 })
      .moveTo(centerX - 8, y + 10)
      .lineTo(centerX, y + 18)
      .lineTo(centerX + 8, y + 10)
      .lineTo(centerX, y + 2)
      .closePath()
      .stroke({ color: COLORS.primaryBright, alpha: 0.42, width: 1.2 });
  }

  root.addChild(frame);
  return root;
}
