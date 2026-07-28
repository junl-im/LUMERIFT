import { Container, Graphics, Sprite, Text, TextStyle, type FederatedPointerEvent } from 'pixi.js';
import { COLORS } from '../app/constants';
import { ASSET_PATHS } from '../core/assets/AssetCatalog';
import { TouchActionGate } from '../core/input/TouchActionGate';
import { getUiTexture } from './UiSkin';

export interface CombatActionButtonOptions {
  readonly label: string;
  readonly radius?: number;
  readonly tone?: 'primary' | 'secondary' | 'danger';
  readonly onPress: () => void;
}

export class CombatActionButton extends Container {
  private readonly radius: number;
  private readonly readinessGlow = new Graphics();
  private readonly chargeRing = new Graphics();
  private readonly cooldownOverlay = new Graphics();
  private readonly labelText: Text;
  private readonly cooldownText: Text;
  private enabled = true;
  private empowered = false;
  private pulseElapsed = 0;
  private readonly actionGate = new TouchActionGate();

  public constructor(private readonly options: CombatActionButtonOptions) {
    super();
    this.radius = options.radius ?? 48;
    this.readinessGlow
      .circle(0, 0, this.radius + 7)
      .stroke({ color: 0xf5d36c, alpha: 0, width: 4 });
    this.addChild(this.readinessGlow);
    const textureName = options.tone === 'secondary' ? 'skill_button' : 'action_button';
    const frameTexture = getUiTexture(textureName) ?? getUiTexture('skill_frame');

    if (frameTexture) {
      const frame = new Sprite(frameTexture);
      frame.anchor.set(0.5);
      frame.width = this.radius * 2.2;
      frame.height = this.radius * 2.2;
      this.addChild(frame);
    } else {
      const color = options.tone === 'danger'
        ? COLORS.danger
        : options.tone === 'secondary'
          ? COLORS.warning
          : COLORS.primary;
      this.addChild(new Graphics()
        .circle(0, 0, this.radius)
        .fill({ color: COLORS.panelStrong, alpha: 0.96 })
        .stroke({ color, alpha: 0.92, width: 4 }));
    }

    const inner = new Graphics()
      .circle(0, 0, this.radius - 13)
      .fill({ color: COLORS.dark, alpha: 0.22 })
      .circle(0, 0, this.radius - 13)
      .stroke({ color: 0xffffff, alpha: 0.08, width: 1 });
    this.addChild(inner);

    this.labelText = new Text({
      text: options.label,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: Math.max(13, Math.round(this.radius * 0.31)),
        fontWeight: '700',
        align: 'center',
        dropShadow: { color: COLORS.dark, alpha: 0.8, blur: 3, distance: 1 },
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(0, 1);

    this.cooldownText = new Text({
      text: '',
      style: new TextStyle({ fill: COLORS.text, fontSize: 18, fontWeight: '700' }),
    });
    this.cooldownText.anchor.set(0.5);
    this.cooldownText.visible = false;

    this.addChild(this.chargeRing, this.cooldownOverlay, this.labelText, this.cooldownText);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = {
      contains: (x: number, y: number) => Math.hypot(x, y) <= this.radius * 1.1,
    };

    this.on('pointerover', () => {
      if (this.enabled) this.alpha = 0.94;
    });
    this.on('pointerout', () => {
      if (this.enabled) this.alpha = 1;
    });
    this.on('pointerdown', (event: FederatedPointerEvent) => {
      if (!this.enabled || !this.actionGate.begin(event.pointerId)) return;
      this.scale.set(0.94);
    });
    this.on('pointerup', (event: FederatedPointerEvent) => this.release(event, true));
    this.on('pointerupoutside', (event: FederatedPointerEvent) => this.release(event, false));
    this.on('pointercancel', (event: FederatedPointerEvent) => this.release(event, false));
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
    this.labelText.alpha = remaining > 0.01 ? 0.34 : 1;

    if (ratio <= 0) return;
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2 * ratio;
    this.cooldownOverlay
      .moveTo(0, 0)
      .arc(0, 0, this.radius - 9, start, end)
      .lineTo(0, 0)
      .fill({ color: COLORS.dark, alpha: 0.76 });
  }

  public setCharge(current: number, required: number, empowered: boolean): void {
    const safeRequired = Math.max(0, required);
    const ratio = safeRequired <= 0 ? 1 : Math.max(0, Math.min(1, current / safeRequired));
    this.empowered = empowered;
    this.chargeRing.clear();
    if (safeRequired <= 0) return;
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2 * ratio;
    this.chargeRing
      .arc(0, 0, this.radius + 2, start, end)
      .stroke({ color: empowered ? 0xffdf7d : 0x66d9d1, alpha: empowered ? 0.96 : 0.62, width: empowered ? 4 : 3 });
  }

  public update(deltaSeconds: number): void {
    this.pulseElapsed += Math.max(0, deltaSeconds);
    const pulse = this.empowered ? 0.55 + Math.sin(this.pulseElapsed * 6.5) * 0.25 : 0;
    this.readinessGlow.clear()
      .circle(0, 0, this.radius + 7 + (this.empowered ? Math.sin(this.pulseElapsed * 4) * 1.5 : 0))
      .stroke({ color: 0xf5d36c, alpha: Math.max(0, pulse), width: this.empowered ? 4 : 2 });
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.eventMode = enabled ? 'static' : 'none';
    this.alpha = enabled ? 1 : 0.4;
    if (!enabled) {
      this.actionGate.reset();
      this.scale.set(1);
    }
  }

  private release(event: FederatedPointerEvent, activate: boolean): void {
    if (!this.actionGate.owns(event.pointerId)) return;
    const accepted = activate ? this.actionGate.release(event.pointerId) : this.actionGate.cancel(event.pointerId);
    this.scale.set(1);
    this.alpha = this.enabled ? 1 : 0.4;
    if (!activate || !accepted || !this.enabled) return;
    window.dispatchEvent(new CustomEvent('lumerift:ui-press', { detail: ASSET_PATHS.uiClick }));
    this.options.onPress();
  }
}
