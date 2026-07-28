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
        fontWeight: '700',
        align: leftAligned ? 'left' : 'center',
        lineHeight: options.lineHeight ?? (options.fontSize ?? 20) * 1.15,
        dropShadow: { color: COLORS.dark, alpha: 0.68, blur: 3, distance: 1 },
      }),
    });
    this.labelText.anchor.set(leftAligned ? 0 : 0.5, 0.5);
    this.labelText.position.set(labelX, options.subtitle ? height * 0.38 : height / 2 - 1);

    this.addChild(this.background);
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
        style: new TextStyle({ fill: COLORS.muted, fontSize: Math.max(9, (options.fontSize ?? 16) - 6), wordWrap: true, wordWrapWidth: width - labelX - 18 }),
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
