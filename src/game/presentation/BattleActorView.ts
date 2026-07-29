import { AnimatedSprite, Container, Graphics, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import { COLORS } from '../../app/constants';
import type { GraphicsQualityPreset } from '../../core/graphics/GraphicsQualityController';
import type { MonsterDefinition, StatusEffectId } from '../combat/combatData';
import type { MonsterController, MonsterState, MonsterTelegraph } from '../actors/monsters/MonsterController';
import type { PlayerCombatController, PlayerState } from '../actors/player/PlayerCombatController';
import type { Vec2 } from '../combat/geometry';
import { buildArcPolygon, createAttackFootprint, telegraphProgress } from '../combat/attackFootprint';
import { resolveBossPhasePresentation } from './BossPhaseDirector';
import { resolveBossTelegraphStyle } from './BossTelegraphLanguage';
import { directionFromVector } from './direction';
import { resolvePlayerMotion } from './PlayerMotionDirector';

export interface PlayerActorViewOptions {
  readonly mirrorWest?: boolean;
  readonly spriteBaseScale?: number;
}

export interface PlayerPresentationFrame {
  readonly deltaSeconds: number;
  readonly driveRatio: number;
  readonly overdrive: boolean;
  readonly reducedMotion: boolean;
  readonly renderIntensity: number;
}

export class PlayerActorView {
  public readonly root = new Container();
  private readonly body = new Graphics();
  private readonly weapon = new Graphics();
  private readonly shadow = new Graphics();
  private readonly silhouetteGlow = new Graphics();
  private readonly focusHalo = new Graphics();
  private readonly riftAura = new Graphics();
  private readonly motionAccent = new Graphics();
  private readonly sprite?: AnimatedSprite;
  private readonly equipmentLayer?: Sprite;
  private readonly afterimages: Sprite[] = [];
  private readonly spriteBaseScale: number;
  private readonly mirrorWest: boolean;
  private animationKey = '';
  private afterimageElapsed = 0;
  private afterimageCursor = 0;
  private previousPosition?: Vec2;

  public constructor(
    private readonly sheet?: Spritesheet,
    equipmentSheet?: Spritesheet,
    weaponItemId?: string,
    options: PlayerActorViewOptions = {},
  ) {
    this.spriteBaseScale = options.spriteBaseScale ?? 1.05;
    this.mirrorWest = options.mirrorWest ?? true;
    this.shadow
      .ellipse(0, 22, 31, 12)
      .fill({ color: COLORS.dark, alpha: 0.42 });

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
    const initialTexture = initial?.[0];
    if (initial && initialTexture) {
      this.sprite = new AnimatedSprite({ textures: initial, animationSpeed: 0.12, loop: true, autoPlay: true });
      this.sprite.anchor.set(0.5, 0.76);
      this.sprite.scale.set(this.spriteBaseScale);
      this.body.visible = false;
      this.weapon.visible = false;
      for (let index = 0; index < 4; index += 1) {
        const afterimage = new Sprite(initialTexture);
        afterimage.anchor.set(0.5, 0.76);
        afterimage.visible = false;
        afterimage.tint = index % 2 === 0 ? 0x67f5df : 0xa79cff;
        this.afterimages.push(afterimage);
      }
    }

    const equipmentTexture = weaponItemId ? equipmentSheet?.textures[`item.${weaponItemId}`] : undefined;
    if (equipmentTexture) {
      this.equipmentLayer = new Sprite(equipmentTexture);
      this.equipmentLayer.anchor.set(0.5);
      this.equipmentLayer.scale.set(0.34);
      this.equipmentLayer.alpha = 0.88;
    }

    this.root.addChild(this.focusHalo, this.riftAura, ...this.afterimages, this.shadow, this.silhouetteGlow, this.body, this.weapon);
    if (this.sprite) this.root.addChild(this.sprite);
    if (this.equipmentLayer && !this.sprite) this.root.addChild(this.equipmentLayer);
    this.root.addChild(this.motionAccent);
  }

  public update(
    controller: PlayerCombatController,
    elapsed: number,
    flashRemaining: number,
    frame: PlayerPresentationFrame = {
      deltaSeconds: 1 / 60,
      driveRatio: 0,
      overdrive: false,
      reducedMotion: false,
      renderIntensity: 1,
    },
  ): void {
    const previous = this.previousPosition;
    const worldShift = previous
      ? { x: previous.x - controller.position.x, y: previous.y - controller.position.y }
      : { x: 0, y: 0 };
    this.previousPosition = { ...controller.position };
    for (const afterimage of this.afterimages) {
      if (!afterimage.visible) continue;
      afterimage.position.x += worldShift.x;
      afterimage.position.y += worldShift.y;
      afterimage.alpha = Math.max(0, afterimage.alpha - frame.deltaSeconds * 3.7);
      if (afterimage.alpha <= 0.01) afterimage.visible = false;
    }

    this.root.position.set(controller.position.x, controller.position.y);
    const facingAngle = Math.atan2(controller.facing.y, controller.facing.x);
    this.weapon.rotation = facingAngle;
    if (this.equipmentLayer) {
      this.equipmentLayer.rotation = facingAngle + Math.PI / 4;
      this.equipmentLayer.position.set(controller.facing.x * 20, controller.facing.y * 15 - 4);
    }

    const motion = resolvePlayerMotion({
      state: controller.state,
      progress: controller.stateProgress,
      comboStep: controller.comboStep,
      driveRatio: frame.driveRatio,
      overdrive: frame.overdrive,
      reducedMotion: frame.reducedMotion,
      renderIntensity: frame.renderIntensity,
    });
    this.drawCharacterPolish(controller, motion.scaleX, motion.scaleY, frame.overdrive, flashRemaining);
    this.drawMotionLayers(controller, motion.auraAlpha, motion.auraRadius, motion.trailAlpha, motion.trailLength, frame.overdrive);
    this.body.alpha = flashRemaining > 0 ? 0.45 : 1;

    if (this.sprite) {
      this.updateAnimation(controller, motion.animationSpeed);
      const direction = directionFromVector(controller.facing);
      const mirrored = this.mirrorWest && (direction === 'w' || direction === 'sw' || direction === 'nw');
      this.sprite.scale.set(mirrored ? -this.spriteBaseScale : this.spriteBaseScale, this.spriteBaseScale);
      this.sprite.position.y = motion.offsetY;
      this.sprite.rotation = motion.rotation;
      this.sprite.tint = frame.overdrive ? 0xfff5c8 : 0xffffff;
      this.sprite.alpha = flashRemaining > 0 ? 0.42 : 1;
      this.updateAfterimages(controller, frame.deltaSeconds, motion.afterimageInterval, motion.afterimageAlpha);
    }

    this.root.alpha = controller.isInvulnerable && Math.floor(elapsed * 26) % 2 === 0 ? 0.45 : 1;
    const stateScale = scaleForPlayerState(controller.state);
    this.root.scale.set(stateScale * motion.scaleX, stateScale * motion.scaleY);
  }

  private updateAnimation(controller: PlayerCombatController, animationSpeed: number): void {
    const sprite = this.sprite;
    const sheet = this.sheet;
    if (!sprite || !sheet) return;
    const state = playerAnimationState(controller);
    const direction = directionFromVector(controller.facing);
    const key = `player.${state}.${direction}`;
    if (key !== this.animationKey) {
      const textures = sheet.animations[key] as Texture[] | undefined;
      if (!textures || textures.length === 0) return;
      this.animationKey = key;
      sprite.textures = textures;
      sprite.loop = state === 'idle' || state === 'run';
      sprite.gotoAndPlay(0);
    }
    sprite.animationSpeed = animationSpeed;
  }

  private updateAfterimages(
    controller: PlayerCombatController,
    deltaSeconds: number,
    interval: number,
    alpha: number,
  ): void {
    const sprite = this.sprite;
    if (!sprite || alpha <= 0 || (controller.state !== 'dodging' && controller.state !== 'skill')) {
      this.afterimageElapsed = 0;
      return;
    }
    this.afterimageElapsed += Math.max(0, deltaSeconds);
    if (this.afterimageElapsed < interval) return;
    this.afterimageElapsed = 0;
    const afterimage = this.afterimages[this.afterimageCursor % this.afterimages.length];
    this.afterimageCursor += 1;
    if (!afterimage) return;
    afterimage.texture = sprite.texture;
    afterimage.position.set(0, sprite.position.y);
    afterimage.rotation = sprite.rotation;
    afterimage.scale.set(sprite.scale.x, sprite.scale.y);
    afterimage.alpha = alpha;
    afterimage.visible = true;
  }

  private drawCharacterPolish(
    controller: PlayerCombatController,
    scaleX: number,
    scaleY: number,
    overdrive: boolean,
    flashRemaining: number,
  ): void {
    const feetY = 16 + (controller.state === 'moving' ? 1.5 : 0);
    const shadowWidth = 30 + Math.abs(controller.facing.x) * 5 + (controller.state === 'dodging' ? 6 : 0);
    const shadowHeight = 11 + Math.abs(controller.facing.y) * 2;
    this.shadow.clear();
    this.shadow
      .ellipse(0, feetY + 6, shadowWidth * scaleX, shadowHeight * scaleY)
      .fill({ color: COLORS.dark, alpha: overdrive ? 0.5 : 0.4 });

    const glowColor = overdrive ? 0xffd78d : controller.state === 'skill' ? COLORS.accent : COLORS.primaryBright;
    this.silhouetteGlow.clear();
    this.silhouetteGlow
      .ellipse(0, -4, 26 * scaleX, 38 * scaleY)
      .fill({ color: glowColor, alpha: flashRemaining > 0 ? 0.08 : overdrive ? 0.1 : 0.06 })
      .ellipse(controller.facing.x * 8, -18 + controller.facing.y * 3, 12 * scaleX, 17 * scaleY)
      .fill({ color: 0xffffff, alpha: flashRemaining > 0 ? 0.03 : 0.022 });

    this.focusHalo.clear();
    this.focusHalo
      .ellipse(0, 17, 40 * scaleX, 14 * scaleY)
      .stroke({ color: glowColor, alpha: overdrive ? 0.36 : 0.22, width: overdrive ? 3 : 2 })
      .ellipse(0, 17, 28 * scaleX, 9 * scaleY)
      .stroke({ color: 0xffffff, alpha: overdrive ? 0.18 : 0.1, width: 1 });
  }

  private drawMotionLayers(
    controller: PlayerCombatController,
    auraAlpha: number,
    auraRadius: number,
    trailAlpha: number,
    trailLength: number,
    overdrive: boolean,
  ): void {
    const facing = controller.facing;
    const color = overdrive ? 0xffd36a : controller.state === 'skill' ? 0xa88cff : 0x63e8d7;
    this.riftAura.clear();
    if (auraAlpha > 0.01) {
      this.riftAura
        .ellipse(0, 13, auraRadius * 1.05, auraRadius * 0.46)
        .fill({ color, alpha: auraAlpha * 0.38 })
        .ellipse(0, 13, auraRadius, auraRadius * 0.42)
        .stroke({ color, alpha: auraAlpha, width: overdrive ? 4 : 2 });
    }

    this.motionAccent.clear();
    if (trailAlpha <= 0.01) return;
    const perpendicular = { x: -facing.y, y: facing.x };
    for (let index = -1; index <= 1; index += 1) {
      const offset = index * 8;
      this.motionAccent
        .moveTo(perpendicular.x * offset - facing.x * 8, perpendicular.y * offset - facing.y * 8)
        .lineTo(perpendicular.x * offset - facing.x * trailLength, perpendicular.y * offset - facing.y * trailLength)
        .stroke({ color: index === 0 ? 0xffffff : color, alpha: trailAlpha * (index === 0 ? 0.72 : 0.42), width: index === 0 ? 3 : 5 });
    }
  }
}

export class MonsterActorView {
  public readonly root = new Container();
  private readonly body = new Graphics();
  private readonly hpBar = new Graphics();
  private readonly telegraph = new Graphics();
  private readonly phaseAura = new Graphics();
  private readonly telegraphText = new Text({
    text: '',
    style: new TextStyle({ fill: 0xffffff, fontSize: 12, fontWeight: '800', align: 'center', dropShadow: { color: 0x120b20, alpha: 0.9, blur: 3, distance: 1 } }),
  });
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
    this.telegraphText.anchor.set(0.5, 1);
    this.telegraphText.visible = false;
    this.root.addChild(this.phaseAura, this.telegraph, shadow, this.body);
    if (this.sprite) this.root.addChild(this.sprite);
    this.root.addChild(this.hpBar, this.statusText, this.telegraphText);
  }

  public update(
    controller: MonsterController,
    _deltaSeconds: number,
    flashRemaining: number,
    deathElapsed: number,
  ): void {
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
    const stateScale = scaleForMonsterState(controller.state);
    const phaseScale = this.definition.combat.rank === 'boss'
      ? resolveBossPhasePresentation(controller.phase).bodyScale
      : 1;
    this.root.scale.set(stateScale * phaseScale);
    this.drawHp(controller);
    this.drawTelegraph(controller);
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
    if (this.definition.combat.rank !== 'boss' || !controller.isAlive) return;
    const profile = resolveBossPhasePresentation(controller.phase);
    const baseRadius = this.definition.combat.radius + 10;
    const pulse = 0.5 + Math.sin(performance.now() * (0.006 + controller.phase * 0.0015)) * 0.5;

    for (let ring = 0; ring < profile.auraRings; ring += 1) {
      const radius = baseRadius + ring * 10 + pulse * (2 + ring);
      this.phaseAura
        .circle(0, 0, radius)
        .stroke({
          color: ring % 2 === 0 ? profile.accentColor : profile.secondaryColor,
          alpha: 0.22 + controller.phase * 0.08 - ring * 0.035,
          width: 2 + controller.phase * 0.8,
        });
    }

    if (controller.phase >= 2) {
      const shardCount = controller.phase === 3 ? 8 : 5;
      for (let index = 0; index < shardCount; index += 1) {
        const angle = performance.now() * 0.00055 * controller.phase + (Math.PI * 2 * index) / shardCount;
        const inner = baseRadius + 14;
        const outer = inner + 8 + controller.phase * 3;
        this.phaseAura
          .moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
          .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
          .stroke({ color: profile.secondaryColor, alpha: 0.42, width: 3 });
      }
    }
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

  private drawTelegraph(controller: MonsterController): void {
    const value: MonsterTelegraph | undefined = controller.telegraph;
    this.telegraph.clear();
    this.telegraph.position.set(0, 0);
    this.telegraph.rotation = 0;
    this.telegraphText.visible = false;
    if (!value) return;

    const progress = telegraphProgress(value.progress);
    const phaseIntensity = this.definition.combat.rank === 'boss'
      ? resolveBossPhasePresentation(controller.phase).telegraphIntensity
      : 1;
    const style = resolveBossTelegraphStyle(value.pattern, progress, controller.phase, this.definition.combat.rank);
    const alpha = Math.min(1, (0.2 + progress * 0.56) * phaseIntensity);
    const color = value.pattern.effectColor;
    const footprint = createAttackFootprint(
      value.pattern.shape,
      value.origin,
      value.facing,
      value.pattern.range,
      value.pattern.halfAngleRadians,
    );
    const localOrigin = {
      x: footprint.origin.x - this.root.x,
      y: footprint.origin.y - this.root.y,
    };

    this.telegraphText.text = style.label;
    this.telegraphText.style.fill = style.urgency === 'critical' ? 0xffffff : color;
    this.telegraphText.position.set(localOrigin.x, localOrigin.y - footprint.range - 12);
    this.telegraphText.visible = this.definition.combat.rank !== 'normal' || progress >= 0.48;
    this.telegraphText.alpha = 0.7 + progress * 0.3;

    if (footprint.shape === 'circle') {
      const radius = footprint.range * style.pulseScale;
      this.telegraph
        .circle(localOrigin.x, localOrigin.y, radius)
        .fill({ color, alpha: style.fillAlpha * phaseIntensity })
        .circle(localOrigin.x, localOrigin.y, radius)
        .stroke({ color, alpha, width: style.lineWidth });
      const tickCount = Math.max(8, Math.round(style.tickCount * Math.max(0.6, this.quality.effectDensity)));
      for (let index = 0; index < tickCount; index += 1) {
        const angle = (Math.PI * 2 * index) / tickCount;
        const inner = radius * (0.84 + progress * 0.05);
        const outer = radius * (0.96 + (index % 2) * 0.04);
        this.telegraph
          .moveTo(localOrigin.x + Math.cos(angle) * inner, localOrigin.y + Math.sin(angle) * inner)
          .lineTo(localOrigin.x + Math.cos(angle) * outer, localOrigin.y + Math.sin(angle) * outer)
          .stroke({ color: index % 2 === 0 ? color : 0xffffff, alpha: 0.34 + progress * 0.52, width: index % 2 === 0 ? 3 : 1.5 });
      }
      if (style.whiteFlashAlpha > 0) {
        this.telegraph.circle(localOrigin.x, localOrigin.y, radius * (0.92 + progress * 0.05))
          .stroke({ color: 0xffffff, alpha: style.whiteFlashAlpha * 0.92, width: 3 });
      }
      return;
    }

    const polygon = buildArcPolygon(footprint, Math.max(18, style.tickCount));
    const first = polygon[0];
    if (!first) return;
    this.telegraph.moveTo(first.x - this.root.x, first.y - this.root.y);
    for (const point of polygon.slice(1)) this.telegraph.lineTo(point.x - this.root.x, point.y - this.root.y);
    this.telegraph
      .fill({ color, alpha: style.fillAlpha * phaseIntensity })
      .stroke({ color, alpha, width: style.lineWidth });

    const directionAngle = Math.atan2(value.facing.y, value.facing.x);
    const startAngle = directionAngle - value.pattern.halfAngleRadians;
    const tickCount = Math.max(6, Math.floor(style.tickCount * 0.72));
    for (let index = 0; index <= tickCount; index += 1) {
      const t = index / tickCount;
      const angle = startAngle + value.pattern.halfAngleRadians * 2 * t;
      const inner = footprint.range * (0.7 + progress * 0.12);
      const outer = footprint.range * (0.91 + (index % 2) * 0.06);
      this.telegraph
        .moveTo(localOrigin.x + Math.cos(angle) * inner, localOrigin.y + Math.sin(angle) * inner)
        .lineTo(localOrigin.x + Math.cos(angle) * outer, localOrigin.y + Math.sin(angle) * outer)
        .stroke({ color: index % 2 === 0 ? color : 0xffffff, alpha: 0.28 + progress * 0.56, width: index % 2 === 0 ? 3 : 1.5 });
    }
    if (style.whiteFlashAlpha > 0) {
      this.telegraph
        .moveTo(localOrigin.x, localOrigin.y)
        .lineTo(localOrigin.x + value.facing.x * footprint.range, localOrigin.y + value.facing.y * footprint.range)
        .stroke({ color: 0xffffff, alpha: style.whiteFlashAlpha, width: 4 });
    }
  }

  private drawStatuses(statuses: readonly StatusEffectId[]): void {
    if (!this.quality.showStatusLabels || statuses.length === 0) {
      this.statusText.text = '';
      return;
    }
    this.statusText.text = statuses.map((status) => status === 'burn' ? '화상' : '둔화').join(' · ');
  }
}

export function createArenaDecorations(
  count: number,
  seed = 19,
  primaryColor: number = COLORS.primary,
  secondaryColor: number = COLORS.accent,
): Graphics {
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
      color: index % 2 === 0 ? primaryColor : secondaryColor,
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
