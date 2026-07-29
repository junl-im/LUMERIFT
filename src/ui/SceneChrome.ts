import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import { createRasterPanel, getSceneBackgroundTexture } from './UiSkin';
import { createGlowDivider } from './UiTheme';

export function createBackground(title: string, subtitle: string): Container {
  const root = new Container();
  const texture = getSceneBackgroundTexture();
  if (texture) {
    const backdrop = new Sprite(texture);
    backdrop.width = DESIGN_WIDTH;
    backdrop.height = DESIGN_HEIGHT;
    root.addChild(backdrop);
  } else {
    root.addChild(new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background));
  }

  const shade = new Graphics()
    .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    .fill({ color: COLORS.dark, alpha: 0.62 })
    .rect(0, 0, DESIGN_WIDTH, 170)
    .fill({ color: 0x071824, alpha: 0.52 })
    .rect(0, 760, DESIGN_WIDTH, 200)
    .fill({ color: COLORS.dark, alpha: 0.44 });
  const aura = new Graphics()
    .circle(470, 90, 170)
    .fill({ color: COLORS.primaryBright, alpha: 0.06 })
    .circle(70, 760, 190)
    .fill({ color: COLORS.warning, alpha: 0.04 })
    .circle(94, 142, 110)
    .fill({ color: COLORS.accent, alpha: 0.028 });
  const top = createRasterPanel(18, 16, DESIGN_WIDTH - 36, 122, 'panel_strong');

  const brand = new Text({
    text: BRAND.title,
    style: new TextStyle({ fill: 0xeff7f4, fontSize: 12, fontWeight: '700', letterSpacing: 2.2 }),
  });
  brand.position.set(36, 30);
  const heading = new Text({
    text: title,
    style: new TextStyle({
      fill: 0xf8e7b5,
      fontSize: 29,
      fontWeight: '700',
      letterSpacing: 0.5,
      dropShadow: { color: COLORS.dark, alpha: 0.72, blur: 3, distance: 1 },
    }),
  });
  heading.position.set(36, 49);
  const description = new Text({
    text: subtitle,
    style: new TextStyle({ fill: 0xbfd0cf, fontSize: 12, lineHeight: 16, wordWrap: true, wordWrapWidth: 455 }),
  });
  description.position.set(37, 91);
  const divider = createGlowDivider(462);
  divider.position.set(39, 126);

  root.addChild(shade, aura, top, brand, heading, description, divider);
  return root;
}

export function createPanel(x: number, y: number, width: number, height: number): Container {
  return createRasterPanel(x, y, width, height, 'panel');
}
