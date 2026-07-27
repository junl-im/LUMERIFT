import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import { createRasterPanel, getSceneBackgroundTexture } from './UiSkin';

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
    .fill({ color: COLORS.dark, alpha: 0.64 })
    .rect(0, 0, DESIGN_WIDTH, 170)
    .fill({ color: COLORS.dark, alpha: 0.34 });
  const top = createRasterPanel(18, 18, DESIGN_WIDTH - 36, 118, 'panel_strong');
  const heading = new Text({
    text: title,
    style: new TextStyle({
      fill: 0xf6dda2,
      fontSize: 30,
      fontWeight: '700',
      letterSpacing: 0.5,
      dropShadow: { color: COLORS.dark, alpha: 0.72, blur: 3, distance: 1 },
    }),
  });
  heading.position.set(36, 36);

  const description = new Text({
    text: subtitle,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 14, wordWrap: true, wordWrapWidth: 450 }),
  });
  description.position.set(37, 78);

  root.addChild(shade, top, heading, description);
  return root;
}

export function createPanel(x: number, y: number, width: number, height: number): Container {
  return createRasterPanel(x, y, width, height, 'panel');
}
