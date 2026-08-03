import { Container, Graphics, Sprite, type Spritesheet } from 'pixi.js';
import type { CharacterEquipmentAppearance } from './CharacterEquipmentVisualProfile';
import {
  PREMIUM_PLAYER_PART_KEYS,
  playerPartTexture,
  playerWeaponPartTexture,
} from './PremiumPartAtlasV16';
import {
  premiumCharacterActionWeight,
  premiumWeaponSilhouetteProfile,
  resolvePremiumCharacterRuntimeTuning,
  type PremiumCharacterRuntimeState,
  type PremiumCharacterRuntimeTuning,
  type PremiumWeaponSilhouetteProfile,
} from './PremiumCharacterRuntimeV14';

export interface PremiumCharacterDetailPose {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotation: number;
  readonly facingX: number;
  readonly facingY: number;
  readonly elapsed: number;
  readonly actionProgress: number;
  readonly comboStep?: number;
  readonly state: PremiumCharacterRuntimeState;
  readonly overdrive: boolean;
  readonly flashRemaining: number;
}

export class PremiumCharacterDetailLayerView {
  public readonly back = new Container();
  public readonly front = new Container();
  private readonly capeFabric = new Graphics();
  private readonly capeEdge = new Graphics();
  private readonly hairBack = new Graphics();
  private readonly weaponEcho = new Graphics();
  private readonly armorPlate = new Graphics();
  private readonly armorTrim = new Graphics();
  private readonly faceRim = new Graphics();
  private readonly hairFront = new Graphics();
  private readonly faceCrest = new Graphics();
  private readonly runeCore = new Graphics();
  private readonly weaponRune = new Graphics();
  private readonly weaponImpact = new Graphics();
  private readonly paintedCape?: Sprite;
  private readonly paintedCapeEdge?: Sprite;
  private readonly paintedHairBack?: Sprite;
  private readonly paintedAuraBack?: Sprite;
  private readonly paintedArmorShoulders?: Sprite;
  private readonly paintedArmorChest?: Sprite;
  private readonly paintedHairFront?: Sprite;
  private readonly paintedFaceCrest?: Sprite;
  private readonly paintedRuneCore?: Sprite;
  private readonly paintedWeapon?: Sprite;
  private readonly paintedWeaponImpact?: Sprite;
  private readonly paintedAuraFront?: Sprite;
  private readonly paintedOverdrive?: Sprite;
  private readonly paintedGuard?: Sprite;
  private readonly tuning: PremiumCharacterRuntimeTuning;
  private readonly weaponProfile: PremiumWeaponSilhouetteProfile;

