import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../app/constants';

export type UxFeedbackTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface UxStatusRailOptions {
  readonly eyebrow: string;
  readonly title: string;
  readonly detail: string;
  readonly width?: number;
  readonly height?: number;
  readonly tone?: UxFeedbackTone;
}

export function createUxStatusRail(options: UxStatusRailOptions): Container {
  const root = new Container();
  const width = options.width ?? 236;
  const height = options.height ?? 90;
  const color = toneColor(options.tone ?? 'primary');
  const plate = new Graphics()
    .roundRect(0, 0, width, height, 18)
    .fill({ color: COLORS.panelStrong, alpha: 0.94 })
    .stroke({ color, alpha: 0.54, width: 2 })
    .roundRect(8, 8, width - 16, 16, 8)
    .fill({ color, alpha: 0.08 })
    .moveTo(14, height - 10)
    .lineTo(Math.min(width - 14, 118), height - 10)
    .stroke({ color, alpha: 0.64, width: 3 })
    .circle(width - 18, 18, 4)
    .fill({ color, alpha: 0.82 });
  const eyebrow = new Text({
    text: options.eyebrow,
    style: new TextStyle({ fill: color, fontSize: 8, fontWeight: '900', letterSpacing: 1.25 }),
  });
  eyebrow.position.set(14, 11);
  const title = new Text({
    text: options.title,
    style: new TextStyle({ fill: COLORS.paper, fontSize: 14, fontWeight: '900', letterSpacing: 0.3 }),
  });
  title.position.set(14, 29);
  const detail = new Text({
    text: options.detail,
    style: new TextStyle({ fill: COLORS.mintFog, fontSize: 9, fontWeight: '700', wordWrap: true, wordWrapWidth: width - 28, lineHeight: 12 }),
  });
  detail.position.set(14, 50);
  root.addChild(plate, eyebrow, title, detail);
  return root;
}

export function createInlineFeedback(message: string, tone: UxFeedbackTone = 'neutral', width = 484): Container {
  const root = new Container();
  const color = toneColor(tone);
  const plate = new Graphics()
    .roundRect(0, 0, width, 20, 10)
    .fill({ color: COLORS.ink, alpha: 0.9 })
    .stroke({ color, alpha: 0.42, width: 1 })
    .roundRect(8, 7, 40, 5, 3)
    .fill({ color, alpha: 0.72 });
  const text = new Text({
    text: message,
    style: new TextStyle({ fill: COLORS.text, fontSize: 8, fontWeight: '800', letterSpacing: 0.25 }),
  });
  text.position.set(58, 5);
  root.addChild(plate, text);
  return root;
}

function toneColor(tone: UxFeedbackTone): number {
  if (tone === 'success') return 0x35b98f;
  if (tone === 'warning') return COLORS.warning;
  if (tone === 'danger') return COLORS.danger;
  if (tone === 'neutral') return 0x829793;
  return COLORS.primaryBright;
}
