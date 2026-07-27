import { AnimatedSprite, Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import { COLORS } from '../../app/constants';
import type { GraphicsQualityPreset } from '../../core/graphics/GraphicsQualityController';
import type { MonsterDefinition, StatusEffectId } from '../combat/combatData';
import type { MonsterController, MonsterState, MonsterTelegraph } from '../actors/monsters/MonsterController';
import type { PlayerCombatController, PlayerState } from '../actors/player/PlayerCombatController';
import type { Vec2 } from '../combat/geometry';
import { directionFromVector } from './direction';

export class PlayerActorView {
  public readonly root = new Container();
  private readonly body = new Graphics();
  private readonly weapon = new Graphics();
  private readonly sprite?: AnimatedSprite;
  private readonly equipmentLayer?: Sprite;
  private readonly spriteBaseScale = 1.05;
  private animationKey = '';

  public constructor(
    private readonly sheet?: Spritesheet,
    equipmentSheet?: Spritesheet,
    weaponItemId?: string,
  ) {
    const shadow = new Graphics()
      .ellipse(0, 22, 31, 12)
      .fill({ color: COLORS.dark, alpha: 0.4 });

    this.body
      .circle(0, 0, 27)
      .fill(COLORS.primaryBright)
      .circle(-8, -7, 4)
      .fill(COLORS.dark)
      .circle(8, -7, 4)
      .fill(COLORS.dark);

    this.weapon
      .roundRect(14, -5, 50, 10, 4)
      .fill(COLORS.text)
      .roundRect(10, -9, 9, 18, 3)
      .fill(COLORS.warning);

    const initial = sheet?.animations['player.idle.s'];
    if (initial && initial.length > 0) {
      this.sprite = new AnimatedSprite({ textures: initial, animationSpeed: 0.12, loop: true, autoPlay: true });
      this.sprite.anchor.set(0.5, 0.76);
      this.sprite.scale.set(this.spriteBaseScale);
      this.body.visible = false;
      this.weapon.visible = false;
    }

    const equipmentTexture = weaponItemId ? equipmentSheet?.textures[`item.${weaponItemId}`] : undefined;
    if (equipmentTexture) {
      this.equipmentLayer = new Sprite(equipmentTexture);
      this.equipmentLayer.anchor.set(0.5);
      this.equipmentLayer.scale.set(0.34);
      this.equipmentLayer.alpha = 0.88;
    }

    this.root.addChild(shadow, this.body, this.weapon);
    if (this.sprite) this.root.addChild(this.sprite);
    if (this.equipmentLayer && !this.sprite) this.root.addChild(this.equipmentLayer);
  }

  public update(controller: PlayerCombatController, elapsed: number, flashRemaining: number): void {
    this.root.position.set(controller.position.x, controller.position.y);
    const facingAngle = Math.atan2(controller.facing.y, controller.facing.x);
    this.weapon.rotation = facingAngle;
    if (this.equipmentLayer) {
      this.equipmentLayer.rotation = facingAngle + Math.PI / 4;
      this.equipmentLayer.position.set(controller.facing.x * 20, controller.facing.y * 15 - 4);
    }
    this.body.alpha = flashRemaining > 0 ? 0.45 : 1;
    if (this.sprite) {
      this.updateAnimation(controller);
      const direction = directionFromVector(controller.facing);
      const mirrored = direction === 'w' || direction === 'sw' || direction === 'nw';
      this.sprite.scale.set(mirrored ? -this.spriteBaseScale : this.spriteBaseScale, this.spriteBaseScale);
      this.sprite.alpha = flashRemaining > 0 ? 0.42 : 1;
    }
    this.root.alpha = controller.isInvulnerable && Math.floor(elapsed * 26) % 2 === 0 ? 0.45 : 1;
    this.root.scale.set(scaleForPlayerState(controller.state));
  }

  private updateAnimation(controller: PlayerCombatController): void {
    const sprite = this.sprite;
    const sheet = this.sheet;
    if (!sprite || !sheet) return;
    const state = playerAnimationState(controller);
    const direction = directionFromVector(controller.facing);
    const key = `player.${state}.${direction}`;
    if (key === this.animationKey) return;
    const textures = sheet.animations[key] as Texture[] | undefined;
    if (!textures || textures.length === 0) return;
    this.animationKey = key;
    sprite.textures = textures;
    sprite.loop = state === 'idle' || state === 'run';
    sprite.animationSpeed = state === 'run' ? 0.2 : state.startsWith('attack') ? 0.28 : 0.17;
    sprite.gotoAndPlay(0);
  }
}

export class MonsterActorView {
  public readonly root = new Container();
  private readonly body = new Graphics();
  private readonly hpBar = new Graphics();
  private readonly telegraph = new Graphics();
  private readonly phaseAura = new Graphics();
  private readonly sprite?: AnimatedSprite;
  private readonly spriteBaseScale: number;
  private previousX?: number;
  private animationKey = '';
  private readonly statusText = new Text({
    text: '',
    style: new TextStyle({ fill: COLORS.text, fontSize: 12, fontWeight: '700' }),
  });

  public constructor(
    private readonly definition: MonsterDefinition,
    private readonly quality: GraphicsQualityPreset,
    private readonly sheet?: Spritesheet,
  ) {
    const { combat, visual } = definition;
    this.spriteBaseScale = combat.rank === 'boss' ? 1.22 : combat.rank === 'elite' ? 0.92 : 0.78;
    const shadow = new Graphics()
      .ellipse(0, combat.radius * 0.75, combat.radius * 1.05, combat.radius * 0.38)
      .fill({ color: COLORS.dark, alpha: 0.38 });

    this.body
      .circle(0, 0, combat.radius)
      .fill(visual.bodyColor)
      .circle(-combat.radius * 0.32, -6, 4)
      .fill(visual.eyeColor)
      .circle(combat.radius * 0.32, -6, 4)
      .fill(visual.eyeColor);

    if (combat.rank !== 'normal') {
      this.body
        .circle(0, 0, combat.radius + 6)
        .stroke({ color: visual.accentColor, alpha: combat.rank === 'boss' ? 0.9 : 0.65, width: combat.rank === 'boss' ? 5 : 3 });
    }

    const initial = sheet?.animations[`monster.${combat.id}.idle`]
      ?? sheet?.animations[`monster.${combat.rank}.idle`];
    if (initial && initial.length > 0) {
      this.sprite = new AnimatedSprite({ textures: initial, animationSpeed: 0.1, loop: true, autoPlay: true });
      this.sprite.anchor.set(0.5, 0.82);
      this.sprite.scale.set(this.spriteBaseScale);
      this.body.visible = false;
    }

    this.statusText.anchor.set(0.5, 1);
    this.statusText.position.set(0, -combat.radius - 24);
    this.root.addChild(this.phaseAura, this.telegraph, shadow, this.body);
    if (this.sprite) this.root.addChild(this.sprite);
    this.root.addChild(this.hpBar, this.statusText);
  }

  public update(
    controller: MonsterController,
    deltaSeconds: number,
    flashRemaining: number,
    deathElapsed: number,
  ): void {
    const { combat } = this.definition;
    const deltaX = this.previousX === undefined ? 0 : controller.position.x - this.previousX;
    this.previousX = controller.position.x;
    this.root.position.set(controller.position.x, controller.position.y);
    this.body.alpha = flashRemaining > 0 ? 0.38 : 1;
    if (this.sprite) {
      this.updateAnimation(controller.state);
      const facingScale = deltaX < -0.08 ? -this.spriteBaseScale : this.spriteBaseScale;
      this.sprite.scale.set(facingScale, this.spriteBaseScale);
      this.sprite.alpha = flashRemaining > 0 ? 0.4 : 1;
    }
    this.root.scale.set(scaleForMonsterState(controller.state));
    this.drawHp(controller);
    this.drawTelegraph(controller.telegraph);
    this.drawStatuses(controller.statuses.activeIds);
    this.drawPhaseAura(controller);

    if (!controller.isAlive) {
      const alpha = Math.max(0, 1 - deathElapsed / 0.38);
      this.root.alpha = alpha;
      if (deathElapsed >= 0.38) this.root.visible = false;
    } else {
      this.root.visible = true;
      this.root.alpha = 1;
    }

    if (controller.state === 'telegraph' && this.quality.effectDensity > 0.6) {
      this.phaseAura.alpha = 0.65 + Math.sin(performance.now() * 0.012) * 0.2;
    } else {
      this.phaseAura.alpha = 1;
    }
  }


  private drawPhaseAura(controller: MonsterController): void {
    this.phaseAura.clear();
    if (this.definition.combat.rank !== 'boss' || controller.phase <= 1 || !controller.isAlive) return;
    const radius = this.definition.combat.radius + 10 + controller.phase * 3;
    const color = controller.phase >= 3 ? 0xff6f86 : this.definition.visual.accentColor;
    this.phaseAura
      .circle(0, 0, radius)
      .stroke({ color, alpha: 0.42 + controller.phase * 0.08, width: 3 + controller.phase })
      .circle(0, 0, radius + 9)
      .stroke({ color, alpha: 0.16, width: 2 });
  }

  private updateAnimation(state: MonsterState): void {
    const sprite = this.sprite;
    const sheet = this.sheet;
    if (!sprite || !sheet) return;
    const mapped = monsterAnimationState(state);
    const preferredKey = `monster.${this.definition.combat.id}.${mapped}`;
    const fallbackKey = `monster.${this.definition.combat.rank}.${mapped}`;
    const textures = (sheet.animations[preferredKey] ?? sheet.animations[fallbackKey]) as Texture[] | undefined;
    const key = sheet.animations[preferredKey] ? preferredKey : fallbackKey;
    if (key === this.animationKey) return;
    if (!textures || textures.length === 0) return;
    this.animationKey = key;
    sprite.textures = textures;
    sprite.loop = mapped === 'idle' || mapped === 'move';
    sprite.animationSpeed = mapped === 'move' ? 0.18 : 0.14;
    sprite.gotoAndPlay(0);
  }

  private drawHp(controller: MonsterController): void {
    const { combat, visual } = this.definition;
    const width = combat.radius * (combat.rank === 'boss' ? 2.8 : 2.2);
    const hpRatio = controller.hp / combat.maxHp;
    this.hpBar.clear()
      .roundRect(-width / 2, -combat.radius - 18, width, 7, 4)
      .fill(COLORS.panelStrong)
      .roundRect(-width / 2, -combat.radius - 18, width * Math.max(0, hpRatio), 7, 4)
      .fill(visual.accentColor);
  }

  private drawTelegraph(value: MonsterTelegraph | undefined): void {
    this.telegraph.clear();
    this.telegraph.position.set(0, 0);
    this.telegraph.rotation = 0;
    if (!value) return;
    const alpha = 0.18 + value.progress * 0.42;
    const color = value.pattern.effectColor;
    const localOrigin = {
      x: value.origin.x - this.root.x,
      y: value.origin.y - this.root.y,
    };

    if (value.pattern.shape === 'circle') {
      this.telegraph
        .circle(localOrigin.x, localOrigin.y, value.pattern.range)
        .fill({ color, alpha: alpha * 0.23 })
        .circle(localOrigin.x, localOrigin.y, value.pattern.range)
        .stroke({ color, alpha, width: 4 + value.progress * 5 });
      return;
    }

    this.telegraph.position.set(localOrigin.x, localOrigin.y);
    this.telegraph.rotation = Math.atan2(value.facing.y, value.facing.x);
    this.telegraph
      .ellipse(value.pattern.range * 0.5, 0, value.pattern.range * 0.58, value.pattern.range * 0.25)
      .fill({ color, alpha: alpha * 0.2 })
      .ellipse(value.pattern.range * 0.5, 0, value.pattern.range * 0.62, value.pattern.range * 0.29)
      .stroke({ color, alpha, width: 4 + value.progress * 4 });
  }

  private drawStatuses(statuses: readonly StatusEffectId[]): void {
    if (!this.quality.showStatusLabels || statuses.length === 0) {
      this.statusText.text = '';
      return;
    }
    this.statusText.text = statuses.map((status) => status === 'burn' ? '화상' : '둔화').join(' · ');
  }
}

export function createArenaDecorations(count: number, seed = 19): Graphics {
  const graphics = new Graphics();
  let value = seed;
  for (let index = 0; index < count; index += 1) {
    value = (value * 48271) % 2147483647;
    const x = 40 + (value % 460);
    value = (value * 48271) % 2147483647;
    const y = 150 + (value % 590);
    value = (value * 48271) % 2147483647;
    const radius = 18 + (value % 44);
    graphics.circle(x, y, radius).fill({
      color: index % 2 === 0 ? COLORS.primary : COLORS.accent,
      alpha: 0.025 + (index % 3) * 0.012,
    });
  }
  return graphics;
}

export function createAttackIndicator(
  shape: 'arc' | 'circle',
  origin: Vec2,
  facing: Vec2,
  range: number,
  color: number,
): Graphics {
  const effect = new Graphics();
  if (shape === 'circle') {
    effect
      .circle(0, 0, range * 0.62)
      .fill({ color, alpha: 0.12 })
      .circle(0, 0, range * 0.78)
      .stroke({ color, alpha: 0.86, width: 8 });
    effect.position.set(origin.x, origin.y);
    return effect;
  }

  const centerX = origin.x + facing.x * range * 0.48;
  const centerY = origin.y + facing.y * range * 0.48;
  effect
    .ellipse(0, 0, range * 0.56, range * 0.22)
    .fill({ color, alpha: 0.18 })
    .ellipse(0, 0, range * 0.62, range * 0.28)
    .stroke({ color, alpha: 0.9, width: 7 });
  effect.position.set(centerX, centerY);
  effect.rotation = Math.atan2(facing.y, facing.x);
  return effect;
}

function playerAnimationState(controller: PlayerCombatController): string {
  if (controller.state === 'moving') return 'run';
  if (controller.state === 'dodging') return 'dodge';
  if (controller.state === 'hit') return 'hit';
  if (controller.state === 'dead') return 'death';
  if (controller.state === 'skill') return controller.activeAction?.kind === 'skill2' ? 'skill2' : 'skill1';
  if (controller.state === 'attacking') {
    const id = controller.activeAction?.id;
    if (id === 'basic_02') return 'attack2';
    if (id === 'basic_03') return 'attack3';
    return 'attack1';
  }
  return 'idle';
}

function monsterAnimationState(state: MonsterState): string {
  if (state === 'chase') return 'move';
  if (state === 'telegraph') return 'roar';
  if (state === 'attack') return 'attack';
  if (state === 'hit') return 'hit';
  if (state === 'dead') return 'die';
  return 'idle';
}

function scaleForPlayerState(state: PlayerState): number {
  if (state === 'dodging') return 0.88;
  if (state === 'attacking' || state === 'skill') return 1.05;
  if (state === 'hit') return 0.94;
  return 1;
}

function scaleForMonsterState(state: MonsterState): number {
  if (state === 'telegraph') return 1.08;
  if (state === 'attack') return 1.12;
  if (state === 'hit') return 0.92;
  return 1;
}
