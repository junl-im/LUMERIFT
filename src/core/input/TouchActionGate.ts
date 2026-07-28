export class TouchActionGate {
  private activePointerId?: number;
  private lastActivationAt = Number.NEGATIVE_INFINITY;

  public constructor(private readonly minimumIntervalMs = 72) {}

  public begin(pointerId: number): boolean {
    if (this.activePointerId !== undefined) return false;
    this.activePointerId = pointerId;
    return true;
  }

  public owns(pointerId: number): boolean {
    return pointerId === this.activePointerId;
  }

  public cancel(pointerId: number): boolean {
    if (pointerId !== this.activePointerId) return false;
    this.activePointerId = undefined;
    return true;
  }

  public release(pointerId: number, now = performance.now()): boolean {
    if (pointerId !== this.activePointerId) return false;
    this.activePointerId = undefined;
    if (now - this.lastActivationAt < this.minimumIntervalMs) return false;
    this.lastActivationAt = now;
    return true;
  }

  public reset(): void {
    this.activePointerId = undefined;
  }
}
