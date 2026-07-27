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
        leftWidth: 34,
        topHeight: 34,
        rightWidth: 34,
        bottomHeight: 34,
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

    this.labelText = new Text({
      text: options.label,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: options.fontSize ?? 20,
        fontWeight: '700',
        align: 'center',
        lineHeight: options.lineHeight ?? (options.fontSize ?? 20) * 1.15,
        dropShadow: { color: COLORS.dark, alpha: 0.68, blur: 3, distance: 1 },
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(width / 2, height / 2 - 1);

    this.addChild(this.background, this.labelText);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = { contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= width && y <= height };

    this.on('pointerover', () => {
      if (this.enabled) this.alpha = 0.94;
    });
    this.on('pointerout', () => {
      if (this.enabled) this.alpha = 1;
    });
    this.on('pointerdown', () => {
      if (this.enabled) this.scale.set(0.975);
    });
    this.on('pointerup', () => this.release(true));
    this.on('pointerupoutside', () => this.release(false));
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.alpha = enabled ? 1 : 0.42;
    this.eventMode = enabled ? 'static' : 'none';
  }

  public setLabel(label: string): void {
    this.labelText.text = label;
  }

  private release(activate: boolean): void {
    this.scale.set(1);
    this.alpha = this.enabled ? 1 : 0.42;
    if (activate && this.enabled) {
      window.dispatchEvent(new CustomEvent('lumerift:ui-press', { detail: ASSET_PATHS.uiClick }));
      void this.options.onPress();
    }
  }
}
