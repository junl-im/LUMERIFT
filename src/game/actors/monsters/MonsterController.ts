import type {
  MonsterCombatConfig,
  MonsterPatternConfig,
  StatusEffectApplication,
} from '../../combat/combatData';
import { distance, normalize, type Vec2 } from '../../combat/geometry';
import { StatusEffectController, type StatusDamageEvent } from '../../status/StatusEffectController';

export type MonsterState = 'idle' | 'chase' | 'telegraph' | 'attack' | 'hit' | 'dead';

export interface MonsterAttackEvent {
  readonly pattern: MonsterPatternConfig;
  readonly damage: number;
  readonly origin: Vec2;
  readonly facing: Vec2;
}

export interface MonsterPhaseEvent {
  readonly phase: number;
  readonly hpRatio: number;
}

export interface MonsterTelegraph {
  readonly pattern: MonsterPatternConfig;
  readonly origin: Vec2;
  readonly facing: Vec2;
  readonly progress: number;
}

export class MonsterController {
  public readonly position: { x: number; y: number };
  public hp: number;
  public readonly statuses = new StatusEffectController();

  private stateValue: MonsterState = 'idle';
  private stateElapsed = 0;
  private cooldownRemaining = 0;
  private attackEmitted = false;
  private knockbackVelocity: Vec2 = { x: 0, y: 0 };
  private readonly attackEvents: MonsterAttackEvent[] = [];
  private readonly statusDamageEvents: StatusDamageEvent[] = [];
  private patternIndex = 0;
  private activePattern?: MonsterPatternConfig;
  private lockedOrigin: Vec2;
  private lockedFacing: Vec2 = { x: 0, y: 1 };
  private phaseValue = 1;
  private readonly phaseEvents: MonsterPhaseEvent[] = [];

  public constructor(
    public readonly config: MonsterCombatConfig,
    initialPosition: Vec2,
  ) {
    this.position = { ...initialPosition };
    this.lockedOrigin = { ...initialPosition };
    this.hp = config.maxHp;
  }

  public get state(): MonsterState {
    return this.stateValue;
  }

  public get isAlive(): boolean {
    return this.stateValue !== 'dead';
  }

  public get phase(): number {
    return this.phaseValue;
  }

  public get telegraph(): MonsterTelegraph | undefined {
    const pattern = this.activePattern;
    if (this.stateValue !== 'telegraph' || !pattern) return undefined;
    return {
      pattern,
      origin: { ...this.lockedOrigin },
      facing: { ...this.lockedFacing },
      progress: pattern.windup <= 0 ? 1 : Math.min(1, this.stateElapsed / pattern.windup),
    };
  }

  public update(deltaSeconds: number, playerPosition: Vec2): void {
    if (this.stateValue === 'dead') return;

    this.updateBossPhase();
    this.statuses.update(deltaSeconds);
    for (const event of this.statuses.drainDamageEvents()) {
      this.hp = Math.max(0, this.hp - event.damage);
      this.statusDamageEvents.push(event);
      if (this.hp <= 0) {
        this.changeState('dead');
        return;
      }
    }

    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - deltaSeconds);

    if (this.stateValue === 'hit') {
      this.stateElapsed += deltaSeconds;
      this.position.x += this.knockbackVelocity.x * deltaSeconds;
      this.position.y += this.knockbackVelocity.y * deltaSeconds;
      this.knockbackVelocity = {
        x: this.knockbackVelocity.x * Math.max(0, 1 - deltaSeconds * 11),
        y: this.knockbackVelocity.y * Math.max(0, 1 - deltaSeconds * 11),
      };
      if (this.stateElapsed >= this.config.hitRecovery) this.changeState('chase');
      return;
    }

    if (this.stateValue === 'telegraph') {
      this.stateElapsed += deltaSeconds;
      if (this.activePattern?.targetMode === 'self') {
        this.lockedOrigin = { ...this.position };
        this.lockedFacing = normalize({
          x: playerPosition.x - this.position.x,
          y: playerPosition.y - this.position.y,
        }, this.lockedFacing);
      }
      if (this.activePattern && this.stateElapsed >= this.activePattern.windup) {
        this.changeState('attack');
      }
      return;
    }