  public constructor(
    private readonly appearance: CharacterEquipmentAppearance,
    partsSheet?: Spritesheet,
  ) {
    this.tuning = resolvePremiumCharacterRuntimeTuning(appearance);
    this.weaponProfile = premiumWeaponSilhouetteProfile(appearance.weaponVisualFamily);
    this.paintedCape = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.capeFabric, 0.74);
    this.paintedCapeEdge = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.capeEdge, 0.76);
    this.paintedHairBack = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.hairBack, 0.66);
    this.paintedAuraBack = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.auraBack, 0.72, true);
    this.paintedArmorShoulders = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.armorShoulders, 0.72);
    this.paintedArmorChest = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.armorChest, 0.72);
    this.paintedHairFront = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.hairFront, 0.66);
    this.paintedFaceCrest = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.faceCrest, 0.66, true);
    this.paintedRuneCore = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.runeCore, 0.72, true);
    this.paintedWeapon = createTextureSprite(playerWeaponPartTexture(partsSheet, appearance.weaponVisualFamily), 0.7);
    this.paintedWeaponImpact = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.weaponImpact, 0.72, true);
    this.paintedAuraFront = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.auraFront, 0.72, true);
    this.paintedOverdrive = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.auraOverdrive, 0.74, true);
    this.paintedGuard = createPartSprite(partsSheet, PREMIUM_PLAYER_PART_KEYS.guard, 0.74, true);
    this.drawStaticLayers();
    this.back.addChild(
      ...compactSprites(this.paintedAuraBack, this.paintedCape, this.paintedCapeEdge, this.paintedHairBack),
      this.capeFabric,
      this.capeEdge,
      this.hairBack,
      this.weaponEcho,
    );
    this.front.addChild(
      this.armorPlate,
      this.armorTrim,
      this.faceRim,
      this.hairFront,
      this.faceCrest,
      this.runeCore,
      this.weaponRune,
      this.weaponImpact,
      ...compactSprites(
        this.paintedArmorShoulders,
        this.paintedArmorChest,
        this.paintedHairFront,
        this.paintedFaceCrest,
        this.paintedRuneCore,
        this.paintedWeapon,
        this.paintedWeaponImpact,
        this.paintedGuard,
        this.paintedAuraFront,
        this.paintedOverdrive,
      ),
    );
  }

  public update(pose: PremiumCharacterDetailPose): void {
    for (const layer of [this.back, this.front]) {
      layer.position.set(pose.x, pose.y);
      layer.scale.set(pose.scaleX, pose.scaleY);
      layer.rotation = pose.rotation;
    }

    const active = pose.state === 'attacking' || pose.state === 'skill' || pose.state === 'showcase';
    const actionPulse = active ? Math.sin(Math.max(0, Math.min(1, pose.actionProgress)) * Math.PI) : 0;
    const actionWeight = premiumCharacterActionWeight(pose.state, pose.actionProgress, pose.comboStep ?? 1);
    const idlePulse = 0.5 + Math.sin(pose.elapsed * 3.4) * 0.5;
    const flashMultiplier = pose.flashRemaining > 0 ? 1.35 : 1;
    const directionSign = pose.facingX < -0.08 ? -1 : 1;
    const facingAngle = Math.atan2(pose.facingY, pose.facingX);

    this.capeFabric.rotation = -directionSign * (0.018 + actionPulse * 0.08)
      + Math.sin(pose.elapsed * 2.05) * 0.018;
    this.capeFabric.position.set(-pose.facingX * 2.3, 1.5 + Math.abs(pose.facingY) * 1.1);
    this.capeFabric.scale.set(1 + actionPulse * 0.035, 1 - actionPulse * 0.02);
    this.capeFabric.alpha = pose.state === 'dodging' ? 0.13 : 0.24 + actionPulse * 0.16;

    this.capeEdge.rotation = this.capeFabric.rotation * 1.08;
    this.capeEdge.position.set(this.capeFabric.position.x, this.capeFabric.position.y);
    this.capeEdge.alpha = pose.state === 'dodging' ? 0.2 : 0.48 + actionPulse * 0.2;

    const hairMotion = Math.sin(pose.elapsed * 3.1) * 0.018 + directionSign * actionPulse * 0.035;
    this.hairBack.rotation = -hairMotion;
    this.hairBack.position.set(-pose.facingX * 0.8, -Math.abs(pose.facingY) * 0.4);
    this.hairBack.alpha = pose.state === 'hit' ? 0.38 : 0.58 + idlePulse * 0.14;
    this.hairFront.rotation = hairMotion * 0.72;
    this.hairFront.position.x = directionSign * 0.55;
    this.hairFront.alpha = pose.state === 'hit' ? 0.34 : 0.62 + idlePulse * 0.12;

    this.armorPlate.alpha = (pose.state === 'dodging' ? 0.24 : 0.42 + actionPulse * 0.18) * flashMultiplier;
    this.armorPlate.scale.set(
      this.tuning.shoulderScale * (1 + actionPulse * 0.018),
      1 - actionPulse * 0.012,
    );
    this.armorTrim.alpha = (pose.state === 'dodging' ? 0.34 : 0.64 + actionPulse * 0.16) * flashMultiplier;
    this.armorTrim.scale.set(1 + actionPulse * 0.015, 1 - actionPulse * 0.01);

    this.faceRim.alpha = pose.state === 'hit'
      ? 0.2
      : this.tuning.faceLightAlpha * (0.72 + idlePulse * 0.28) * flashMultiplier;
    this.faceRim.position.x = directionSign * 0.9;
    this.faceCrest.alpha = pose.state === 'hit' ? 0.28 : 0.56 + idlePulse * 0.16;
    this.faceCrest.position.x = directionSign * 0.8;

    const runeStrength = this.appearance.auraStrength * (pose.overdrive ? 1 : 0.68 + idlePulse * 0.18);
    this.runeCore.alpha = Math.min(1, runeStrength * flashMultiplier);
    this.runeCore.scale.set((pose.overdrive ? 1.12 + idlePulse * 0.05 : 0.96 + idlePulse * 0.03) * this.tuning.runeScale);
    this.runeCore.rotation = Math.sin(pose.elapsed * 1.8) * 0.045;

    const weaponRotation = facingAngle + (this.appearance.weaponVisualFamily === 'riftlance' ? 0 : Math.PI / 4);
    this.weaponRune.rotation = weaponRotation + actionPulse * this.weaponProfile.motionArc * directionSign * 0.22;
    this.weaponRune.alpha = active ? 0.74 + actionPulse * 0.24 : pose.overdrive ? 0.74 : 0.34;
    this.weaponRune.scale.set(active ? 1 + actionPulse * 0.14 : 0.88);

    this.weaponEcho.rotation = this.weaponRune.rotation - directionSign * 0.08;
    this.weaponEcho.alpha = active ? 0.16 + actionPulse * 0.28 : pose.overdrive ? 0.16 : 0;
    this.weaponEcho.scale.set(1 + actionPulse * 0.22, 1 + actionPulse * 0.05);

    this.weaponImpact.rotation = weaponRotation + directionSign * actionWeight * this.weaponProfile.motionArc * 0.32;
    this.weaponImpact.alpha = active ? Math.min(0.9, actionWeight * 0.68) : pose.overdrive ? 0.26 : 0;
    this.weaponImpact.scale.set(0.82 + actionWeight * 0.28, 0.8 + actionPulse * 0.12);

    this.updatePaintedParts({
      active,
      actionPulse,
      actionWeight,
      directionSign,
      facingAngle,
      idlePulse,
      pose,
      weaponRotation,
    });
  }

  private updatePaintedParts(input: {
    readonly active: boolean;
    readonly actionPulse: number;
    readonly actionWeight: number;
    readonly directionSign: number;
    readonly facingAngle: number;
    readonly idlePulse: number;
    readonly pose: PremiumCharacterDetailPose;
    readonly weaponRotation: number;
  }): void {
    const { active, actionPulse, actionWeight, directionSign, idlePulse, pose, weaponRotation } = input;
    const hitAlpha = pose.state === 'hit' ? 0.42 : 1;
    const dodgeAlpha = pose.state === 'dodging' ? 0.42 : 1;
    const commonScale = 0.66 + (this.tuning.shoulderScale - 1) * 0.18;
    const setPose = (sprite: Sprite | undefined, alpha: number, scale = commonScale): void => {
      if (!sprite) return;
      sprite.position.set(0, -7);
      sprite.scale.set(scale * directionSign, scale);
      sprite.alpha = Math.max(0, Math.min(1, alpha));
    };

    setPose(this.paintedCape, (0.44 + actionPulse * 0.14) * dodgeAlpha, 0.72 * this.tuning.capeLength);
    if (this.paintedCape) {
      this.paintedCape.rotation = this.capeFabric.rotation * 0.9;
      this.paintedCape.position.set(-pose.facingX * 2, -5 + Math.abs(pose.facingY));
    }
    setPose(this.paintedCapeEdge, (0.55 + actionPulse * 0.16) * dodgeAlpha, 0.72 * this.tuning.capeLength);
    if (this.paintedCapeEdge) {
      this.paintedCapeEdge.rotation = this.capeEdge.rotation * 0.92;
      this.paintedCapeEdge.position.set(
        this.paintedCape?.position.x ?? 0,
        this.paintedCape?.position.y ?? -6,
      );
    }
    setPose(this.paintedHairBack, (0.62 + idlePulse * 0.12) * hitAlpha, 0.66);
    if (this.paintedHairBack) this.paintedHairBack.rotation = this.hairBack.rotation * 1.15;
    setPose(this.paintedHairFront, (0.68 + idlePulse * 0.1) * hitAlpha, 0.66);
    if (this.paintedHairFront) this.paintedHairFront.rotation = this.hairFront.rotation;
    setPose(this.paintedArmorShoulders, (0.62 + actionPulse * 0.16) * dodgeAlpha, commonScale);
    setPose(this.paintedArmorChest, (0.58 + actionPulse * 0.13) * dodgeAlpha, commonScale);
    setPose(this.paintedFaceCrest, (0.58 + idlePulse * 0.18) * hitAlpha, 0.65);
    setPose(this.paintedRuneCore, Math.min(1, this.appearance.auraStrength * (0.62 + idlePulse * 0.24)), 0.68 * this.tuning.runeScale);
    if (this.paintedRuneCore) this.paintedRuneCore.rotation = -pose.elapsed * 0.08;

    if (this.paintedWeapon) {
      this.paintedWeapon.position.set(0, -7);
      this.paintedWeapon.rotation = weaponRotation + actionPulse * this.weaponProfile.motionArc * directionSign * 0.18;
      this.paintedWeapon.scale.set(0.68 * directionSign, 0.68);
      this.paintedWeapon.alpha = (active ? 0.8 + actionPulse * 0.18 : 0.56) * dodgeAlpha;
    }
    if (this.paintedWeaponImpact) {
      this.paintedWeaponImpact.position.set(0, -7);
      this.paintedWeaponImpact.rotation = weaponRotation + directionSign * actionWeight * this.weaponProfile.motionArc * 0.3;
      this.paintedWeaponImpact.scale.set(0.68 * directionSign, 0.68);
      this.paintedWeaponImpact.alpha = active ? Math.min(0.92, actionWeight * 0.72) : 0;
    }
    setPose(this.paintedAuraBack, pose.overdrive ? 0.44 + idlePulse * 0.16 : 0.16 + idlePulse * 0.08, 0.72);
    if (this.paintedAuraBack) this.paintedAuraBack.rotation = pose.elapsed * 0.08;
    setPose(this.paintedAuraFront, pose.overdrive ? 0.46 + idlePulse * 0.18 : active ? 0.2 + actionPulse * 0.16 : 0.1, 0.72);
    if (this.paintedAuraFront) this.paintedAuraFront.rotation = -pose.elapsed * 0.11;
    setPose(this.paintedOverdrive, pose.overdrive ? 0.58 + idlePulse * 0.24 : 0, 0.74);
    if (this.paintedOverdrive) this.paintedOverdrive.rotation = pose.elapsed * 0.15;
    setPose(this.paintedGuard, pose.state === 'dodging' ? 0.42 : 0, 0.74);
  }

  private drawStaticLayers(): void {
    const primary = this.appearance.primaryColor;
    const secondary = this.appearance.secondaryColor;
    const rune = this.appearance.runeColor;
    const gold = 0xf3dfb0;
    const capeHalf = 17 * this.tuning.capeWidth;
    const capeLength = 29 * this.tuning.capeLength;

    this.capeFabric
      .moveTo(-capeHalf, -31)
      .quadraticCurveTo(-capeHalf - 6, -3, -capeHalf * 0.68, capeLength)
      .lineTo(0, capeLength + 5)
      .lineTo(capeHalf * 0.68, capeLength)
      .quadraticCurveTo(capeHalf + 6, -3, capeHalf, -31)
      .lineTo(capeHalf * 0.52, -27)
      .quadraticCurveTo(0, -13, -capeHalf * 0.52, -27)
      .closePath()
      .fill({ color: primary, alpha: 0.15 });

    for (const side of [-1, 1] as const) {
      const x = side * capeHalf;
      this.capeEdge
        .moveTo(x, -31)
        .quadraticCurveTo(x + side * 6, -2, side * capeHalf * 0.68, capeLength)
        .stroke({ color: side < 0 ? secondary : primary, alpha: 0.7, width: 1.7 })
        .moveTo(side * capeHalf * 0.5, -25)
        .quadraticCurveTo(side * capeHalf * 0.38, 2, side * capeHalf * 0.28, capeLength - 2)
        .stroke({ color: gold, alpha: 0.3, width: 1.05 });
    }
    this.capeEdge
      .moveTo(-capeHalf * 0.68, capeLength)
      .lineTo(0, capeLength + 5)
      .lineTo(capeHalf * 0.68, capeLength)
      .stroke({ color: rune, alpha: 0.38, width: 1.3 })
      .moveTo(-7, capeLength - 2)
      .lineTo(0, capeLength - 10)
      .lineTo(7, capeLength - 2)
      .stroke({ color: gold, alpha: 0.34, width: 1.1 });

    this.hairBack
      .moveTo(-11, -45)
      .quadraticCurveTo(-18, -37, -15, -27)
      .stroke({ color: 0x1d2345, alpha: 0.82, width: 4.2 })
      .moveTo(-5, -48)
      .quadraticCurveTo(-12, -36, -8, -25)
      .stroke({ color: 0x333d78, alpha: 0.62, width: 3.1 })
      .moveTo(8, -46)
      .quadraticCurveTo(16, -36, 12, -25)
      .stroke({ color: 0x20274f, alpha: 0.76, width: 3.7 });

    this.weaponEcho
      .moveTo(8, 0)
      .lineTo(this.weaponProfile.bladeLength + 10, 0)
      .stroke({ color: rune, alpha: 0.54, width: this.weaponProfile.bladeWidth + 2 });
    this.weaponEcho.position.set(0, -7);

    const shoulderWidth = this.appearance.armorSilhouette === 'royal' ? 22 : this.appearance.armorSilhouette === 'guarded' ? 20 : 18;
    this.armorPlate
      .moveTo(-shoulderWidth, -28)
      .lineTo(-12, -38)
      .lineTo(-5, -31)
      .lineTo(-9, -21)
      .closePath()
      .fill({ color: primary, alpha: 0.28 })
      .stroke({ color: secondary, alpha: 0.5, width: 1.5 })
      .moveTo(shoulderWidth, -28)
      .lineTo(12, -38)
      .lineTo(5, -31)
      .lineTo(9, -21)
      .closePath()
      .fill({ color: primary, alpha: 0.28 })
      .stroke({ color: secondary, alpha: 0.5, width: 1.5 })
      .moveTo(-11, -18)
      .lineTo(0, -7)
      .lineTo(11, -18)
      .lineTo(7, -2)
      .lineTo(0, 4)
      .lineTo(-7, -2)
      .closePath()
      .fill({ color: secondary, alpha: 0.1 })
      .stroke({ color: gold, alpha: 0.42, width: 1.2 });

    this.armorTrim
      .moveTo(-shoulderWidth, -29)
      .lineTo(-11, -38)
      .lineTo(-4, -31)
      .stroke({ color: secondary, alpha: 0.86, width: 1.8 })
      .moveTo(shoulderWidth, -29)
      .lineTo(11, -38)
      .lineTo(4, -31)
      .stroke({ color: secondary, alpha: 0.86, width: 1.8 })
      .moveTo(-14, -11)
      .lineTo(0, -1)
      .lineTo(14, -11)
      .stroke({ color: gold, alpha: 0.58, width: 1.4 })
      .moveTo(-8, -23)
      .lineTo(0, -16)
      .lineTo(8, -23)
      .stroke({ color: rune, alpha: 0.52, width: 1.2 });

    this.faceRim
      .moveTo(-9, -44)
      .quadraticCurveTo(-12, -36, -8, -31)
      .stroke({ color: secondary, alpha: 0.54, width: 1.5 })
      .moveTo(9, -44)
      .quadraticCurveTo(12, -36, 8, -31)
      .stroke({ color: rune, alpha: 0.48, width: 1.3 })
      .moveTo(-5, -35)
      .lineTo(0, -33)
      .lineTo(5, -35)
      .stroke({ color: 0xffffff, alpha: 0.34, width: 0.9 });

    this.hairFront
      .moveTo(-12, -47)
      .quadraticCurveTo(-4, -54, 3, -47)
      .stroke({ color: 0x303a73, alpha: 0.76, width: 4 })
      .moveTo(-4, -50)
      .quadraticCurveTo(3, -56, 10, -46)
      .stroke({ color: 0x191f44, alpha: 0.86, width: 4.4 })
      .moveTo(1, -49)
      .lineTo(5, -37)
      .stroke({ color: 0x6771b5, alpha: 0.52, width: 2.1 });

    this.faceCrest
      .moveTo(0, -49)
      .lineTo(3.5, -42)
      .lineTo(0, -37.5)
      .lineTo(-3.5, -42)
      .closePath()
      .fill({ color: rune, alpha: 0.55 })
      .stroke({ color: 0xffffff, alpha: 0.58, width: 0.95 })
      .moveTo(-8, -39)
      .lineTo(0, -35.5)
      .lineTo(8, -39)
      .stroke({ color: secondary, alpha: 0.48, width: 1.1 });

    this.runeCore
      .circle(0, -19, 7)
      .fill({ color: rune, alpha: 0.12 })
      .stroke({ color: rune, alpha: 0.94, width: 1.6 })
      .circle(0, -19, 3.2)
      .fill({ color: rune, alpha: 0.56 })
      .moveTo(0, -30)
      .lineTo(4.5, -23.5)
      .lineTo(11, -19)
      .lineTo(4.5, -14.5)
      .lineTo(0, -8)
      .lineTo(-4.5, -14.5)
      .lineTo(-11, -19)
      .lineTo(-4.5, -23.5)
      .closePath()
      .stroke({ color: 0xffffff, alpha: 0.38, width: 1.05 });

    this.drawWeapon();
    this.drawWeaponImpact();
  }

  private drawWeapon(): void {
    const secondary = this.appearance.secondaryColor;
    const rune = this.appearance.runeColor;
    const profile = this.weaponProfile;
    const length = profile.bladeLength;
    const halfWidth = profile.bladeWidth / 2;

    if (profile.family === 'riftlance') {
      this.weaponRune
        .moveTo(5, 0)
        .lineTo(length, 0)
        .stroke({ color: secondary, alpha: 0.82, width: 1.7 })
        .moveTo(length - 14, -7)
        .lineTo(length + 8, 0)
        .lineTo(length - 14, 7)
        .closePath()
        .fill({ color: rune, alpha: 0.16 })
        .stroke({ color: rune, alpha: 0.9, width: 1.7 })
        .moveTo(9, -profile.guardWidth / 2)
        .lineTo(9, profile.guardWidth / 2)
        .stroke({ color: 0xf3dfb0, alpha: 0.58, width: 1.4 });
    } else {
      this.weaponRune
        .moveTo(7, -halfWidth)
        .lineTo(length - 7, -halfWidth * 1.25)
        .lineTo(length + 8, 0)
        .lineTo(length - 7, halfWidth * 1.25)
        .lineTo(7, halfWidth)
        .closePath()
        .fill({ color: secondary, alpha: profile.family === 'greatblade' ? 0.14 : 0.08 })
        .stroke({ color: secondary, alpha: 0.84, width: 1.55 })
        .moveTo(17, 0)
        .lineTo(length + 2, 0)
        .stroke({ color: rune, alpha: 0.72, width: 1.25 })
        .moveTo(8, -profile.guardWidth / 2)
        .lineTo(8, profile.guardWidth / 2)
        .stroke({ color: 0xf3dfb0, alpha: 0.62, width: 1.5 });
    }
    this.weaponRune.position.set(0, -7);
  }

  private drawWeaponImpact(): void {
    const color = this.appearance.weaponTrailColor;
    const echoes = this.weaponProfile.echoCount;
    const radius = this.weaponProfile.bladeLength * 0.82;
    for (let index = 0; index < echoes; index += 1) {
      const width = Math.max(1.2, 4.2 - index * 1.05);
      const alpha = Math.max(0.16, 0.52 - index * 0.1);
      if (this.weaponProfile.family === 'riftlance') {
        const y = (index - (echoes - 1) / 2) * 4.5;
        this.weaponImpact
          .moveTo(8, y)
          .lineTo(radius + 20 + index * 8, y * 0.35)
          .stroke({ color: index === 0 ? 0xffffff : color, alpha, width });
      } else {
        this.weaponImpact
          .arc(0, 0, radius + index * 6, -0.96 - index * 0.05, 0.96 + index * 0.04)
          .stroke({ color: index === 0 ? 0xffffff : color, alpha, width });
      }
    }
    this.weaponImpact.position.set(0, -7);
  }
}

function createPartSprite(
  sheet: Spritesheet | undefined,
  key: string,
  scale: number,
  additive = false,
): Sprite | undefined {
  return createTextureSprite(playerPartTexture(sheet, key), scale, additive);
}

function createTextureSprite(
  texture: ReturnType<typeof playerPartTexture>,
  scale: number,
  additive = false,
): Sprite | undefined {
  if (!texture) return undefined;
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(scale);
  sprite.position.set(0, -7);
  if (additive) sprite.blendMode = 'add';
  return sprite;
}

function compactSprites(...sprites: Array<Sprite | undefined>): Sprite[] {
  return sprites.filter((sprite): sprite is Sprite => sprite !== undefined);
}
