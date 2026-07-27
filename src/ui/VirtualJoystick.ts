import { Container, Graphics, Sprite, type FederatedPointerEvent } from 'pixi.js';
import { COLORS } from '../app/constants';
import type { Vec2 } from '../game/combat/geometry';
import { getUiTexture } from './UiSkin';

export interface VirtualJoystickOptions {
  readonly radius?: number;
  readonly deadZone?: number;
}

export class VirtualJoystick extends Container {
  private readonly radius: number;
  private readonly deadZone: number;
  private readonly knob = new Graphics();
  private activePointerId?: number;
  private axisValue: Vec2 = { x: 0, y: 0 };

  public constructor(options: VirtualJoystickOptions = {}) {
    super();
    this.radius = options.radius ?? 72;
    this.deadZone = options.deadZone ?? 0.18;

    const frameTexture = getUiTexture('action_button');
    if (frameTexture) {
      const frame = new Sprite(frameTexture);
      frame.anchor.set(0.5);
      frame.width = this.radius * 2.08;
      frame.height = this.radius * 2.08;
      frame.alpha = 0.72;
      this.addChild(frame);
    } else {
      this.addChild(new Graphics()
        .circle(0, 0, this.radius)
        .fill({ color: COLORS.panelStrong, alpha: 0.46 })
        .stroke({ color: COLORS.primaryBright, alpha: 0.62, width: 4 }));
    }

    const guide = new Graphics()
      .circle(0, 0, this.radius - 14)
      .stroke({ color: 0xffffff, alpha: 0.08, width: 2 })
      .lineStyle({ color: COLORS.primaryBright, alpha: 0.1, width: 2 })
      .moveTo(-this.radius + 28, 0)
      .lineTo(this.radius - 28, 0)
      .moveTo(0, -this.radius + 28)
      .lineTo(0, this.radius - 28);

    this.knob
      .circle(0, 0, this.radius * 0.34)
      .fill({ color: COLORS.primary, alpha: 0.84 })
      .circle(0, 0, this.radius * 0.26)
      .stroke({ color: COLORS.text, alpha: 0.42, width: 2 });

    this.addChild(guide, this.knob);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = {
      contains: (x: number, y: number) => Math.hypot(x, y) <= this.radius * 1.35,
    };

    this.on('pointerdown', (event: FederatedPointerEvent) => this.begin(event));
    this.on('globalpointermove', (event: FederatedPointerEvent) => this.move(event));
    this.on('pointerup', (event: FederatedPointerEvent) => this.end(event));
    this.on('pointerupoutside', (event: FederatedPointerEvent) => this.end(event));
    this.on('pointercancel', (event: FederatedPointerEvent) => this.end(event));
  }

  public get axis(): Vec2 {
    return { ...this.axisValue };
  }

  public reset(): void {
    this.activePointerId = undefined;
    this.axisValue = { x: 0, y: 0 };
    this.knob.position.set(0, 0);
    this.knob.alpha = 0.82;
  }

  private begin(event: FederatedPointerEvent): void {
    if (this.activePointerId !== undefined) return;
    this.activePointerId = event.pointerId;
    this.knob.alpha = 1;
    this.updateFromEvent(event);
  }

  private move(event: FederatedPointerEvent): void {
    if (event.pointerId !== this.activePointerId) return;
    this.updateFromEvent(event);
  }

  private end(event: FederatedPointerEvent): void {
    if (event.pointerId !== this.activePointerId) return;
    this.reset();
  }

  private updateFromEvent(event: FederatedPointerEvent): void {
    const local = event.getLocalPosition(this);
    const distance = Math.hypot(local.x, local.y);
    const maximum = this.radius * 0.74;
    const scale = distance > maximum && distance > 0 ? maximum / distance : 1;
    const x = local.x * scale;
    const y = local.y * scale;
    this.knob.position.set(x, y);

    const normalizedMagnitude = Math.min(1, distance / maximum);
    if (normalizedMagnitude <= this.deadZone || distance === 0) {
      this.axisValue = { x: 0, y: 0 };
      return;
    }

    const adjustedMagnitude = (normalizedMagnitude - this.deadZone) / (1 - this.deadZone);
    this.axisValue = {
      x: (local.x / distance) * adjustedMagnitude,
      y: (local.y / distance) * adjustedMagnitude,
    };
  }
}
