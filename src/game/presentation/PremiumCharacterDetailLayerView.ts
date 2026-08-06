import { Container, Graphics, Sprite, type Spritesheet } from 'pixi.js';
import type { DirectionId } from './direction';
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
import {
  playerDirectionalPartTexture,
  resolvePremiumAttackPlacement,
  resolvePremiumDirectionPlacement,
  type PremiumAttackPlacementV17,
  type PremiumDirectionPlacementV17,
  type PremiumDirectionalPlayerPart,
} from './PremiumPartPlacementV17';
import { playerActionPartFrameV18 } from './PlayerActionPartsV18';
import { playerActionPhaseFrameV19 } from './PlayerActionPhasesV19';
import { playerWeaponPhaseFrameV20 } from './PlayerWeaponPhasesV20';
import { playerWeaponInterpolationFrameV21 } from './PlayerWeaponInterpolationV21';

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
  private readonly directionBack = new Container();
  private readonly directionFront = new Container();
  private readonly directionalHair?: Sprite;
  private readonly directionalArmor?: Sprite;
  private readonly directionalCape?: Sprite;
  private readonly directionalFace?: Sprite;
  private readonly actionOverlay?: Sprite;
  private readonly actionPhaseOverlayV19?: Sprite;
  private readonly weaponPhaseOverlayV20?: Sprite;
  private readonly weaponInterpolationOverlayV21?: Sprite;
  private currentDirection: DirectionId = 's';
  private readonly tuning: PremiumCharacterRuntimeTuning;
  private readonly weaponProfile: PremiumWeaponSilhouetteProfile;

  public constructor(
    private readonly appearance: CharacterEquipmentAppearance,
    partsSheet?: Spritesheet,
    private readonly directionSheet?: Spritesheet,
    private readonly actionSheetV18?: Spritesheet,
    private readonly actionPhaseSheetV19?: Spritesheet,
    private readonly weaponPhaseSheetV20?: Spritesheet,
    private readonly weaponInterpolationSheetV21?: Spritesheet,
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
    this.directionalHair = createTextureSprite(playerDirectionalPartTexture(directionSheet, 's', 'hair'), 0.66);
    this.directionalArmor = createTextureSprite(playerDirectionalPartTexture(directionSheet, 's', 'armor'), 0.7);
    this.directionalCape = createTextureSprite(playerDirectionalPartTexture(directionSheet, 's', 'cape'), 0.72);
    this.directionalFace = createTextureSprite(playerDirectionalPartTexture(directionSheet, 's', 'face'), 0.65, true);
    this.actionOverlay = createTextureSprite(playerActionPartFrameV18(actionSheetV18, 's', 'attacking', 0)?.texture, 0.78, true);
    this.actionPhaseOverlayV19 = createTextureSprite(playerActionPhaseFrameV19(actionPhaseSheetV19, 's', 'attacking', 0)?.texture, 0.74, true);
    this.weaponPhaseOverlayV20 = createTextureSprite(playerWeaponPhaseFrameV20(weaponPhaseSheetV20, appearance.weaponVisualFamily, 's', 'attacking', 0)?.texture, 0.76, true);
    this.weaponInterpolationOverlayV21 = createTextureSprite(playerWeaponInterpolationFrameV21(weaponInterpolationSheetV21, appearance.weaponVisualFamily, 's', 'attacking', 0)?.texture, 0.78, true);
    this.drawStaticLayers();
    this.back.addChild(this.directionBack,
      ...compactSprites(this.paintedAuraBack, this.paintedCape, this.paintedCapeEdge, this.paintedHairBack),
      this.capeFabric,
      this.capeEdge,
      this.hairBack,
      this.weaponEcho,
    );
    this.front.addChild(this.directionFront,
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
        this.actionOverlay,
        this.actionPhaseOverlayV19,
        this.weaponPhaseOverlayV20,
        this.weaponInterpolationOverlayV21,
      ),
    );
    this.placeDirectionalSprites(resolvePremiumDirectionPlacement(0, 1));
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
    const directionPlacement = resolvePremiumDirectionPlacement(pose.facingX, pose.facingY);
    const attackPlacement = resolvePremiumAttackPlacement(
      this.appearance.weaponVisualFamily,
      pose.state,
      pose.actionProgress,
      pose.comboStep ?? 1,
      directionPlacement.direction,
    );
    this.placeDirectionalSprites(directionPlacement);
    this.updateActionOverlayV18(pose, directionPlacement);
    this.updateActionPhaseOverlayV19(pose, directionPlacement);
    this.updateWeaponPhaseOverlayV20(pose, directionPlacement);
    this.updateWeaponInterpolationOverlayV21(pose, directionPlacement);

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
      directionPlacement,
      attackPlacement,
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
    readonly directionPlacement: PremiumDirectionPlacementV17;
    readonly attackPlacement: PremiumAttackPlacementV17;
  }): void {
    const { active, actionPulse, actionWeight, directionSign, idlePulse, pose, weaponRotation, directionPlacement, attackPlacement } = input;
    const hitAlpha = pose.state === 'hit' ? 0.42 : 1;
    const dodgeAlpha = pose.state === 'dodging' ? 0.42 : 1;
    const commonScale = 0.66 + (this.tuning.shoulderScale - 1) * 0.18;
    const setPose = (sprite: Sprite | undefined, alpha: number, scale = commonScale): void => {
      if (!sprite) return;
      sprite.position.set(directionPlacement.xOffset, -7 + directionPlacement.yOffset);
      sprite.scale.set(scale * directionSign * directionPlacement.xCompression, scale);
      sprite.alpha = Math.max(0, Math.min(1, alpha));
    };

    setPose(this.paintedCape, (0.44 + actionPulse * 0.14) * dodgeAlpha, 0.72 * this.tuning.capeLength);
    if (this.paintedCape) {
      this.paintedCape.rotation = this.capeFabric.rotation * 0.9 + attackPlacement.capeRotation;
      this.paintedCape.position.set(attackPlacement.capeOffsetX, -5 + Math.abs(pose.facingY) + attackPlacement.capeOffsetY);
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
    if (this.paintedHairBack) this.paintedHairBack.rotation = this.hairBack.rotation * 1.15 + attackPlacement.hairRotation;
    setPose(this.paintedHairFront, (0.68 + idlePulse * 0.1) * hitAlpha, 0.66);
    if (this.paintedHairFront) this.paintedHairFront.rotation = this.hairFront.rotation + attackPlacement.hairRotation * 0.82;
    setPose(this.paintedArmorShoulders, (0.62 + actionPulse * 0.16) * dodgeAlpha, commonScale);
    setPose(this.paintedArmorChest, (0.58 + actionPulse * 0.13) * dodgeAlpha, commonScale);
    for (const armor of [this.paintedArmorShoulders, this.paintedArmorChest]) {
      if (!armor) continue;
      armor.position.x += attackPlacement.armorOffsetX;
      armor.position.y += attackPlacement.armorOffsetY;
    }
    setPose(this.paintedFaceCrest, (0.58 + idlePulse * 0.18) * hitAlpha * directionPlacement.faceAlpha, 0.65);
    setPose(this.paintedRuneCore, Math.min(1, this.appearance.auraStrength * (0.62 + idlePulse * 0.24)), 0.68 * this.tuning.runeScale);
    if (this.paintedRuneCore) this.paintedRuneCore.rotation = -pose.elapsed * 0.08;

    if (this.paintedWeapon) {
      this.paintedWeapon.position.set(attackPlacement.weaponOffsetX, -7 + attackPlacement.weaponOffsetY);
      this.paintedWeapon.rotation = weaponRotation + actionPulse * this.weaponProfile.motionArc * directionSign * 0.18 + attackPlacement.weaponRotationOffset;
      this.paintedWeapon.scale.set(0.68 * directionSign * attackPlacement.weaponScaleX, 0.68 * attackPlacement.weaponScaleY);
      this.paintedWeapon.alpha = (active ? 0.8 + actionPulse * 0.18 : 0.56) * dodgeAlpha;
    }
    if (this.paintedWeaponImpact) {
      this.paintedWeaponImpact.position.set(attackPlacement.weaponOffsetX, -7 + attackPlacement.weaponOffsetY);
      this.paintedWeaponImpact.rotation = weaponRotation + directionSign * actionWeight * this.weaponProfile.motionArc * 0.3 + attackPlacement.weaponRotationOffset;
      this.paintedWeaponImpact.scale.set(0.68 * directionSign * attackPlacement.impactScale, 0.68 * attackPlacement.impactScale);
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


  private updateActionOverlayV18(
    pose: PremiumCharacterDetailPose,
    directionPlacement: PremiumDirectionPlacementV17,
  ): void {
    if (!this.actionOverlay) return;
    const resolved = playerActionPartFrameV18(
      this.actionSheetV18,
      directionPlacement.direction,
      pose.state,
      pose.actionProgress,
    );
    if (!resolved?.texture) {
      this.actionOverlay.visible = false;
      return;
    }
    this.actionOverlay.visible = true;
    this.actionOverlay.texture = resolved.texture;
    const sign = directionPlacement.mirror ? -1 : 1;
    const pulse = Math.sin(Math.max(0, Math.min(1, pose.actionProgress)) * Math.PI);
    this.actionOverlay.position.set(
      directionPlacement.xOffset + sign * pulse * (resolved.action === 'dodge' ? -4 : 2),
      -7 + directionPlacement.yOffset + (resolved.action === 'skill' ? -2 : 0),
    );
    const baseScale = resolved.action === 'skill' ? 0.84 : resolved.action === 'dodge' ? 0.8 : 0.78;
    this.actionOverlay.scale.set(sign * baseScale * directionPlacement.xCompression, baseScale);
    this.actionOverlay.rotation = sign * (resolved.action === 'attack' ? 0.035 * pulse : resolved.action === 'dodge' ? -0.02 : 0);
    this.actionOverlay.alpha = resolved.action === 'skill'
      ? 0.56 + pulse * 0.28
      : resolved.action === 'dodge'
        ? 0.5 + pulse * 0.2
        : 0.48 + pulse * 0.3;
  }

  private updateActionPhaseOverlayV19(
    pose: PremiumCharacterDetailPose,
    directionPlacement: PremiumDirectionPlacementV17,
  ): void {
    if (!this.actionPhaseOverlayV19) return;
    const resolved = playerActionPhaseFrameV19(
      this.actionPhaseSheetV19,
      directionPlacement.direction,
      pose.state,
      pose.actionProgress,
    );
    if (!resolved?.texture) {
      this.actionPhaseOverlayV19.visible = false;
      return;
    }
    this.actionPhaseOverlayV19.visible = true;
    this.actionPhaseOverlayV19.texture = resolved.texture;
    const sign = directionPlacement.mirror ? -1 : 1;
    const progress = Math.max(0, Math.min(1, pose.actionProgress));
    const phasePulse = resolved.phase === 'contact'
      ? Math.min(1, progress / 0.34)
      : resolved.phase === 'sustain'
        ? Math.sin(((progress - 0.34) / 0.38) * Math.PI)
        : Math.max(0, 1 - (progress - 0.72) / 0.28);
    const lateral = resolved.action === 'dodge' ? -7 : resolved.action === 'attack' ? 3 : 0;
    this.actionPhaseOverlayV19.position.set(
      directionPlacement.xOffset + sign * lateral * phasePulse,
      -7 + directionPlacement.yOffset + (resolved.action === 'skill' ? -3 : resolved.phase === 'recover' ? 2 : 0),
    );
    const baseScale = resolved.action === 'skill' ? 0.83 : resolved.action === 'dodge' ? 0.8 : 0.78;
    const phaseScale = resolved.phase === 'contact' ? 0.96 : resolved.phase === 'sustain' ? 1.04 : 0.92;
    this.actionPhaseOverlayV19.scale.set(
      sign * baseScale * phaseScale * directionPlacement.xCompression,
      baseScale * phaseScale,
    );
    this.actionPhaseOverlayV19.rotation = sign * (
      resolved.action === 'attack' ? 0.055 * phasePulse
        : resolved.action === 'dodge' ? -0.035 * phasePulse
          : 0.018 * phasePulse
    );
    this.actionPhaseOverlayV19.alpha = 0.42 + phasePulse * (resolved.action === 'skill' ? 0.46 : 0.36);
  }

  private updateWeaponPhaseOverlayV20(
    pose: PremiumCharacterDetailPose,
    directionPlacement: PremiumDirectionPlacementV17,
  ): void {
    if (!this.weaponPhaseOverlayV20) return;
    const resolved = playerWeaponPhaseFrameV20(
      this.weaponPhaseSheetV20,
      this.appearance.weaponVisualFamily,
      directionPlacement.direction,
      pose.state,
      pose.actionProgress,
    );
    if (!resolved?.texture) {
      this.weaponPhaseOverlayV20.visible = false;
      return;
    }
    this.weaponPhaseOverlayV20.visible = true;
    this.weaponPhaseOverlayV20.texture = resolved.texture;
    const sign = directionPlacement.mirror ? -1 : 1;
    const progress = Math.max(0, Math.min(1, pose.actionProgress));
    const phaseScale = resolved.phase === 'contact' ? 1.04
      : resolved.phase === 'sustain' ? 1.08
        : resolved.phase === 'anticipation' ? 0.92
          : resolved.phase === 'follow-through' ? 0.9 : 0.98;
    const familyOffset = resolved.family === 'riftlance' ? 5 : resolved.family === 'greatblade' ? 2 : 0;
    this.weaponPhaseOverlayV20.position.set(
      directionPlacement.xOffset + sign * familyOffset,
      -7 + directionPlacement.yOffset + (resolved.phase === 'follow-through' ? 2 : 0),
    );
    this.weaponPhaseOverlayV20.scale.set(
      sign * 0.76 * phaseScale * directionPlacement.xCompression,
      0.76 * phaseScale,
    );
    this.weaponPhaseOverlayV20.rotation = sign * (resolved.family === 'riftlance' ? 0.01 : resolved.family === 'greatblade' ? 0.045 : 0.03)
      * Math.sin(progress * Math.PI);
    this.weaponPhaseOverlayV20.alpha = resolved.phase === 'contact' ? 0.92 : resolved.phase === 'sustain' ? 0.82 : 0.62;
  }


  private updateWeaponInterpolationOverlayV21(
    pose: PremiumCharacterDetailPose,
    directionPlacement: PremiumDirectionPlacementV17,
  ): void {
    if (!this.weaponInterpolationOverlayV21) return;
    const resolved = playerWeaponInterpolationFrameV21(
      this.weaponInterpolationSheetV21,
      this.appearance.weaponVisualFamily,
      directionPlacement.direction,
      pose.state,
      pose.actionProgress,
    );
    if (!resolved?.texture) {
      this.weaponInterpolationOverlayV21.visible = false;
      return;
    }
    this.weaponInterpolationOverlayV21.visible = true;
    this.weaponInterpolationOverlayV21.texture = resolved.texture;
    const sign = directionPlacement.mirror ? -1 : 1;
    const progress = Math.max(0, Math.min(1, pose.actionProgress));
    const pulse = Math.sin(progress * Math.PI);
    const familyOffset = resolved.family === 'riftlance' ? 5.5 : resolved.family === 'greatblade' ? 2.5 : 0.5;
    const scale = 0.76 + pulse * (resolved.family === 'greatblade' ? 0.08 : 0.055);
    this.weaponInterpolationOverlayV21.position.set(
      directionPlacement.xOffset + sign * familyOffset,
      -7 + directionPlacement.yOffset - pulse * 1.5,
    );
    this.weaponInterpolationOverlayV21.scale.set(
      sign * scale * directionPlacement.xCompression,
      scale,
    );
    this.weaponInterpolationOverlayV21.rotation = sign * (resolved.family === 'riftlance' ? 0.008 : resolved.family === 'greatblade' ? 0.035 : 0.025) * pulse;
    this.weaponInterpolationOverlayV21.alpha = 0.38 + pulse * 0.52;
  }

  private placeDirectionalSprites(profile: PremiumDirectionPlacementV17): void {
    if (this.currentDirection !== profile.direction) {
      this.currentDirection = profile.direction;
      this.setDirectionalTexture(this.directionalHair, profile.direction, 'hair');
      this.setDirectionalTexture(this.directionalArmor, profile.direction, 'armor');
      this.setDirectionalTexture(this.directionalCape, profile.direction, 'cape');
      this.setDirectionalTexture(this.directionalFace, profile.direction, 'face');
    }
    this.reparentDirectional(this.directionalHair, profile.hairDepth);
    this.reparentDirectional(this.directionalArmor, profile.armorDepth);
    this.reparentDirectional(this.directionalCape, profile.capeDepth);
    this.reparentDirectional(this.directionalFace, profile.faceDepth);
    this.reparentRootSprite(this.paintedWeapon, profile.weaponDepth);

    const sign = profile.mirror ? -1 : 1;
    const configure = (sprite: Sprite | undefined, alpha: number, scale: number, x = 0, y = 0): void => {
      if (!sprite) return;
      sprite.position.set(profile.xOffset + x, -7 + profile.yOffset + y);
      sprite.scale.set(sign * scale * profile.xCompression, scale);
      sprite.alpha = alpha;
    };
    configure(this.directionalHair, profile.backFacing ? 0.68 : 0.78, 0.66);
    configure(this.directionalArmor, 0.78, 0.7);
    configure(this.directionalCape, profile.backFacing ? 0.82 : 0.7, 0.72, profile.capeOffsetX, profile.capeOffsetY);
    configure(this.directionalFace, profile.faceAlpha * 0.76, 0.65);
  }

  private setDirectionalTexture(
    sprite: Sprite | undefined,
    direction: DirectionId,
    part: PremiumDirectionalPlayerPart,
  ): void {
    if (!sprite) return;
    const texture = playerDirectionalPartTexture(this.directionSheet, direction, part);
    if (texture) sprite.texture = texture;
  }

  private reparentDirectional(sprite: Sprite | undefined, depth: 'back' | 'front'): void {
    if (!sprite) return;
    const target = depth === 'back' ? this.directionBack : this.directionFront;
    if (sprite.parent !== target) target.addChild(sprite);
  }

  private reparentRootSprite(sprite: Sprite | undefined, depth: 'back' | 'front'): void {
    if (!sprite) return;
    const target = depth === 'back' ? this.back : this.front;
    if (sprite.parent !== target) target.addChild(sprite);
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
