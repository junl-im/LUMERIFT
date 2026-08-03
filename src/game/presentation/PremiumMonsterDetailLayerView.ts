import { Container, Graphics, Sprite, type Spritesheet } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { MonsterRank, MonsterVisualConfig } from '../combat/combatData';
import { resolvePremiumMonsterVariant, type PremiumMonsterVariantProfile } from './PremiumMonsterVariantProfile';
import { resolveBossCorePresentation } from './BossCoreLifecycle';
import { bossCoreFxTexture, monsterPartTextures } from './PremiumPartAtlasV16';

export interface PremiumMonsterDetailPose {
  readonly elapsed: number;
  readonly state: MonsterState;
  readonly phase: number;
  readonly hpRatio: number;
  readonly facingSign: -1 | 1;
  readonly flashRemaining: number;
  readonly alive: boolean;
}

export class PremiumMonsterDetailLayerView {
  public readonly back = new Container();
  public readonly front = new Container();
  private readonly mane = new Graphics();
  private readonly silhouette = new Graphics();
  private readonly tailArc = new Graphics();
  private readonly crown = new Graphics();
  private readonly jaw = new Graphics();
  private readonly coreShield = new Graphics();
  private readonly core = new Graphics();
  private readonly coreCracks = new Graphics();
  private readonly coreFragments = new Graphics();
  private readonly claws = new Graphics();
  private readonly phaseShards = new Graphics();
  private readonly paintedCrest?: Sprite;
  private readonly paintedCore?: Sprite;
  private readonly paintedClaw?: Sprite;
  private readonly paintedMane?: Sprite;
  private readonly paintedTail?: Sprite;
  private readonly paintedAura?: Sprite;
  private readonly paintedOverdrive?: Sprite;
  private readonly paintedCoreFx?: Sprite;
  private readonly profile: PremiumMonsterVariantProfile;
  private readonly coreFxSheet?: Spritesheet;
  private observedPhase = 1;
  private phaseStartedAt = 0;

  public constructor(
    monsterId: string,
    private readonly rank: MonsterRank,
    private readonly radius: number,
    visual: MonsterVisualConfig,
    partsSheet?: Spritesheet,
    coreFxSheet?: Spritesheet,
  ) {
    this.profile = resolvePremiumMonsterVariant(monsterId, rank, visual);
    this.coreFxSheet = coreFxSheet;
    const textures = monsterPartTextures(partsSheet, this.profile.variant);
    this.paintedCrest = createMonsterPartSprite(textures.crest);
    this.paintedCore = createMonsterPartSprite(textures.core, true);
    this.paintedClaw = createMonsterPartSprite(textures.claw);
    this.paintedMane = createMonsterPartSprite(textures.mane);
    this.paintedTail = createMonsterPartSprite(textures.tail);
    this.paintedAura = createMonsterPartSprite(textures.aura, true);
    this.paintedOverdrive = createMonsterPartSprite(textures.overdrive, true);
    this.paintedCoreFx = createMonsterPartSprite(
      bossCoreFxTexture(coreFxSheet, 'shielded', 0),
      true,
    );
    this.drawStatic();
    this.back.addChild(
      ...compactMonsterSprites(this.paintedAura, this.paintedTail, this.paintedMane),
      this.tailArc,
      this.mane,
      this.silhouette,
    );
    this.front.addChild(
      this.crown,
      this.jaw,
      this.coreShield,
      this.core,
      this.coreCracks,
      this.coreFragments,
      this.claws,
      this.phaseShards,
      ...compactMonsterSprites(
        this.paintedCrest,
        this.paintedCore,
        this.paintedClaw,
        this.paintedCoreFx,
        this.paintedOverdrive,
      ),
    );
  }

