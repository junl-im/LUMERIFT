import { Container, Graphics, NineSliceSprite, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../app/constants';
import { ASSET_PATHS } from '../core/assets/AssetCatalog';
import { buttonTextureName, getUiTexture } from './UiSkin';

interface UiButtonOptions {
  readonly label: string;
  readonly width?: number;
  readonly height?: number;
  readonly tone?: 'primary' | 'secondary' | 'danger';
  readonly fontSize?: number;
  readonly lineHeight?: number;
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
        leftWidth: 22,
        topHeight: 22,
        rightWidth: 22,
        bottomHeight: 22,
      });
      raster.width = width;
      raster.height = height;
      this.background = raster;
    } else {
      this.background = new Graphics()
        .roundRect(0, 0, width, height, 18)
        .fill({ color, alpha: 0.96 })
        .stroke({ color: 0xffffff, alpha: 0.15, width: 2 });
    }

    this.labelText = new Text({
      text: options.label,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: options.fontSize ?? 23,
        fontWeight: '600',
        align: 'center',
        lineHeight: options.lineHeight ?? (options.fontSize ?? 23) * 1.15,
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(width / 2, height / 2);

    this.addChild(this.background, this.labelText);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = { contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= width && y <= height };

    this.on('pointerdown', () => {
      if (this.enabled) this.scale.set(0.97);
    });
    this.on('pointerup', () => this.release(true));
    this.on('pointerupoutside', () => this.release(false));
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.45;
    this.eventMode = enabled ? 'static' : 'none';
  }

  public setLabel(label: string): void {
    this.labelText.text = label;
  }

  private release(activate: boolean): void {
    this.scale.set(1);
    if (activate && this.enabled) {
      window.dispatchEvent(new CustomEvent('lumerift:ui-press', { detail: ASSET_PATHS.uiClick }));
      void this.options.onPress();
    }
  }
}