    if (this.stateValue === 'attack') {
      this.stateElapsed += deltaSeconds;
      const pattern = this.activePattern;
      if (pattern && !this.attackEmitted) {
        this.attackEmitted = true;
        this.attackEvents.push({
          pattern,
          damage: Math.max(1, Math.round(this.config.attack * pattern.damageMultiplier * this.phaseDamageMultiplier)),
          origin: { ...this.lockedOrigin },
          facing: { ...this.lockedFacing },
        });
      }
      if (pattern && this.stateElapsed >= Math.max(0.05, pattern.duration - pattern.windup)) {
        this.cooldownRemaining = pattern.cooldown / this.phaseSpeedMultiplier;
        this.patternIndex = (this.patternIndex + 1) % this.config.patterns.length;
        this.activePattern = undefined;
        this.changeState('chase');
      }
      return;
    }

    const playerDistance = distance(this.position, playerPosition);
    if (playerDistance > this.config.detectionRange) {
      this.changeState('idle');
      return;
    }

    const pattern = this.config.patterns[this.patternIndex] ?? this.config.patterns[0];
    if (pattern && playerDistance <= pattern.triggerRange && this.cooldownRemaining <= 0) {
      this.activePattern = pattern;
      this.lockedFacing = normalize({
        x: playerPosition.x - this.position.x,
        y: playerPosition.y - this.position.y,
      }, this.lockedFacing);
      this.lockedOrigin = pattern.targetMode === 'playerLocked'
        ? { ...playerPosition }
        : { ...this.position };
      this.changeState('telegraph');
      return;
    }

    this.changeState('chase');
    const direction = normalize({
      x: playerPosition.x - this.position.x,
      y: playerPosition.y - this.position.y,
    });
    const speed = this.config.moveSpeed * this.statuses.moveSpeedMultiplier * this.phaseSpeedMultiplier;
    this.position.x += direction.x * speed * deltaSeconds;
    this.position.y += direction.y * speed * deltaSeconds;
  }

  public receiveDamage(amount: number, hitDirection: Vec2, knockbackForce: number): boolean {
    if (!this.isAlive) return false;
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
    if (this.hp <= 0) {
      this.changeState('dead');
      return true;
    }

    const direction = normalize(hitDirection);
    const rankScale = this.config.rank === 'boss' ? 0.2 : this.config.rank === 'elite' ? 0.55 : 1;
    this.knockbackVelocity = {
      x: direction.x * knockbackForce * rankScale,
      y: direction.y * knockbackForce * rankScale,
    };
    this.changeState('hit');
    return true;
  }

  public applyStatusEffect(effect: StatusEffectApplication): void {
    if (!this.isAlive) return;
    this.statuses.apply(effect, this.config.statusDurationMultiplier);
  }

  public drainAttackEvents(): MonsterAttackEvent[] {
    return this.attackEvents.splice(0, this.attackEvents.length);
  }

  public drainStatusDamageEvents(): StatusDamageEvent[] {
    return this.statusDamageEvents.splice(0, this.statusDamageEvents.length);
  }

  public drainPhaseEvents(): MonsterPhaseEvent[] {
    return this.phaseEvents.splice(0, this.phaseEvents.length);
  }

  private get phaseSpeedMultiplier(): number {
    return this.config.rank === 'boss' ? 1 + (this.phaseValue - 1) * 0.14 : 1;
  }

  private get phaseDamageMultiplier(): number {
    return this.config.rank === 'boss' ? 1 + (this.phaseValue - 1) * 0.12 : 1;
  }

  private updateBossPhase(): void {
    if (this.config.rank !== 'boss' || this.stateValue === 'dead') return;
    const hpRatio = this.hp / Math.max(1, this.config.maxHp);
    const next = hpRatio <= 0.3 ? 3 : hpRatio <= 0.65 ? 2 : 1;
    if (next <= this.phaseValue) return;
    this.phaseValue = next;
    this.cooldownRemaining = 0;
    this.patternIndex = (next - 1) % Math.max(1, this.config.patterns.length);
    this.activePattern = undefined;
    if (this.stateValue !== 'hit') this.changeState('chase');
    this.phaseEvents.push({ phase: next, hpRatio });
  }

  private changeState(next: MonsterState): void {
    if (this.stateValue === next) return;
    this.stateValue = next;
    this.stateElapsed = 0;
    this.attackEmitted = false;
  }
}
