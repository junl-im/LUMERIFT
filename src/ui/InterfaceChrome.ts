import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';

export interface InterfaceBackdropOptions {
  readonly accent?: number;
  readonly secondary?: number;
  readonly dense?: boolean;
  readonly label?: string;
}

export function createInterfaceBackdrop(options: InterfaceBackdropOptions = {}): Container {
  const root = new Container();
  const accent = options.accent ?? COLORS.primaryBright;
  const secondary = options.secondary ?? COLORS.warning;
  const dense = options.dense ?? false;

  const base = new Graphics()
    .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    .fill({ color: COLORS.dark, alpha: dense ? 0.28 : 0.16 })
    .circle(DESIGN_WIDTH + 16, 104, 210)
    .fill({ color: accent, alpha: dense ? 0.105 : 0.072 })
    .circle(-26, DESIGN_HEIGHT - 126, 244)
    .fill({ color: secondary, alpha: dense ? 0.075 : 0.05 })
    .circle(DESIGN_WIDTH * 0.52, DESIGN_HEIGHT * 0.48, 228)
    .stroke({ color: accent, alpha: 0.028, width: 2 });

  const chapterCuts = new Graphics()
    .moveTo(-50, 250)
    .lineTo(245, -20)
    .lineTo(330, -20)
    .lineTo(35, 292)
    .closePath()
    .fill({ color: accent, alpha: dense ? 0.055 : 0.038 })
    .moveTo(332, DESIGN_HEIGHT + 30)
    .lineTo(DESIGN_WIDTH + 42, 720)
    .lineTo(DESIGN_WIDTH + 42, 790)
    .lineTo(410, DESIGN_HEIGHT + 30)
    .closePath()
    .fill({ color: secondary, alpha: dense ? 0.05 : 0.032 })
    .moveTo(-20, 174)
    .lineTo(208, -12)
    .stroke({ color: accent, alpha: 0.24, width: 4 })
    .moveTo(354, DESIGN_HEIGHT + 24)
    .lineTo(DESIGN_WIDTH + 20, 758)
    .stroke({ color: secondary, alpha: 0.2, width: 4 });

  const halftone = new Graphics();
  const spacing = dense ? 28 : 38;
  for (let y = 136; y < DESIGN_HEIGHT - 102; y += spacing) {
    for (let x = 20; x < DESIGN_WIDTH - 18; x += spacing) {
      const index = Math.round(x / spacing + y / spacing);
      if (index % 3 !== 0) continue;
      const radius = dense ? 1.7 : 1.25;
      halftone.circle(x, y, radius).fill({ color: index % 2 === 0 ? accent : secondary, alpha: dense ? 0.105 : 0.068 });
    }
  }

  const scan = new Graphics();
  for (let y = 146; y < DESIGN_HEIGHT - 116; y += dense ? 62 : 78) {
    scan.moveTo(26, y).lineTo(DESIGN_WIDTH - 26, y).stroke({ color: 0xffffff, alpha: 0.023, width: 1 });
  }

  const speedLines = new Graphics();
  for (let index = 0; index < 6; index += 1) {
    const offset = index * 66;
    speedLines
      .moveTo(26 + index * 12, 118 + offset)
      .lineTo(98 + index * 14, 92 + offset)
      .stroke({ color: accent, alpha: dense ? 0.12 : 0.08, width: 2 })
      .moveTo(DESIGN_WIDTH - 114 - index * 10, 164 + offset)
      .lineTo(DESIGN_WIDTH - 24 - index * 4, 134 + offset)
      .stroke({ color: secondary, alpha: dense ? 0.1 : 0.07, width: 2 });
  }

  const frame = new Graphics()
    .roundRect(10, 10, DESIGN_WIDTH - 20, DESIGN_HEIGHT - 20, 26)
    .stroke({ color: 0xffffff, alpha: 0.08, width: 1 })
    .roundRect(17, 17, DESIGN_WIDTH - 34, DESIGN_HEIGHT - 34, 22)
    .stroke({ color: accent, alpha: 0.1, width: 1.2 })
    .moveTo(24, 82)
    .lineTo(24, 30)
    .lineTo(82, 30)
    .stroke({ color: secondary, alpha: 0.56, width: 3 })
    .moveTo(DESIGN_WIDTH - 82, DESIGN_HEIGHT - 30)
    .lineTo(DESIGN_WIDTH - 24, DESIGN_HEIGHT - 30)
    .lineTo(DESIGN_WIDTH - 24, DESIGN_HEIGHT - 82)
    .stroke({ color: accent, alpha: 0.5, width: 3 });

  const topRail = new Graphics()
    .roundRect(16, 18, DESIGN_WIDTH - 32, 24, 12)
    .fill({ color: COLORS.panelStrong, alpha: 0.72 })
    .stroke({ color: accent, alpha: 0.22, width: 1 })
    .roundRect(26, 24, 104, 5, 3)
    .fill({ color: secondary, alpha: 0.64 })
    .roundRect(DESIGN_WIDTH - 130, 24, 104, 5, 3)
    .fill({ color: accent, alpha: 0.64 });

  const bottomRail = new Graphics()
    .roundRect(16, DESIGN_HEIGHT - 46, DESIGN_WIDTH - 32, 22, 11)
    .fill({ color: COLORS.panelStrong, alpha: 0.76 })
    .stroke({ color: secondary, alpha: 0.2, width: 1 })
    .roundRect(DESIGN_WIDTH / 2 - 42, DESIGN_HEIGHT - 42, 84, 5, 3)
    .fill({ color: accent, alpha: 0.72 });

  const topLabel = new Text({
    text: `${BRAND.title} // ${BRAND.version}`,
    style: new TextStyle({ fill: 0xdbe9e7, fontSize: 8, fontWeight: '800', letterSpacing: 1.45 }),
  });
  topLabel.position.set(145, 24);

  const bottomLabel = new Text({
    text: options.label ?? `${BRAND.title} · RIFT INTERFACE`,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.65 }),
  });
  bottomLabel.anchor.set(0.5);
  bottomLabel.position.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT - 35);

  root.addChild(base, chapterCuts, halftone, scan, speedLines, frame, topRail, bottomRail, topLabel, bottomLabel);
  return root;
}

