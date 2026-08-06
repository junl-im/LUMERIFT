import { Container, Graphics, Sprite, type Spritesheet } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { MonsterRank, MonsterVisualConfig } from '../combat/combatData';
import { resolvePremiumMonsterVariant, type PremiumMonsterVariantProfile } from './PremiumMonsterVariantProfile';
import { resolveBossCorePresentation } from './BossCoreLifecycle';
import { bossCoreFxTexture, monsterPartTextures } from './PremiumPartAtlasV16';
import { bossCoreFxTextureV17 } from './BossCoreFxV17';
import { bossCoreFxTextureV18 } from './BossCoreFxV18';
import { bossCoreTrailTextureV19 } from './BossCoreTrailsV19';
import { monsterBodyTexturesV17 } from './PremiumMonsterBodyAtlasV17';
import { premiumMonsterMotionTextureV18 } from './PremiumMonsterMotionAtlasV18';
import { premiumMonsterDirectionTextureV19 } from './PremiumMonsterDirectionV19';
import { monsterDamageTextureV20 } from './MonsterDamagePartsV20';
import { bossCoreEventTextureV20 } from './BossCoreEventsV20';
import { monsterRecoveryTextureV21, type MonsterRecoveryStateV21 } from './MonsterRecoveryPartsV21';

export interface PremiumMonsterDetailPose {
  readonly elapsed: number;
  readonly state: MonsterState;
  readonly phase: number;
  readonly hpRatio: number;
  readonly facingSign: -1 | 1;
  readonly facingX: number;
  readonly facingY: number;
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
  private readonly paintedHeadplate?: Sprite;
  private readonly paintedTorso?: Sprite;
  private readonly paintedForelegs?: Sprite;
  private readonly paintedHindlegs?: Sprite;
  private readonly paintedDorsal?: Sprite;
  private readonly paintedTailtip?: Sprite;
  private readonly paintedMotionV18?: Sprite;
  private readonly paintedDirectionV19?: Sprite;
  private readonly paintedDamageV20?: Sprite;
  private readonly paintedCoreEventV20?: Sprite;
  private readonly paintedRecoveryV21?: Sprite;
  private readonly profile: PremiumMonsterVariantProfile;
  private readonly coreFxSheet?: Spritesheet;
  private readonly coreFxV17Sheet?: Spritesheet;
  private readonly motionV18Sheet?: Spritesheet;
  private readonly coreFxV18Sheet?: Spritesheet;
  private readonly directionV19Sheet?: Spritesheet;
  private readonly coreTrailV19Sheet?: Spritesheet;
  private readonly damageV20Sheet?: Spritesheet;
  private readonly coreEventV20Sheet?: Spritesheet;
  private readonly recoveryV21Sheet?: Spritesheet;
  private previousState: MonsterState = 'idle';
  private recoveryStartedAt = -1;
  private observedPhase = 1;
  private phaseStartedAt = 0;