  public update(pose: PremiumMonsterDetailPose): void {
    const premium = this.rank !== 'normal';
    this.back.visible = premium && pose.alive;
    this.front.visible = premium && pose.alive;
    if (!premium) return;

    const pulse = 0.5 + Math.sin(pose.elapsed * (this.rank === 'boss' ? 4.2 : 3.2)) * 0.5;
    const telegraph = pose.state === 'telegraph' ? 1 : 0;
    const attack = pose.state === 'attack' ? 1 : 0;
    const phaseStrength = this.rank === 'boss' ? Math.max(1, pose.phase) : 1;
    if (pose.phase !== this.observedPhase) {
      this.observedPhase = pose.phase;
      this.phaseStartedAt = pose.elapsed;
    }
    const corePresentation = resolveBossCorePresentation({
      rank: this.rank,
      phase: pose.phase,
      hpRatio: pose.hpRatio,
      secondsSincePhaseChange: Math.max(0, pose.elapsed - this.phaseStartedAt),
      alive: pose.alive,
    });
    const corePulse = 0.5 + Math.sin(pose.elapsed * corePresentation.pulseRate) * 0.5;
    const flash = pose.flashRemaining > 0 ? 1.35 : 1;
    const weight = this.profile.motionWeight;

    this.crown.scale.set(pose.facingSign, 1 + telegraph * 0.04);
    this.crown.rotation = pose.facingSign * (telegraph * 0.032 - attack * 0.05) * weight;
    this.crown.alpha = Math.min(1, (0.58 + pulse * 0.2 + telegraph * 0.18) * flash);

    this.jaw.scale.set(pose.facingSign, 1);
    this.jaw.rotation = pose.facingSign * (attack * 0.06 + telegraph * 0.02);
    this.jaw.position.y = attack * 2.4;
    this.jaw.alpha = 0.42 + attack * 0.38 + telegraph * 0.12;

    this.core.alpha = Math.min(1, corePresentation.coreAlpha * (0.82 + corePulse * 0.18) * flash);
    this.core.scale.set(corePresentation.scale * (1 + corePulse * 0.055 + (phaseStrength - 1) * 0.025));
    this.core.rotation = pose.elapsed * (this.rank === 'boss' ? 0.38 : 0.2) * pose.facingSign;

    this.coreShield.alpha = corePresentation.shieldAlpha * (0.72 + corePulse * 0.28);
    this.coreShield.scale.set(corePresentation.scale * (1.02 + corePulse * 0.04));
    this.coreShield.rotation = -this.core.rotation * 0.72;

    this.coreCracks.alpha = corePresentation.crackAlpha * flash;
    this.coreCracks.scale.set(corePresentation.scale * (0.98 + corePulse * 0.04));
    this.coreCracks.rotation = this.core.rotation * 0.34;

    this.coreFragments.alpha = corePresentation.fragmentAlpha * (0.72 + corePulse * 0.28);
    this.coreFragments.scale.set(corePresentation.scale * (1 + corePulse * 0.08));
    this.coreFragments.rotation = -pose.elapsed * 0.5 * pose.facingSign;

    this.mane.alpha = 0.25 + pulse * 0.14 + telegraph * 0.18;
    this.mane.scale.set(pose.facingSign, 1 + telegraph * 0.025);
    this.mane.rotation = -pose.facingSign * (attack * 0.025 + Math.sin(pose.elapsed * 2.1) * 0.012);

    this.silhouette.alpha = 0.3 + telegraph * 0.18 + pulse * 0.1;
    this.silhouette.scale.set(pose.facingSign, 1 + attack * 0.04);
    this.silhouette.rotation = -pose.facingSign * attack * 0.03 * weight;

    this.tailArc.scale.set(pose.facingSign, 1);
    this.tailArc.rotation = -pose.facingSign * (0.08 + Math.sin(pose.elapsed * 2.4) * 0.04 + attack * 0.06);
    this.tailArc.alpha = 0.28 + pulse * 0.12 + attack * 0.12;

    this.claws.alpha = 0.38 + attack * 0.4 + telegraph * 0.12;
    this.claws.scale.set(pose.facingSign, 1 + attack * 0.05);
    this.claws.position.x = pose.facingSign * attack * 4 * weight;

    this.phaseShards.visible = this.rank === 'boss' || telegraph > 0;
    this.phaseShards.alpha = this.rank === 'boss'
      ? Math.min(0.9, 0.2 + phaseStrength * 0.17 + pulse * 0.12)
      : telegraph * (0.3 + pulse * 0.2);
    this.phaseShards.rotation = pose.elapsed * (0.08 + phaseStrength * 0.04) * pose.facingSign;
    this.phaseShards.scale.set(1 + (phaseStrength - 1) * 0.08 + telegraph * 0.05);

    this.updatePaintedParts(pose, corePresentation.state, corePulse, telegraph, attack, phaseStrength, flash);
  }