export function createCombatOverlayChrome(): Container {
  const root = new Container();
  const accent = COLORS.primaryBright;
  const secondary = COLORS.warning;
  const combatFrame = new Graphics()
    .moveTo(12, 146)
    .lineTo(12, 210)
    .stroke({ color: secondary, alpha: 0.45, width: 3 })
    .moveTo(DESIGN_WIDTH - 12, 146)
    .lineTo(DESIGN_WIDTH - 12, 210)
    .stroke({ color: accent, alpha: 0.45, width: 3 })
    .moveTo(12, 700)
    .lineTo(12, 770)
    .stroke({ color: accent, alpha: 0.35, width: 3 })
    .moveTo(DESIGN_WIDTH - 12, 700)
    .lineTo(DESIGN_WIDTH - 12, 770)
    .stroke({ color: secondary, alpha: 0.35, width: 3 })
    .moveTo(26, 248)
    .lineTo(74, 248)
    .stroke({ color: 0xffffff, alpha: 0.12, width: 1 })
    .moveTo(DESIGN_WIDTH - 74, 248)
    .lineTo(DESIGN_WIDTH - 26, 248)
    .stroke({ color: 0xffffff, alpha: 0.12, width: 1 });
  const left = new Text({
    text: 'COMBAT FEED',
    style: new TextStyle({ fill: 0xc5d4d2, fontSize: 7, fontWeight: '800', letterSpacing: 1.5 }),
  });
  left.rotation = -Math.PI / 2;
  left.position.set(9, 520);
  const right = new Text({
    text: 'RIFT SIGNAL',
    style: new TextStyle({ fill: 0xc5d4d2, fontSize: 7, fontWeight: '800', letterSpacing: 1.5 }),
  });
  right.rotation = Math.PI / 2;
  right.position.set(DESIGN_WIDTH - 9, 446);
  root.addChild(combatFrame, left, right);
  return root;
}

