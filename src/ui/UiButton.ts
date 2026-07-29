import { Container, Graphics, NineSliceSprite, Sprite, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../app/constants';
import { buttonTextureName, getUiIconTexture, getUiTexture } from './UiSkin';
import { bindPressFeedback } from './UiMotion';

interface UiButtonOptions {
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly tone?: 'primary' | 'secondary' | 'danger';
  readonly fontSize?: number;
  readonly lineHeight?: number;
  readonly subtitle?: string;
  readonly icon?: string;
  readonly align?: 'center' | 'left';
  readonly onPress: () => void | Promise<void>;
}

export class UiButton extends Container {
  private readonly background: Container;
  private readonly labelText: Text;
  private enabled = true;

  public constructor(private readonly options: UiButtonOptions) {
    super();

    const width = options.width ?? 300;
    const height = options.height ?? 68;
    const texture = getUiTexture(buttonTextureName(options.tone));
    const color = options.tone === 'danger'
      ? COLORS.danger
      : options.tone === 'secondary'
        ? COLORS.panelStrong
        : COLORS.primary;

    if (texture) {
      const raster = new NineSliceSprite({
        texture,
        leftWidth: 44,
        topHeight: 40,
        rightWidth: 44,
        bottomHeight: 40,
      });
      raster.width = width;
      raster.height = height;
      this.background = raster;
    } else {
      this.background = new Graphics()
        .roundRect(0, 0, width, height, 20)
        .fill({ color, alpha: 0.96 })
        .stroke({ color: COLORS.warning, alpha: 0.42, width: 2 });
    }

    const hasIcon = Boolean(options.icon);
    const leftAligned = options.align === 'left' || Boolean(options.subtitle);
    const labelX = leftAligned ? (hasIcon ? 58 : 22) : width / 2;
    this.labelText = new Text({
      text: options.label,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: options.fontSize ?? 20,
        fontWeight: '800',
        letterSpacing: 0.25,
        align: leftAligned ? 'left' : 'center',
        lineHeight: options.lineHeight ?? (options.fontSize ?? 20) * 1.15,
        dropShadow: { color: COLORS.dark, alpha: 0.68, blur: 3, distance: 1 },
      }),
    });
    this.labelText.anchor.set(leftAligned ? 0 : 0.5, 0.5);
    this.labelText.position.set(labelX, options.subtitle ? height * 0.38 : height / 2 - 1);

    this.addChild(this.background);
    const stickerShadow = new Graphics()
      .roundRect(6, 6, width - 12, Math.max(16, height - 12), 18)
      .stroke({ color: 0xffffff, alpha: 0.06, width: 1 })
      .roundRect(10, 10, Math.min(96, width * 0.3), 12, 6)
      .fill({ color: 0xffffff, alpha: 0.05 });
    const topSheen = new Graphics()
      .roundRect(8, 8, width - 16, Math.max(10, height * 0.26), 14)
      .fill({ color: 0xffffff, alpha: 0.05 })
      .moveTo(width - 42, 10)
      .lineTo(width - 20, 10)
      .lineTo(width - 16, 14)
      .lineTo(width - 16, 26)
      .stroke({ color: COLORS.warning, alpha: 0.22, width: 1.5 });
    const commandRail = new Graphics()
      .roundRect(12, height - 10, Math.max(32, width * 0.22), 4, 2)
      .fill({ color: options.tone === 'danger' ? COLORS.danger : COLORS.primaryBright, alpha: 0.5 })
      .roundRect(width - 34, height - 10, 20, 4, 2)
      .fill({ color: COLORS.warning, alpha: 0.44 });
    const commandDot = new Graphics()
      .circle(width - 18, 18, 3)
      .fill({ color: options.tone === 'danger' ? COLORS.danger : COLORS.primaryBright, alpha: 0.72 });
    this.addChild(stickerShadow, topSheen, commandRail, commandDot);
    if (options.icon) {
      const iconTexture = getUiIconTexture(options.icon);
      if (iconTexture) {
        const icon = new Sprite(iconTexture);
        const iconSize = Math.min(38, height - 18);
        icon.width = iconSize;
        icon.height = iconSize;
        icon.position.set(14, (height - iconSize) / 2);
        this.addChild(icon);
      }
    }
    this.addChild(this.labelText);

    if (options.subtitle) {
      const subtitle = new Text({
        text: options.subtitle,
        style: new TextStyle({ fill: 0xb4c6ce, fontSize: Math.max(9, (options.fontSize ?? 16) - 6), fontWeight: '700', wordWrap: true, wordWrapWidth: width - labelX - 18 }),
      });
      subtitle.position.set(labelX, height * 0.58);
      this.addChild(subtitle);
    }

    bindPressFeedback(this, {
      width,
      height,
      minTouchSize: 48,
      isEnabled: () => this.enabled,
      onPress: () => this.release(),
    });
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.42;
    this.eventMode = enabled ? 'static' : 'none';
  }

  public setLabel(label: string): void {
    this.labelText.text = label;
  }

  private release(): void {
    if (!this.enabled) return;
    void this.options.onPress();
  }
}
