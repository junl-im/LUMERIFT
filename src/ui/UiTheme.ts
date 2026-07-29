import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../app/constants';
import { createRasterPanel, getUiIconTexture } from './UiSkin';
import { bindPressFeedback } from './UiMotion';

export function createIconSprite(name: string, size = 34, tint?: number): Sprite | Graphics {
  const texture = getUiIconTexture(name);
  if (!texture) {
    return new Graphics()
      .circle(size / 2, size / 2, size * 0.34)
      .stroke({ color: tint ?? COLORS.primaryBright, width: 2, alpha: 0.8 });
  }
  const icon = new Sprite(texture);
  icon.width = size;
  icon.height = size;
  if (tint !== undefined) icon.tint = tint;
  return icon;
}

export function createResourceChip(
  iconName: string,
  label: string,
  value: string,
  width = 142,
): Container {
  const root = new Container();
  root.addChild(createRasterPanel(0, 0, width, 54, 'resource_chip'));
  root.addChild(new Graphics().roundRect(4, 4, width - 8, 18, 10).fill({ color: 0xffffff, alpha: 0.04 }));
  const icon = createIconSprite(iconName, 30);
  icon.position.set(10, 12);
  const labelText = new Text({
    text: label,
    style: new TextStyle({ fill: COLORS.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }),
  });
  labelText.position.set(44, 9);
  const valueText = new Text({
    text: value,
    style: new TextStyle({ fill: 0xf6e3ae, fontSize: 17, fontWeight: '700' }),
  });
  valueText.position.set(44, 24);
  root.addChild(icon, labelText, valueText);
  return root;
}

export interface MenuTileOptions {
  readonly icon: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly width?: number;
  readonly height?: number;
  readonly active?: boolean;
  readonly badge?: string;
  readonly onPress: () => void | Promise<void>;
}

export function createMenuTile(options: MenuTileOptions): Container {
  const width = options.width ?? 116;
  const height = options.height ?? 74;
  const root = new Container();
  const panel = createRasterPanel(0, 0, width, height, options.active ? 'nav_active' : 'nav_idle');
  const icon = createIconSprite(options.icon, options.subtitle ? 38 : 32);
  icon.position.set(10, options.subtitle ? 17 : 11);
  const label = new Text({
    text: options.label,
    style: new TextStyle({ fill: options.active ? 0xfbf1c7 : COLORS.text, fontSize: options.subtitle ? 15 : 12, fontWeight: '700', letterSpacing: 0.2 }),
  });
  label.position.set(options.subtitle ? 52 : 12, options.subtitle ? 14 : 45);
  const children: Container[] = [panel, icon, label];
  if (options.subtitle) {
    const subtitle = new Text({
      text: options.subtitle,
      style: new TextStyle({ fill: 0xb9cbc9, fontSize: 9, wordWrap: true, wordWrapWidth: width - 62, lineHeight: 12 }),
    });
    subtitle.position.set(52, 38);
    children.push(subtitle);
  }
  if (options.badge) {
    const badge = new Graphics().circle(width - 14, 14, 11).fill({ color: COLORS.danger, alpha: 0.98 }).stroke({ color: 0xf5d99a, width: 1 });
    const badgeText = new Text({ text: options.badge, style: new TextStyle({ fill: 0xffffff, fontSize: 10, fontWeight: '700' }) });
    badgeText.anchor.set(0.5);
    badgeText.position.set(width - 14, 14);
    children.push(badge, badgeText);
  }
  root.addChild(...children);
  bindPressFeedback(root, {
    width,
    height,
    minTouchSize: 48,
    onPress: options.onPress,
  });
  return root;
}

export function createSectionTitle(title: string, subtitle?: string): Container {
  const root = new Container();
  const mark = new Graphics()
    .roundRect(0, 3, 16, 8, 4)
    .fill({ color: COLORS.primaryBright, alpha: 0.92 })
    .roundRect(18, 5, 6, 4, 2)
    .fill({ color: COLORS.warning, alpha: 0.9 });
  const titleText = new Text({
    text: title,
    style: new TextStyle({ fill: 0xf4dca0, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }),
  });
  titleText.position.set(30, -2);
  root.addChild(mark, titleText);
  if (subtitle) {
    const sub = new Text({ text: subtitle, style: new TextStyle({ fill: COLORS.muted, fontSize: 10 }) });
    sub.position.set(30, 21);
    root.addChild(sub);
  }
  return root;
}

export function createGlowDivider(width: number): Container {
  const root = new Container();
  root.addChild(new Graphics().rect(0, 4, width, 1).fill({ color: COLORS.warning, alpha: 0.32 }));
  root.addChild(new Graphics().roundRect(width / 2 - 10, 1, 20, 6, 3).fill({ color: COLORS.primaryBright, alpha: 0.82 }));
  return root;
}