export function createInterfaceStamp(text: string, width = 126): Container {
  const root = new Container();
  const plate = new Graphics()
    .roundRect(0, 0, width, 28, 14)
    .fill({ color: COLORS.panelStrong, alpha: 0.96 })
    .stroke({ color: COLORS.warning, alpha: 0.62, width: 1.5 })
    .roundRect(4, 4, width - 8, 7, 4)
    .fill({ color: 0xffffff, alpha: 0.065 })
    .moveTo(12, 23)
    .lineTo(width - 12, 23)
    .stroke({ color: COLORS.primaryBright, alpha: 0.34, width: 1 });
  const notch = new Graphics()
    .moveTo(0, 8)
    .lineTo(8, 0)
    .lineTo(18, 0)
    .lineTo(0, 18)
    .closePath()
    .fill({ color: COLORS.primaryBright, alpha: 0.34 });
  const label = new Text({
    text,
    style: new TextStyle({ fill: 0xffefbe, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }),
  });
  label.anchor.set(0.5);
  label.position.set(width / 2 + 3, 14);
  root.addChild(plate, notch, label);
  return root;
}

export function createFeatureMarquee(title: string, subtitle: string, width = 240): Container {
  const root = new Container();
  const plate = new Graphics()
    .roundRect(0, 0, width, 64, 22)
    .fill({ color: COLORS.ink, alpha: 0.88 })
    .stroke({ color: COLORS.warning, alpha: 0.54, width: 2 })
    .roundRect(8, 8, width - 16, 18, 9)
    .fill({ color: COLORS.primaryBright, alpha: 0.08 })
    .moveTo(16, 50)
    .lineTo(width - 16, 50)
    .stroke({ color: COLORS.primaryBright, alpha: 0.28, width: 1.5 });
  const burst = new Graphics()
    .moveTo(width - 40, -2)
    .lineTo(width - 20, 10)
    .lineTo(width - 6, 8)
    .lineTo(width - 22, 24)
    .closePath()
    .fill({ color: COLORS.sunrise, alpha: 0.74 });
  const titleText = new Text({
    text: title,
    style: new TextStyle({ fill: COLORS.paper, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }),
  });
  titleText.position.set(16, 12);
  const subtitleText = new Text({
    text: subtitle,
    style: new TextStyle({ fill: COLORS.mintFog, fontSize: 9, fontWeight: '700', wordWrap: true, wordWrapWidth: width - 30, lineHeight: 12 }),
  });
  subtitleText.position.set(16, 30);
  root.addChild(plate, burst, titleText, subtitleText);
  return root;
}

export function createComicTag(text: string, color: number = COLORS.primaryBright): Container {
  const root = new Container();
  const bubble = new Graphics()
    .roundRect(0, 0, 118, 24, 12)
    .fill({ color: COLORS.paper, alpha: 0.96 })
    .stroke({ color: COLORS.ink, alpha: 0.9, width: 2 })
    .moveTo(12, 23)
    .lineTo(20, 30)
    .lineTo(22, 23)
    .closePath()
    .fill({ color: COLORS.paper, alpha: 0.96 })
    .stroke({ color: COLORS.ink, alpha: 0.9, width: 2 });
  const label = new Text({
    text,
    style: new TextStyle({ fill: color, fontSize: 9, fontWeight: '900', letterSpacing: 0.85 }),
  });
  label.anchor.set(0.5);
  label.position.set(59, 12);
  root.addChild(bubble, label);
  return root;
}
