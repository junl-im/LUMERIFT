import type { StatusEffectApplication, StatusEffectId } from '../combat/combatData';

interface ActiveStatus {
  readonly id: StatusEffectId;
  readonly potency: number;
  readonly tickInterval: number;
  remaining: number;
  tickRemaining: number;
}

export interface StatusDamageEvent {
  readonly id: 'burn';
  readonly damage: number;
}

export class StatusEffectController {
  private readonly active = new Map<StatusEffectId, ActiveStatus>();
  private readonly damageEvents: StatusDamageEvent[] = [];

  public apply(config: StatusEffectApplication, durationMultiplier = 1): void {
    const duration = Math.max(0.05, config.duration * durationMultiplier);
    const tickInterval = config.id === 'burn' ? (config.tickInterval ?? 0.5) : 1;
    const existing = this.active.get(config.id);

    if (existing) {
      existing.remaining = Math.max(existing.remaining, duration);
      existing.tickRemaining = Math.min(existing.tickRemaining, tickInterval);
      if (config.potency > existing.potency) {
        this.active.set(config.id, {
          id: config.id,
          potency: config.potency,
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

      if (status.remaining <= 0) this.active.delete(id);
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

  public drainDamageEvents(): StatusDamageEvent[] {
    return this.damageEvents.splice(0, this.damageEvents.length);
  }

  public clear(): void {
    this.active.clear();
    this.damageEvents.length = 0;
  }
}
