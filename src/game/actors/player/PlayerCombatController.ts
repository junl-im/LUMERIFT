import type { CombatActionConfig, PlayerCombatConfig } from '../../combat/combatData';
import { normalize, type Vec2 } from '../../combat/geometry';

export type PlayerState = 'idle' | 'moving' | 'attacking' | 'skill' | 'dodging' | 'hit' | 'dead';

export interface PlayerHitEvent {
  readonly action: CombatActionConfig;
  readonly origin: Vec2;
  readonly facing: Vec2;
}

export class PlayerCombatController {
  public readonly position: { x: number; y: number };
  public readonly facing: { x: number; y: number } = { x: 0, y: -1 };
  public hp: number;

  private stateValue: PlayerState = 'idle';
  private stateElapsed = 0;
  private currentAction?: CombatActionConfig;
  private currentComboIndex = 0;
  private comboGraceRemaining = 0;
  private queuedAttack = false;
  private hitEventEmitted = false;
  private invulnerabilityRemaining = 0;
  private dodgeCooldownRemaining = 0;
  private readonly skillCooldowns = new Map<'skill1' | 'skill2', number>();
  private readonly hitEvents: PlayerHitEvent[] = [];
  private dodgeDirection: Vec2 = { x: 0, y: -1 };

  public constructor(
    private readonly config: PlayerCombatConfig,
    initialPosition: Vec2,
  ) {
    this.position = { ...initialPosition };
    this.hp = config.maxHp;
    this.skillCooldowns.set('skill1', 0);
    this.skillCooldowns.set('skill2', 0);
  }

  public get state(): PlayerState {
    return this.stateValue;
  }

  public get maxHp(): number {
    return this.config.maxHp;
  }

  public get comboStep(): number {
    return this.stateValue === 'attacking' || this.comboGraceRemaining > 0 ? this.currentComboIndex + 1 : 0;
  }

  public get isInvulnerable(): boolean {
    return this.invulnerabilityRemaining > 0;
  }

  public get dodgeCooldown(): number {
    return this.dodgeCooldownRemaining;
  }

  public get activeAction(): CombatActionConfig | undefined {
    return this.currentAction;
  }

  public get stateProgress(): number {
    if (this.stateValue === 'attacking' || this.stateValue === 'skill') {
      return Math.max(0, Math.min(1, this.stateElapsed / Math.max(0.01, this.currentAction?.duration ?? 1)));
    }
    if (this.stateValue === 'dodging') {
      return Math.max(0, Math.min(1, this.stateElapsed / Math.max(0.01, this.config.dodge.duration)));
    }
    if (this.stateValue === 'hit') {
      return Math.max(0, Math.min(1, this.stateElapsed / Math.max(0.01, this.config.hitRecovery)));
    }
    return this.stateValue === 'dead' ? 1 : 0;
  }

  public getSkillCooldown(slot: 'skill1' | 'skill2'): number {
    return this.skillCooldowns.get(slot) ?? 0;
  }

  public getSkillCooldownTotal(slot: 'skill1' | 'skill2'): number {
    return this.config.skills[slot].cooldown;
  }

  public get dodgeCooldownTotal(): number {
    return this.config.dodge.cooldown;
  }

  public update(deltaSeconds: number, moveAxis: Vec2): void {
    this.invulnerabilityRemaining = Math.max(0, this.invulnerabilityRemaining - deltaSeconds);
    this.dodgeCooldownRemaining = Math.max(0, this.dodgeCooldownRemaining - deltaSeconds);
    this.skillCooldowns.set('skill1', Math.max(0, this.getSkillCooldown('skill1') - deltaSeconds));
    this.skillCooldowns.set('skill2', Math.max(0, this.getSkillCooldown('skill2') - deltaSeconds));

    if (this.comboGraceRemaining > 0) {
      this.comboGraceRemaining = Math.max(0, this.comboGraceRemaining - deltaSeconds);
      if (this.comboGraceRemaining === 0 && this.stateValue !== 'attacking') this.currentComboIndex = 0;
    }

    if (this.stateValue === 'dead') return;

    if (this.stateValue === 'dodging') {
      this.stateElapsed += deltaSeconds;
      this.position.x += this.dodgeDirection.x * this.config.dodge.speed * deltaSeconds;
      this.position.y += this.dodgeDirection.y * this.config.dodge.speed * deltaSeconds;
      if (this.stateElapsed >= this.config.dodge.duration) this.finishAction();
      return;
    }

    if (this.stateValue === 'hit') {
      this.stateElapsed += deltaSeconds;
      if (this.stateElapsed >= this.config.hitRecovery) this.finishAction();
      return;
    }

    if (this.stateValue === 'attacking' || this.stateValue === 'skill') {
      this.updateAction(deltaSeconds);
      return;
    }

    const movement = normalize(moveAxis, { x: 0, y: 0 });
    if (movement.x !== 0 || movement.y !== 0) {
      this.facing.x = movement.x;
      this.facing.y = movement.y;
      this.position.x += movement.x * this.config.moveSpeed * deltaSeconds;
      this.position.y += movement.y * this.config.moveSpeed * deltaSeconds;
      this.stateValue = 'moving';
    } else {
      this.stateValue = 'idle';
    }
  }

