import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { COLORS } from '../app/constants';
import { ASSET_PATHS } from '../core/assets/AssetCatalog';
import { getUiTexture } from './UiSkin';

export interface CombatActionButtonOptions {
  readonly label: string;
  readonly radius?: number;
  readonly tone?: 'primary' | 'secondary' | 'danger';
  readonly onPress: () => void;
}

export class CombatActionButton extends Container {
  private readonly radius: number;
  private readonly background = new Graphics();
  private readonly cooldownOverlay = new Graphics();
  private readonly labelText: Text;
  private readonly cooldownText: Text;
  private enabled = true;

  public constructor(private readonly options: CombatActionButtonOptions) {
    super();
    this.radius = options.radius ?? 48;
    const frameTexture = getUiTexture('skill_frame');

    const color = options.tone === 'danger'
      ? COLORS.danger
      : options.tone === 'secondary'
        ? COLORS.panelStrong
        : COLORS.primary;
    this.background
      .circle(0, 0, this.radius)
      .fill({ color, alpha: 0.94 })
      .circle(0, 0, this.radius - 7)
      .stroke({ color: COLORS.text, alpha: 0.16, width: 2 });
    this.addChild(this.background);

    if (frameTexture) {
      const frame = new Sprite(frameTexture);
      frame.anchor.set(0.5);
      frame.width = this.radius * 2.16;
      frame.height = this.radius * 2.16;
      this.addChild(frame);
    }

    this.labelText = new Text({
      text: options.label,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: Math.max(14, Math.round(this.radius * 0.34)),
        fontWeight: '700',
        align: 'center',
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(0, 2);

    this.cooldownText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 18, fontWeight: '700' }),
    });
    this.cooldownText.anchor.set(0.5);
    this.cooldownText.visible = false;

    this.addChild(this.cooldownOverlay, this.labelText, this.cooldownText);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = {
      contains: (x: number, y: number) => Math.hypot(x, y) <= this.radius * 1.08,
    };

    this.on('pointerdown', () => {
      if (this.enabled) this.scale.set(0.94);
    });
    this.on('pointerup', () => this.release(true));
    this.on('pointerupoutside', () => this.release(false));
  }

  public setLabel(label: string): void {
    this.labelText.text = label;
  }

  public setCooldown(remaining: number, total: number): void {
    const safeTotal = Math.max(0.001, total);
    const ratio = Math.max(0, Math.min(1, remaining / safeTotal));
    this.cooldownOverlay.clear();
    this.cooldownText.visible = remaining > 0.01;
    this.cooldownText.text = remaining >= 1 ? remaining.toFixed(1) : remaining > 0.01 ? '0.x' : '';
    this.labelText.alpha = remaining > 0.01 ? 0.42 : 1;

    if (ratio <= 0) return;
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2 * ratio;
    this.cooldownOverlay
      .moveTo(0, 0)
      .arc(0, 0, this.radius - 3, start, end)
      .lineTo(0, 0)
      .fill({ color: COLORS.dark, alpha: 0.72 });
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.eventMode = enabled ? 'static' : 'none';
    this.alpha = enabled ? 1 : 0.48;
  }

  private release(activate: boolean): void {
    this.scale.set(1);
    if (!activate || !this.enabled) return;
    window.dispatchEvent(new CustomEvent('lumerift:ui-press', { detail: ASSET_PATHS.uiClick }));
    this.options.onPress();
  }
}
