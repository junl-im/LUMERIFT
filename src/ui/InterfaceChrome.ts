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

  const wash = new Graphics()
    .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    .fill({ color: COLORS.dark, alpha: dense ? 0.22 : 0.12 })
    .circle(DESIGN_WIDTH - 34, 116, 176)
    .fill({ color: accent, alpha: dense ? 0.08 : 0.05 })
    .circle(42, DESIGN_HEIGHT - 120, 210)
    .fill({ color: secondary, alpha: dense ? 0.055 : 0.035 });

  const cuts = new Graphics()
    .moveTo(-20, 182)
    .lineTo(206, -12)
    .stroke({ color: accent, alpha: 0.13, width: 3 })
    .moveTo(364, DESIGN_HEIGHT + 24)
    .lineTo(DESIGN_WIDTH + 20, 770)
    .stroke({ color: secondary, alpha: 0.12, width: 3 })
    .moveTo(12, 118)
    .lineTo(192, 118)
    .stroke({ color: 0xffffff, alpha: 0.07, width: 1 })
    .moveTo(DESIGN_WIDTH - 178, DESIGN_HEIGHT - 92)
    .lineTo(DESIGN_WIDTH - 18, DESIGN_HEIGHT - 92)
    .stroke({ color: 0xffffff, alpha: 0.06, width: 1 });

  const dots = new Graphics();
  const spacing = dense ? 34 : 48;
  for (let y = 152; y < DESIGN_HEIGHT - 130; y += spacing) {
    for (let x = 26; x < DESIGN_WIDTH - 24; x += spacing) {
      if (((x + y) / spacing) % 3 > 1.1) continue;
      dots.circle(x, y, dense ? 1.5 : 1).fill({ color: accent, alpha: dense ? 0.08 : 0.05 });
    }
  }

  const rail = new Graphics()
    .roundRect(16, DESIGN_HEIGHT - 44, DESIGN_WIDTH - 32, 20, 10)
    .fill({ color: COLORS.panelStrong, alpha: 0.58 })
    .stroke({ color: accent, alpha: 0.18, width: 1 });
  const label = new Text({
    text: options.label ?? `${BRAND.title} · UI RENEWAL`,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.6 }),
  });
  label.anchor.set(0.5);
  label.position.set(DESIGN_WIDTH / 2, DESIGN_HEIGHT - 34);

  root.addChild(wash, dots, cuts, rail, label);
  return root;
}

export function createInterfaceStamp(text: string, width = 126): Container {
  const root = new Container();
  const plate = new Graphics()
    .roundRect(0, 0, width, 26, 13)
    .fill({ color: COLORS.panelStrong, alpha: 0.94 })
    .stroke({ color: COLORS.warning, alpha: 0.5, width: 1.3 })
    .roundRect(4, 4, width - 8, 7, 4)
    .fill({ color: 0xffffff, alpha: 0.05 });
  const label = new Text({
    text,
    style: new TextStyle({ fill: 0xffefbe, fontSize: 9, fontWeight: '800', letterSpacing: 1.15 }),
  });
  label.anchor.set(0.5);
  label.position.set(width / 2, 13);
  root.addChild(plate, label);
  return root;
}