  public requestAttack(): boolean {
    if (this.stateValue === 'dead' || this.stateValue === 'dodging' || this.stateValue === 'hit' || this.stateValue === 'skill') {
      return false;
    }

    if (this.stateValue === 'attacking') {
      if (this.currentComboIndex < this.config.combo.length - 1) this.queuedAttack = true;
      return true;
    }

    const nextIndex = this.comboGraceRemaining > 0
      ? Math.min(this.currentComboIndex + 1, this.config.combo.length - 1)
      : 0;
    this.startAction(this.config.combo[nextIndex]!, 'attacking', nextIndex);
    return true;
  }

  public requestSkill(slot: 'skill1' | 'skill2'): boolean {
    if (!this.canStartSkillAction() || this.getSkillCooldown(slot) > 0) return false;
    const action = this.config.skills[slot];
    this.skillCooldowns.set(slot, action.cooldown);
    this.startAction(action, 'skill');
    this.currentComboIndex = 0;
    this.comboGraceRemaining = 0;
    return true;
  }

  public requestDodge(direction: Vec2): boolean {
    if (!this.canStartDodgeAction() || this.dodgeCooldownRemaining > 0) return false;
    const fallback = this.facing.x === 0 && this.facing.y === 0 ? { x: 0, y: -1 } : this.facing;
    this.dodgeDirection = normalize(direction, fallback);
    this.facing.x = this.dodgeDirection.x;
    this.facing.y = this.dodgeDirection.y;
    this.stateValue = 'dodging';
    this.stateElapsed = 0;
    this.currentAction = undefined;
    this.queuedAttack = false;
    this.invulnerabilityRemaining = this.config.dodge.invulnerability;
    this.dodgeCooldownRemaining = this.config.dodge.cooldown;
    this.currentComboIndex = 0;
    this.comboGraceRemaining = 0;
    return true;
  }

  public receiveDamage(amount: number): boolean {
    if (this.stateValue === 'dead' || this.isInvulnerable) return false;
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
    this.queuedAttack = false;
    this.currentAction = undefined;
    this.currentComboIndex = 0;
    this.comboGraceRemaining = 0;
    this.stateElapsed = 0;
    this.stateValue = this.hp <= 0 ? 'dead' : 'hit';
    return true;
  }

  public drainHitEvents(): PlayerHitEvent[] {
    return this.hitEvents.splice(0, this.hitEvents.length);
  }

  public reduceCooldowns(seconds: number): void {
    const amount = Math.max(0, seconds);
    this.skillCooldowns.set('skill1', Math.max(0, this.getSkillCooldown('skill1') - amount));
    this.skillCooldowns.set('skill2', Math.max(0, this.getSkillCooldown('skill2') - amount));
    this.dodgeCooldownRemaining = Math.max(0, this.dodgeCooldownRemaining - amount * 0.5);
  }

  private updateAction(deltaSeconds: number): void {
    const action = this.currentAction;
    if (!action) {
      this.finishAction();
      return;
    }

    const previousElapsed = this.stateElapsed;
    this.stateElapsed += deltaSeconds;

    if (action.lungeDistance > 0 && previousElapsed < action.hitTime) {
      const activeDelta = Math.min(this.stateElapsed, action.hitTime) - previousElapsed;
      const speed = action.lungeDistance / Math.max(action.hitTime, 0.01);
      this.position.x += this.facing.x * speed * activeDelta;
      this.position.y += this.facing.y * speed * activeDelta;
    }

    if (!this.hitEventEmitted && this.stateElapsed >= action.hitTime) {
      this.hitEventEmitted = true;
      this.hitEvents.push({ action, origin: { ...this.position }, facing: { ...this.facing } });
    }

    const chainTime = action.duration * 0.68;
    if (this.stateValue === 'attacking' && this.queuedAttack && this.stateElapsed >= chainTime) {
      const nextIndex = Math.min(this.currentComboIndex + 1, this.config.combo.length - 1);
      this.startAction(this.config.combo[nextIndex]!, 'attacking', nextIndex);
      return;
    }

    if (this.stateElapsed >= action.duration) {
      if (this.stateValue === 'attacking') this.comboGraceRemaining = action.comboWindow;
      this.finishAction();
    }
  }

  private startAction(action: CombatActionConfig, state: 'attacking' | 'skill', comboIndex = 0): void {
    this.stateValue = state;
    this.stateElapsed = 0;
    this.currentAction = action;
    this.currentComboIndex = comboIndex;
    this.queuedAttack = false;
    this.hitEventEmitted = false;
  }

  private finishAction(): void {
    this.stateValue = 'idle';
    this.stateElapsed = 0;
    this.currentAction = undefined;
    this.hitEventEmitted = false;
  }

  private canStartIndependentAction(): boolean {
    return this.stateValue === 'idle' || this.stateValue === 'moving';
  }

  private canStartSkillAction(): boolean {
    return this.canStartIndependentAction()
      || (this.stateValue === 'attacking' && this.hitEventEmitted);
  }

  private canStartDodgeAction(): boolean {
    return this.canStartIndependentAction()
      || ((this.stateValue === 'attacking' || this.stateValue === 'skill') && this.hitEventEmitted);
  }
}