  public constructor(
    monsterId: string,
    private readonly rank: MonsterRank,
    private readonly radius: number,
    visual: MonsterVisualConfig,
    partsSheet?: Spritesheet,
    coreFxSheet?: Spritesheet,
    bodyPartsV17Sheet?: Spritesheet,
    coreFxV17Sheet?: Spritesheet,
    motionV18Sheet?: Spritesheet,
    coreFxV18Sheet?: Spritesheet,
    directionV19Sheet?: Spritesheet,
    coreTrailV19Sheet?: Spritesheet,
    damageV20Sheet?: Spritesheet,
    coreEventV20Sheet?: Spritesheet,
    recoveryV21Sheet?: Spritesheet,
  ) {
    this.profile = resolvePremiumMonsterVariant(monsterId, rank, visual);
    this.coreFxSheet = coreFxSheet;
    this.coreFxV17Sheet = coreFxV17Sheet;
    this.motionV18Sheet = motionV18Sheet;
    this.coreFxV18Sheet = coreFxV18Sheet;
    this.directionV19Sheet = directionV19Sheet;
    this.coreTrailV19Sheet = coreTrailV19Sheet;
    this.damageV20Sheet = damageV20Sheet;
    this.coreEventV20Sheet = coreEventV20Sheet;
    this.recoveryV21Sheet = recoveryV21Sheet;
    const textures = monsterPartTextures(partsSheet, this.profile.variant);
    const bodyTextures = monsterBodyTexturesV17(bodyPartsV17Sheet, this.profile.variant);
    this.paintedCrest = createMonsterPartSprite(textures.crest);
    this.paintedCore = createMonsterPartSprite(textures.core, true);
    this.paintedClaw = createMonsterPartSprite(textures.claw);
    this.paintedMane = createMonsterPartSprite(textures.mane);
    this.paintedTail = createMonsterPartSprite(textures.tail);
    this.paintedAura = createMonsterPartSprite(textures.aura, true);
    this.paintedOverdrive = createMonsterPartSprite(textures.overdrive, true);
    this.paintedCoreFx = createMonsterPartSprite(
      bossCoreTrailTextureV19(coreTrailV19Sheet, 'shielded', 0)
        ?? bossCoreFxTextureV18(coreFxV18Sheet, 'shielded', 0)
        ?? bossCoreFxTextureV17(coreFxV17Sheet, 'shielded', 0)
        ?? bossCoreFxTexture(coreFxSheet, 'shielded', 0),
      true,
    );
    this.paintedHeadplate = createMonsterPartSprite(bodyTextures.headplate);
    this.paintedTorso = createMonsterPartSprite(bodyTextures.torso);
    this.paintedForelegs = createMonsterPartSprite(bodyTextures.forelegs);
    this.paintedHindlegs = createMonsterPartSprite(bodyTextures.hindlegs);
    this.paintedDorsal = createMonsterPartSprite(bodyTextures.dorsal);
    this.paintedTailtip = createMonsterPartSprite(bodyTextures.tailtip);
    this.paintedMotionV18 = createMonsterPartSprite(
      premiumMonsterMotionTextureV18(motionV18Sheet, this.profile.variant, 'idle', 1, 0),
      true,
    );
    this.paintedDirectionV19 = createMonsterPartSprite(
      premiumMonsterDirectionTextureV19(directionV19Sheet, this.profile.variant, 0, 1, 'idle'),
      true,
    );
    this.paintedDamageV20 = createMonsterPartSprite(
      monsterDamageTextureV20(damageV20Sheet, this.profile.variant, 0, 1, 'hit', true, 0),
      true,
    );
    this.paintedCoreEventV20 = createMonsterPartSprite(
      bossCoreEventTextureV20(coreEventV20Sheet, 'shattered', 0),
      true,
    );
    this.paintedRecoveryV21 = createMonsterPartSprite(
      monsterRecoveryTextureV21(recoveryV21Sheet, this.profile.variant, 0, 1, 'stagger', 0),
      true,
    );
    this.drawStatic();
    this.back.addChild(
      ...compactMonsterSprites(
        this.paintedAura,
        this.paintedTailtip,
        this.paintedTail,
        this.paintedHindlegs,
        this.paintedTorso,
        this.paintedDorsal,
        this.paintedMane,
      ),
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
        this.paintedForelegs,
        this.paintedHeadplate,
        this.paintedCrest,
        this.paintedCore,
        this.paintedClaw,
        this.paintedCoreFx,
        this.paintedOverdrive,
        this.paintedMotionV18,
        this.paintedDirectionV19,
        this.paintedDamageV20,
        this.paintedCoreEventV20,
        this.paintedRecoveryV21,
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
    this.updateMotionOverlayV18(pose, telegraph, attack, phaseStrength);
    this.updateDirectionOverlayV19(pose, telegraph, attack, phaseStrength);
    this.updateDamageOverlayV20(pose);
    this.updateRecoveryOverlayV21(pose);
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


  private updateMotionOverlayV18(
    pose: PremiumMonsterDetailPose,
    telegraph: number,
    attack: number,
    phaseStrength: number,
  ): void {
    if (!this.paintedMotionV18) return;
    const texture = premiumMonsterMotionTextureV18(
      this.motionV18Sheet,
      this.profile.variant,
      pose.state,
      pose.phase,
      pose.elapsed - this.phaseStartedAt,
    );
    if (!texture) {
      this.paintedMotionV18.visible = false;
      return;
    }
    this.paintedMotionV18.visible = true;
    this.paintedMotionV18.texture = texture;
    const baseScale = (this.radius / 52) * (this.rank === 'boss' ? 1.18 : 0.96);
    this.paintedMotionV18.position.set(pose.facingSign * attack * this.radius * 0.08, -this.radius * 0.04);
    this.paintedMotionV18.scale.set(pose.facingSign * baseScale, baseScale);
    this.paintedMotionV18.rotation = pose.facingSign * (telegraph * 0.025 - attack * 0.04);
    this.paintedMotionV18.alpha = Math.min(0.9, 0.28 + telegraph * 0.34 + attack * 0.4 + (phaseStrength - 1) * 0.08);
  }

  private updateDirectionOverlayV19(
    pose: PremiumMonsterDetailPose,
    telegraph: number,
    attack: number,
    phaseStrength: number,
  ): void {
    if (!this.paintedDirectionV19) return;
    const texture = premiumMonsterDirectionTextureV19(
      this.directionV19Sheet,
      this.profile.variant,
      pose.facingX,
      pose.facingY,
      pose.state,
    );
    if (!texture) {
      this.paintedDirectionV19.visible = false;
      return;
    }
    this.paintedDirectionV19.visible = true;
    this.paintedDirectionV19.texture = texture;
    const baseScale = (this.radius / 48) * (this.rank === 'boss' ? 1.12 : 0.94);
    const directionLift = pose.facingY < -0.35 ? -this.radius * 0.08 : pose.facingY > 0.35 ? this.radius * 0.03 : 0;
    this.paintedDirectionV19.position.set(
      pose.facingSign * attack * this.radius * 0.1,
      directionLift - this.radius * 0.03,
    );
    this.paintedDirectionV19.scale.set(pose.facingSign * baseScale, baseScale);
    this.paintedDirectionV19.rotation = pose.facingSign * (telegraph * 0.035 - attack * 0.055);
    this.paintedDirectionV19.alpha = Math.min(0.94, 0.32 + telegraph * 0.3 + attack * 0.42 + (phaseStrength - 1) * 0.07);
  }

  private updateDamageOverlayV20(pose: PremiumMonsterDetailPose): void {
    if (!this.paintedDamageV20) return;
    const texture = monsterDamageTextureV20(
      this.damageV20Sheet,
      this.profile.variant,
      pose.facingX,
      pose.facingY,
      pose.state,
      pose.alive,
      pose.elapsed,
    );
    if (!texture) {
      this.paintedDamageV20.visible = false;
      return;
    }
    this.paintedDamageV20.visible = true;
    this.paintedDamageV20.texture = texture;
    const baseScale = (this.radius / 48) * (this.rank === 'boss' ? 1.14 : 0.96);
    this.paintedDamageV20.position.set(0, pose.alive ? -this.radius * 0.02 : this.radius * 0.16);
    this.paintedDamageV20.scale.set(pose.facingSign * baseScale, baseScale);
    this.paintedDamageV20.rotation = pose.alive ? -pose.facingSign * 0.035 : pose.facingSign * 0.08;
    this.paintedDamageV20.alpha = pose.flashRemaining > 0 ? 0.98 : 0.82;
  }


  private updateRecoveryOverlayV21(pose: PremiumMonsterDetailPose): void {
    if (!this.paintedRecoveryV21) return;
    if (this.previousState === 'hit' && pose.state !== 'hit' && pose.alive) this.recoveryStartedAt = pose.elapsed;
    this.previousState = pose.state;

    let state: MonsterRecoveryStateV21 | undefined;
    let localElapsed = 0;
    if (!pose.alive) {
      state = 'stagger';
      localElapsed = pose.elapsed;
    } else if (pose.state === 'hit') {
      state = 'stagger';
      localElapsed = pose.elapsed;
    } else if (this.recoveryStartedAt >= 0) {
      localElapsed = Math.max(0, pose.elapsed - this.recoveryStartedAt);
      if (localElapsed < 0.22) state = 'rise';
      else if (localElapsed < 0.48) state = 'recover';
      else this.recoveryStartedAt = -1;
    }

    if (!state) {
      this.paintedRecoveryV21.visible = false;
      return;
    }
    const texture = monsterRecoveryTextureV21(
      this.recoveryV21Sheet,
      this.profile.variant,
      pose.facingX,
      pose.facingY,
      state,
      localElapsed,
    );
    if (!texture) {
      this.paintedRecoveryV21.visible = false;
      return;
    }
    this.paintedRecoveryV21.visible = true;
    this.paintedRecoveryV21.texture = texture;
    const baseScale = (this.radius / 48) * (this.rank === 'boss' ? 1.15 : 0.97);
    const lift = state === 'rise' ? -this.radius * 0.07 : state === 'recover' ? -this.radius * 0.03 : this.radius * 0.03;
    this.paintedRecoveryV21.position.set(0, lift);
    this.paintedRecoveryV21.scale.set(pose.facingSign * baseScale, baseScale);
    this.paintedRecoveryV21.rotation = pose.facingSign * (state === 'stagger' ? 0.055 : state === 'rise' ? -0.028 : 0.012);
    this.paintedRecoveryV21.alpha = state === 'stagger' ? 0.88 : 0.76;
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

    configure(this.paintedTorso, 0, this.radius * 0.06, (0.68 + telegraph * 0.12) * flash, 1.02 + (phaseStrength - 1) * 0.025);
    if (this.paintedTorso) this.paintedTorso.rotation = -pose.facingSign * attack * 0.018;
    configure(this.paintedDorsal, 0, -this.radius * 0.36, 0.56 + telegraph * 0.22, 1.05 + (phaseStrength - 1) * 0.035);
    if (this.paintedDorsal) this.paintedDorsal.rotation = pose.facingSign * (telegraph * 0.018 - attack * 0.028);
    configure(this.paintedHindlegs, -pose.facingSign * this.radius * 0.06, this.radius * 0.36, 0.62 + attack * 0.1, 1.02);
    if (this.paintedHindlegs) this.paintedHindlegs.rotation = -pose.facingSign * attack * 0.022;
    configure(this.paintedTailtip, -pose.facingSign * this.radius * 0.28, this.radius * 0.2, 0.56 + attack * 0.18, 1.08);
    if (this.paintedTailtip) this.paintedTailtip.rotation = -pose.facingSign * (0.06 + Math.sin(pose.elapsed * 2.35) * 0.04 + attack * 0.055);

    configure(this.paintedAura, 0, 0, this.rank === 'boss' ? 0.22 + phaseStrength * 0.08 : telegraph * 0.34, 1.16);
    if (this.paintedAura) this.paintedAura.rotation = pose.elapsed * 0.12 * pose.facingSign;
    configure(this.paintedTail, -pose.facingSign * this.radius * 0.22, this.radius * 0.22, 0.5 + attack * 0.16, 1.08);
    if (this.paintedTail) this.paintedTail.rotation = -pose.facingSign * (0.08 + Math.sin(pose.elapsed * 2.2) * 0.035);
    configure(this.paintedMane, 0, -this.radius * 0.2, 0.46 + telegraph * 0.2, 1.04);
    if (this.paintedMane) this.paintedMane.rotation = -pose.facingSign * attack * 0.025;
    configure(this.paintedForelegs, pose.facingSign * attack * this.radius * 0.04, this.radius * 0.4, 0.68 + attack * 0.2, 1.01);
    if (this.paintedForelegs) this.paintedForelegs.rotation = pose.facingSign * (attack * 0.035 - telegraph * 0.012);
    configure(this.paintedHeadplate, 0, -this.radius * 0.48, (0.72 + telegraph * 0.18) * flash, 0.98 + (phaseStrength - 1) * 0.025);
    if (this.paintedHeadplate) this.paintedHeadplate.rotation = pose.facingSign * (telegraph * 0.018 - attack * 0.04);
    configure(this.paintedCrest, 0, -this.radius * 0.62, (0.7 + telegraph * 0.2) * flash, 0.98);
    if (this.paintedCrest) this.paintedCrest.rotation = pose.facingSign * (telegraph * 0.02 - attack * 0.035);
    configure(this.paintedCore, 0, -this.radius * 0.08, Math.min(1, (0.76 + corePulse * 0.2) * flash), 0.72);
    if (this.paintedCore) this.paintedCore.rotation = pose.elapsed * 0.22 * pose.facingSign;
    configure(this.paintedClaw, pose.facingSign * attack * this.radius * 0.08, this.radius * 0.38, 0.62 + attack * 0.28, 0.92);

    if (this.paintedCoreFx) {
      const coreElapsed = pose.elapsed - this.phaseStartedAt;
      const texture = bossCoreEventTextureV20(this.coreEventV20Sheet, coreState, coreElapsed)
        ?? bossCoreTrailTextureV19(this.coreTrailV19Sheet, coreState, coreElapsed)
        ?? bossCoreFxTextureV18(this.coreFxV18Sheet, coreState, coreElapsed)
        ?? bossCoreFxTextureV17(this.coreFxV17Sheet, coreState, pose.elapsed - this.phaseStartedAt)
        ?? bossCoreFxTexture(this.coreFxSheet, coreState, pose.elapsed - this.phaseStartedAt);
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
    if (this.paintedCoreEventV20) {
      const eventTexture = bossCoreEventTextureV20(this.coreEventV20Sheet, coreState, pose.elapsed - this.phaseStartedAt);
      if (eventTexture) {
        this.paintedCoreEventV20.visible = true;
        this.paintedCoreEventV20.texture = eventTexture;
        configure(this.paintedCoreEventV20, 0, -this.radius * 0.08, this.rank === 'boss' ? 0.9 : 0, 0.82);
        this.paintedCoreEventV20.rotation = pose.elapsed * 0.1 * pose.facingSign;
      } else {
        this.paintedCoreEventV20.visible = false;
      }
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