  private updatePaintedParts(
    pose: PremiumMonsterDetailPose,
    coreState: ReturnType<typeof resolveBossCorePresentation>['state'],
    corePulse: number,
    telegraph: number,
    attack: number,
    phaseStrength: number,
    flash: number,
  ): void {
    const baseScale = (this.radius / 52) * (this.rank === 'boss' ? 1.08 : 0.9);
    const facingScale = baseScale * pose.facingSign;
    const configure = (sprite: Sprite | undefined, x: number, y: number, alpha: number, scale = 1): void => {
      if (!sprite) return;
      sprite.position.set(x, y);
      sprite.scale.set(facingScale * scale, baseScale * scale);
      sprite.alpha = Math.max(0, Math.min(1, alpha));
    };

    configure(this.paintedAura, 0, 0, this.rank === 'boss' ? 0.22 + phaseStrength * 0.08 : telegraph * 0.34, 1.16);
    if (this.paintedAura) this.paintedAura.rotation = pose.elapsed * 0.12 * pose.facingSign;
    configure(this.paintedTail, -pose.facingSign * this.radius * 0.22, this.radius * 0.22, 0.5 + attack * 0.16, 1.08);
    if (this.paintedTail) this.paintedTail.rotation = -pose.facingSign * (0.08 + Math.sin(pose.elapsed * 2.2) * 0.035);
    configure(this.paintedMane, 0, -this.radius * 0.2, 0.46 + telegraph * 0.2, 1.04);
    if (this.paintedMane) this.paintedMane.rotation = -pose.facingSign * attack * 0.025;
    configure(this.paintedCrest, 0, -this.radius * 0.62, (0.7 + telegraph * 0.2) * flash, 0.98);
    if (this.paintedCrest) this.paintedCrest.rotation = pose.facingSign * (telegraph * 0.02 - attack * 0.035);
    configure(this.paintedCore, 0, -this.radius * 0.08, Math.min(1, (0.76 + corePulse * 0.2) * flash), 0.72);
    if (this.paintedCore) this.paintedCore.rotation = pose.elapsed * 0.22 * pose.facingSign;
    configure(this.paintedClaw, pose.facingSign * attack * this.radius * 0.08, this.radius * 0.38, 0.62 + attack * 0.28, 0.92);

    if (this.paintedCoreFx) {
      const texture = bossCoreFxTexture(this.coreFxSheet, coreState, pose.elapsed - this.phaseStartedAt);
      if (texture) this.paintedCoreFx.texture = texture;
      configure(
        this.paintedCoreFx,
        0,
        -this.radius * 0.08,
        this.rank === 'boss' ? Math.min(1, 0.5 + corePulse * 0.32) : 0,
        0.78 * (1 + (phaseStrength - 1) * 0.05),
      );
      this.paintedCoreFx.rotation = -pose.elapsed * 0.18 * pose.facingSign;
    }
    configure(this.paintedOverdrive, 0, 0, coreState === 'overdrive' ? 0.58 + corePulse * 0.24 : 0, 1.18);
    if (this.paintedOverdrive) this.paintedOverdrive.rotation = pose.elapsed * 0.18;
  }

