import type { StatusEffectApplication, StatusEffectId } from '../combat/combatData';

interface ActiveStatus {
  readonly id: StatusEffectId;
  readonly potency: number;
  stacks: number;
  readonly tickInterval: number;
  remaining: number;
  tickRemaining: number;
}

export interface StatusDamageEvent {
  readonly id: 'burn';
  readonly damage: number;
}

export interface StatusLifecycleEvent {
  readonly id: StatusEffectId;
  readonly kind: 'stack' | 'cleanse' | 'immune';
  readonly stacks: number;
}

export interface ActiveStatusSnapshot {
  readonly id: StatusEffectId;
  readonly potency: number;
  readonly remaining: number;
  readonly stacks: number;
}

export class StatusEffectController {
  private readonly active = new Map<StatusEffectId, ActiveStatus>();
  private readonly damageEvents: StatusDamageEvent[] = [];
  private readonly lifecycleEvents: StatusLifecycleEvent[] = [];

  public apply(config: StatusEffectApplication, durationMultiplier = 1): void {
    const duration = Math.max(0.05, config.duration * durationMultiplier);
    const tickInterval = config.id === 'burn' ? (config.tickInterval ?? 0.5) : 1;
    const existing = this.active.get(config.id);

    if (existing) {
      existing.stacks = Math.min(3, existing.stacks + 1);
      this.lifecycleEvents.push({ id: config.id, kind: 'stack', stacks: existing.stacks });
      existing.remaining = Math.max(existing.remaining, duration);
      existing.tickRemaining = Math.min(existing.tickRemaining, tickInterval);
      if (config.potency > existing.potency) {
        this.active.set(config.id, {
          id: config.id,
          potency: config.potency,
          stacks: existing.stacks,
          tickInterval,
          remaining: Math.max(existing.remaining, duration),
          tickRemaining: Math.min(existing.tickRemaining, tickInterval),
        });
      }
      return;
    }

    this.active.set(config.id, {
      id: config.id,
      potency: config.potency,
      stacks: 1,
      tickInterval,
      remaining: duration,
      tickRemaining: tickInterval,
    });
  }

  public update(deltaSeconds: number): void {
    for (const [id, status] of this.active) {
      status.remaining = Math.max(0, status.remaining - deltaSeconds);

      if (status.id === 'burn') {
        status.tickRemaining -= deltaSeconds;
        while (status.tickRemaining <= 0 && status.remaining > 0) {
          this.damageEvents.push({ id: 'burn', damage: Math.max(1, Math.round(status.potency * status.tickInterval)) });
          status.tickRemaining += status.tickInterval;
        }
      }

      if (status.remaining <= 0) {
        this.active.delete(id);
        this.lifecycleEvents.push({ id, kind: 'cleanse', stacks: status.stacks });
      }
    }
  }

  public get moveSpeedMultiplier(): number {
    const slow = this.active.get('slow');
    if (!slow) return 1;
    return Math.max(0.2, 1 - slow.potency);
  }

  public has(id: StatusEffectId): boolean {
    return this.active.has(id);
  }

  public get activeIds(): readonly StatusEffectId[] {
    return [...this.active.keys()];
  }

  public get activeSnapshots(): readonly ActiveStatusSnapshot[] {
    return [...this.active.values()].map((status) => ({ id: status.id, potency: status.potency, remaining: status.remaining, stacks: status.stacks }));
  }

  public notifyImmune(id: StatusEffectId): void {
    this.lifecycleEvents.push({ id, kind: 'immune', stacks: this.active.get(id)?.stacks ?? 0 });
  }

  public drainLifecycleEvents(): StatusLifecycleEvent[] {
    return this.lifecycleEvents.splice(0, this.lifecycleEvents.length);
  }

  public drainDamageEvents(): StatusDamageEvent[] {
    return this.damageEvents.splice(0, this.damageEvents.length);
  }

  public clear(): void {
    this.active.clear();
    this.damageEvents.length = 0;
    this.lifecycleEvents.length = 0;
  }
}
