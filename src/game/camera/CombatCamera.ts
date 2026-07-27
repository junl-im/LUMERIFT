import type { Container } from 'pixi.js';

export class CombatCamera {
  private followX: number;
  private followY: number;
  private shakeRemaining = 0;
  private shakeDuration = 0;
  private shakeStrength = 0;
  private zoom = 1;
  private zoomTarget = 1;
  private zoomReturnDelay = 0;
  private hitStopRemaining = 0;

  public constructor(
    private readonly world: Container,
    private readonly viewportWidth: number,
    private readonly viewportHeight: number,
  ) {
    this.followX = viewportWidth / 2;
    this.followY = viewportHeight / 2;
  }

  public get timeScale(): number {
    return this.hitStopRemaining > 0 ? 0 : 1;
  }

  public update(deltaSeconds: number, targetX: number, targetY: number): void {
    this.hitStopRemaining = Math.max(0, this.hitStopRemaining - deltaSeconds);
    this.shakeRemaining = Math.max(0, this.shakeRemaining - deltaSeconds);
    this.zoomReturnDelay = Math.max(0, this.zoomReturnDelay - deltaSeconds);
    if (this.zoomReturnDelay === 0) this.zoomTarget = 1;

    const desiredX = Math.max(this.viewportWidth / 2 - 22, Math.min(this.viewportWidth / 2 + 22, targetX));
    const desiredY = Math.max(this.viewportHeight / 2 - 34, Math.min(this.viewportHeight / 2 + 34, targetY));
    const followLerp = 1 - Math.exp(-deltaSeconds * 6);
    this.followX += (desiredX - this.followX) * followLerp;
    this.followY += (desiredY - this.followY) * followLerp;

    const zoomLerp = 1 - Math.exp(-deltaSeconds * 12);
    this.zoom += (this.zoomTarget - this.zoom) * zoomLerp;

    const shakeRatio = this.shakeDuration > 0 ? this.shakeRemaining / this.shakeDuration : 0;
    const shake = this.shakeRemaining > 0 ? this.shakeStrength * shakeRatio : 0;
    const shakeX = (Math.random() * 2 - 1) * shake;
    const shakeY = (Math.random() * 2 - 1) * shake;

    this.world.pivot.set(this.followX, this.followY);
    this.world.position.set(this.viewportWidth / 2 + shakeX, this.viewportHeight / 2 + shakeY);
    this.world.scale.set(this.zoom);
  }

  public addShake(strength: number, duration = 0.16): void {
    if (strength < this.shakeStrength && this.shakeRemaining > 0) return;
    this.shakeStrength = strength;
    this.shakeDuration = duration;
    this.shakeRemaining = duration;
  }

  public pulseZoom(target: number, holdSeconds = 0.08): void {
    this.zoomTarget = Math.max(1, target);
    this.zoomReturnDelay = holdSeconds;
  }

  public addHitStop(seconds: number): void {
    this.hitStopRemaining = Math.max(this.hitStopRemaining, seconds);
  }

  public reset(): void {
    this.world.pivot.set(0, 0);
    this.world.position.set(0, 0);
    this.world.scale.set(1);
  }
}
