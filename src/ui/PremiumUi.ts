import { Container, Graphics, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import { COLORS } from '../app/constants';
import { createRasterPanel, getUiTexture } from './UiSkin';

export type UiTone = 'primary' | 'secondary' | 'warning' | 'danger' | 'success';

export function createSectionPanel(
  x: number,
  y: number,
  width: number,
  height: number,
  textureName = 'panel_strong',
): Container {
  return createRasterPanel(x, y, width, height, textureName);
}

export function createBadge(label: string, tone: UiTone = 'secondary'): Container {
  const root = new Container();
  const text = new Text({
    text: label,
    style: new TextStyle({
      fill: 0xf4f3ec,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
    }),
  });
  const width = Math.max(62, text.width + 24);
  const color = toneColor(tone);
  const background = new Graphics()
    .roundRect(0, 0, width, 26, 13)
    .fill({ color: 0x071117, alpha: 0.94 })
    .stroke({ color, alpha: 0.88, width: 2 })
    .moveTo(12, 4)
    .lineTo(width - 12, 4)
    .stroke({ color: 0xffffff, alpha: 0.16, width: 1 });
  text.anchor.set(0.5);
  text.position.set(width / 2, 13);
  root.addChild(background, text);
  return root;
}

export function createProgressBar(
  width: number,
  ratio: number,
  tone: UiTone = 'primary',
  height = 12,
): Container {
  const root = new Container();
  const safeRatio = Math.max(0, Math.min(1, ratio));
  const track = new Graphics()
    .roundRect(0, 0, width, height, height / 2)
    .fill({ color: 0x03080c, alpha: 0.92 })
    .stroke({ color: 0xffffff, alpha: 0.12, width: 1 });
  const fillWidth = Math.max(2, (width - 4) * safeRatio);
  const fill = new Graphics()
    .roundRect(2, 2, fillWidth, Math.max(2, height - 4), Math.max(1, (height - 4) / 2))
    .fill({ color: toneColor(tone), alpha: 0.98 })
    .roundRect(2, 2, fillWidth, Math.max(2, height - 4), Math.max(1, (height - 4) / 2))
    .stroke({ color: 0xffffff, alpha: 0.12, width: 1 });
  const highlight = new Graphics()
    .roundRect(4, 3, Math.max(0, fillWidth - 4), 2, 1)
    .fill({ color: 0xffffff, alpha: 0.24 });
  const markers = new Graphics();
  if (width >= 120) {
    for (let index = 1; index < 4; index += 1) {
      const x = Math.round((width * index) / 4);
      markers.rect(x, 2, 1, Math.max(2, height - 4)).fill({ color: 0xffffff, alpha: 0.08 });
    }
  }
  root.addChild(track, fill, highlight, markers);
  return root;
}

export function createItemFrame(
  texture: Texture | undefined,
  size: number,
  grade: 'common' | 'rare' | 'heroic' = 'common',
  selected = false,
): Container {
  const root = new Container();
  const frameTexture = getUiTexture(selected ? 'slot_selected' : `slot_${grade}`) ?? getUiTexture('slot');
  if (frameTexture) {
    const frame = new Sprite(frameTexture);
    frame.anchor.set(0.5);
    frame.width = size;
    frame.height = size;
    frame.position.set(size / 2, size / 2);
    root.addChild(frame);
  } else {
    root.addChild(new Graphics()
      .roundRect(0, 0, size, size, 12)
      .fill({ color: COLORS.panelStrong, alpha: 0.96 })
      .stroke({ color: gradeColor(grade), width: selected ? 4 : 2 }));
  }
  if (texture) {
    const icon = new Sprite(texture);
    icon.anchor.set(0.5);
    icon.width = size * 0.64;
    icon.height = size * 0.64;
    icon.position.set(size / 2, size / 2);
    root.addChild(icon);
  }
  return root;
}

export function createMetric(label: string, value: string, width = 136): Container {
  const root = new Container();
  const panel = createRasterPanel(0, 0, width, 60, 'resource_chip');
  const labelText = new Text({
    text: label,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }),
  });
  labelText.position.set(14, 10);
  const valueText = new Text({
    text: value,
    style: new TextStyle({ fill: 0xf5dda1, fontSize: 18, fontWeight: '700' }),
  });
  valueText.position.set(14, 29);
  root.addChild(panel, labelText, valueText);
  return root;
}

export function createDivider(width: number): Graphics {
  return new Graphics().rect(0, 0, width, 2).fill({ color: COLORS.warning, alpha: 0.28 });
}

function gradeColor(grade: 'common' | 'rare' | 'heroic'): number {
  if (grade === 'heroic') return 0xa65bd3;
  if (grade === 'rare') return 0x4197d3;
  return 0x778c98;
}

function toneColor(tone: UiTone): number {
  if (tone === 'danger') return COLORS.danger;
  if (tone === 'warning') return COLORS.warning;
  if (tone === 'success') return 0x35b98f;
  if (tone === 'secondary') return 0x72828c;
  return COLORS.primaryBright;
}