  private drawStatic(): void {
    const radius = this.radius;
    const accent = this.profile.secondaryColor;
    const body = this.profile.primaryColor;
    const eye = this.profile.coreColor;
    const bossScale = this.rank === 'boss' ? 1.22 : 1;

    const manePoints = Math.max(3, this.profile.shoulderSpikes);
    for (let index = 0; index < manePoints; index += 1) {
      const t = manePoints <= 1 ? 0.5 : index / (manePoints - 1);
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * radius * (0.48 + t * 0.42);
      const y = -radius * (0.25 + t * 0.42);
      this.mane
        .moveTo(x * 0.66, y + radius * 0.18)
        .lineTo(x, y - radius * (0.28 + t * 0.12))
        .lineTo(x * 0.82, y + radius * 0.06)
        .stroke({ color: index % 2 === 0 ? body : accent, alpha: 0.72, width: this.rank === 'boss' ? 3.2 : 2.4 });
    }

    this.silhouette
      .moveTo(-radius * 0.95, -radius * 0.4)
      .lineTo(-radius * 1.22, -radius * 0.78)
      .lineTo(-radius * 0.72, -radius * 0.68)
      .lineTo(-radius * 0.5, -radius * 1.02)
      .lineTo(-radius * 0.2, -radius * 0.72)
      .stroke({ color: body, alpha: 0.68, width: 3.2 })
      .moveTo(radius * 0.95, -radius * 0.4)
      .lineTo(radius * 1.22, -radius * 0.78)
      .lineTo(radius * 0.72, -radius * 0.68)
      .lineTo(radius * 0.5, -radius * 1.02)
      .lineTo(radius * 0.2, -radius * 0.72)
      .stroke({ color: accent, alpha: 0.68, width: 3.2 });

    this.tailArc
      .moveTo(-radius * 0.4, radius * 0.25)
      .quadraticCurveTo(-radius * 1.1, radius * 0.75, -radius * 1.34, radius * 0.1)
      .quadraticCurveTo(-radius * 1.5, -radius * 0.25, -radius * 1.72, -radius * 0.12)
      .stroke({ color: body, alpha: 0.52, width: this.rank === 'boss' ? 5 : 3.6 })
      .moveTo(-radius * 0.52, radius * 0.18)
      .quadraticCurveTo(-radius * 1.18, radius * 0.58, -radius * 1.52, -radius * 0.1)
      .stroke({ color: accent, alpha: 0.44, width: 1.5 });

    const crownY = -radius * 0.86;
    const crestSpikes = Math.max(3, this.profile.crestSpikes);
    for (let index = 0; index < crestSpikes; index += 1) {
      const centered = index - (crestSpikes - 1) / 2;
      const normalized = crestSpikes <= 1 ? 0 : centered / ((crestSpikes - 1) / 2);
      const baseX = normalized * radius * 0.58;
      const peak = radius * (0.32 + (1 - Math.abs(normalized)) * 0.42) * bossScale;
      this.crown
        .moveTo(baseX - radius * 0.11, crownY)
        .lineTo(baseX, crownY - peak)
        .lineTo(baseX + radius * 0.11, crownY)
        .stroke({ color: index % 2 === 0 ? accent : body, alpha: 0.86, width: this.rank === 'boss' ? 3.2 : 2.5 });
    }
    this.crown
      .moveTo(-radius * 0.48, crownY - radius * 0.04)
      .lineTo(0, crownY - radius * 0.2)
      .lineTo(radius * 0.48, crownY - radius * 0.04)
      .stroke({ color: 0xf3dfb0, alpha: 0.58, width: 1.5 });

    const jawY = radius * 0.04;
    this.jaw
      .moveTo(-radius * 0.34, jawY)
      .quadraticCurveTo(0, jawY + radius * 0.24, radius * 0.34, jawY)
      .stroke({ color: body, alpha: 0.72, width: 2.6 });
    const fangs = Math.max(1, this.profile.jawFangs);
    for (let index = 0; index < fangs; index += 1) {
      const t = fangs <= 1 ? 0.5 : index / (fangs - 1);
      const x = -radius * 0.25 + t * radius * 0.5;
      this.jaw
        .moveTo(x, jawY + radius * 0.05)
        .lineTo(x + (index % 2 === 0 ? -1 : 1) * radius * 0.05, jawY + radius * 0.2)
        .stroke({ color: 0xffffff, alpha: 0.62, width: 1.5 });
    }

    const coreY = -radius * 0.12;
    const coreRadius = radius * (this.rank === 'boss' ? 0.25 : 0.2);
    this.core
      .circle(0, coreY, coreRadius)
      .fill({ color: accent, alpha: 0.22 })
      .stroke({ color: accent, alpha: 0.94, width: this.rank === 'boss' ? 3.2 : 2.2 })
      .circle(0, coreY, coreRadius * 0.46)
      .fill({ color: eye, alpha: 0.82 })
      .moveTo(0, coreY - coreRadius * 1.65)
      .lineTo(coreRadius * 0.68, coreY - coreRadius * 0.58)
      .lineTo(coreRadius * 1.55, coreY)
      .lineTo(coreRadius * 0.68, coreY + coreRadius * 0.58)
      .lineTo(0, coreY + coreRadius * 1.65)
      .lineTo(-coreRadius * 0.68, coreY + coreRadius * 0.58)
      .lineTo(-coreRadius * 1.55, coreY)
      .lineTo(-coreRadius * 0.68, coreY - coreRadius * 0.58)
      .closePath()
      .stroke({ color: 0xffffff, alpha: 0.38, width: 1.25 });

    this.coreShield
      .circle(0, coreY, coreRadius * 1.58)
      .stroke({ color: 0xf3dfb0, alpha: 0.72, width: 1.8 })
      .circle(0, coreY, coreRadius * 1.28)
      .stroke({ color: accent, alpha: 0.7, width: 1.4 });
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI * 2 * index) / 6;
      const inner = coreRadius * 1.28;
      const outer = coreRadius * 1.58;
      this.coreShield
        .moveTo(Math.cos(angle) * inner, coreY + Math.sin(angle) * inner)
        .lineTo(Math.cos(angle) * outer, coreY + Math.sin(angle) * outer)
        .stroke({ color: index % 2 === 0 ? accent : 0xf3dfb0, alpha: 0.58, width: 1.2 });
    }

    const crackAngles = [-2.45, -1.6, -0.52, 0.45, 1.42, 2.5];
    for (const angle of crackAngles) {
      const mid = coreRadius * 0.56;
      const outer = coreRadius * 1.36;
      this.coreCracks
        .moveTo(Math.cos(angle) * mid, coreY + Math.sin(angle) * mid)
        .lineTo(Math.cos(angle + 0.12) * outer * 0.76, coreY + Math.sin(angle + 0.12) * outer * 0.76)
        .lineTo(Math.cos(angle - 0.06) * outer, coreY + Math.sin(angle - 0.06) * outer)
        .stroke({ color: 0xffffff, alpha: 0.78, width: 1.35 });
    }

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const inner = coreRadius * 1.54;
      const outer = coreRadius * (1.9 + (index % 2) * 0.24);
      const x1 = Math.cos(angle) * inner;
      const y1 = coreY + Math.sin(angle) * inner;
      const x2 = Math.cos(angle) * outer;
      const y2 = coreY + Math.sin(angle) * outer;
      this.coreFragments
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineTo(Math.cos(angle + 0.13) * (inner + coreRadius * 0.18), coreY + Math.sin(angle + 0.13) * (inner + coreRadius * 0.18))
        .closePath()
        .fill({ color: index % 2 === 0 ? accent : eye, alpha: 0.5 })
        .stroke({ color: 0xffffff, alpha: 0.34, width: 0.8 });
    }

    const clawY = radius * 0.52;
    for (const side of [-1, 1] as const) {
      const x = side * radius * 0.62;
      this.claws
        .moveTo(x, clawY)
        .lineTo(x + side * radius * 0.36, clawY + radius * 0.24)
        .lineTo(x + side * radius * 0.14, clawY + radius * 0.08)
        .stroke({ color: side < 0 ? body : accent, alpha: 0.78, width: 2.4 });
    }

    const shardCount = Math.max(4, this.profile.phaseShards);
    for (let index = 0; index < shardCount; index += 1) {
      const angle = (Math.PI * 2 * index) / shardCount;
      const inner = radius * 1.05;
      const outer = radius * (1.23 + (index % 2) * 0.12);
      this.phaseShards
        .moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
        .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
        .stroke({ color: index % 2 === 0 ? accent : 0xf3dfb0, alpha: 0.54, width: index % 2 === 0 ? 2.8 : 1.6 });
    }
  }
}

function createMonsterPartSprite(texture: import('pixi.js').Texture | undefined, additive = false): Sprite | undefined {
  if (!texture) return undefined;
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  if (additive) sprite.blendMode = 'add';
  return sprite;
}

function compactMonsterSprites(...sprites: Array<Sprite | undefined>): Sprite[] {
  return sprites.filter((sprite): sprite is Sprite => sprite !== undefined);
}
