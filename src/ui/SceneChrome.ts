import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import { createRasterPanel } from './UiSkin';

export function createBackground(title: string, subtitle: string): Container {
  const root = new Container();
  const backdrop = new Graphics()
    .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
    .fill(COLORS.background)
    .circle(DESIGN_WIDTH * 0.75, 150, 230)
    .fill({ color: COLORS.primary, alpha: 0.08 })
    .circle(DESIGN_WIDTH * 0.2, 760, 280)
    .fill({ color: COLORS.accent, alpha: 0.05 });

  const heading = new Text({
    text: title,
    style: new TextStyle({ fill: COLORS.text, fontSize: 34, fontWeight: '700' }),
  });
  heading.anchor.set(0.5, 0);
  heading.position.set(DESIGN_WIDTH / 2, 88);

  const description = new Text({
    text: subtitle,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 17, align: 'center', wordWrap: true, wordWrapWidth: 450 }),
  });
  description.anchor.set(0.5, 0);
  description.position.set(DESIGN_WIDTH / 2, 145);

  root.addChild(backdrop, heading, description);
  return root;
}

export function createPanel(x: number, y: number, width: number, height: number): Container {
  return createRasterPanel(x, y, width, height);
}
