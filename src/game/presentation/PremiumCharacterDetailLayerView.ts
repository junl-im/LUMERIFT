import { Container, Graphics } from 'pixi.js';
import type { PlayerState } from '../actors/player/PlayerCombatController';
import type { CharacterEquipmentAppearance } from './CharacterEquipmentVisualProfile';

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
  readonly state: PlayerState;
  readonly overdrive: boolean;
  readonly flashRemaining: number;
}

export class PremiumCharacterDetailLayerView {
  public readonly back = new Container();
  public readonly front = new Container();
  private readonly capeEdge = new Graphics();
  private readonly armorTrim = new Graphics();
  private readonly faceCrest = new Graphics();
  private readonly runeCore = new Graphics();
  private readonly weaponRune = new Graphics();

  public constructor(private readonly appearance: CharacterEquipmentAppearance) {
    this.drawStaticLayers();
    this.back.addChild(this.capeEdge);
    this.front.addChild(this.armorTrim, this.faceCrest, this.runeCore, this.weaponRune);
  }

  public update(pose: PremiumCharacterDetailPose): void {
    for (const layer of [this.back, this.front]) {
      layer.position.set(pose.x, pose.y);
      layer.scale.set(pose.scaleX, pose.scaleY);
      layer.rotation = pose.rotation;
    }

    const active = pose.state === 'attacking' || pose.state === 'skill';
    const actionPulse = active ? Math.sin(Math.max(0, Math.min(1, pose.actionProgress)) * Math.PI) : 0;
    const idlePulse = 0.5 + Math.sin(pose.elapsed * 3.4) * 0.5;
    const flashMultiplier = pose.flashRemaining > 0 ? 1.35 : 1;
    const directionSign = pose.facingX < -0.08 ? -1 : 1;

    this.capeEdge.rotation = -directionSign * (0.022 + actionPulse * 0.055) + Math.sin(pose.elapsed * 2.2) * 0.012;
    this.capeEdge.position.set(-pose.facingX * 1.6, 0.5 + Math.abs(pose.facingY) * 0.8);
    this.capeEdge.alpha = pose.state === 'dodging' ? 0.2 : 0.42 + actionPulse * 0.14;

    this.armorTrim.alpha = (pose.state === 'dodging' ? 0.34 : 0.58 + actionPulse * 0.12) * flashMultiplier;
    this.armorTrim.scale.set(1 + actionPulse * 0.012, 1 - actionPulse * 0.008);

    this.faceCrest.alpha = pose.state === 'hit' ? 0.28 : 0.52 + idlePulse * 0.12;
    this.faceCrest.position.x = directionSign * 0.8;

    const runeStrength = this.appearance.auraStrength * (pose.overdrive ? 1 : 0.68 + idlePulse * 0.18);
    this.runeCore.alpha = Math.min(1, runeStrength * flashMultiplier);
    this.runeCore.scale.set(pose.overdrive ? 1.12 + idlePulse * 0.04 : 0.96 + idlePulse * 0.025);
    this.runeCore.rotation = Math.sin(pose.elapsed * 1.8) * 0.045;

    this.weaponRune.rotation = Math.atan2(pose.facingY, pose.facingX) + (this.appearance.weaponVisualFamily === 'riftlance' ? 0 : Math.PI / 4);
    this.weaponRune.alpha = active ? 0.72 + actionPulse * 0.24 : pose.overdrive ? 0.72 : 0.32;
    this.weaponRune.scale.set(active ? 1 + actionPulse * 0.12 : 0.88);
  }

  private drawStaticLayers(): void {
    const primary = this.appearance.primaryColor;
    const secondary = this.appearance.secondaryColor;
    const rune = this.appearance.runeColor;

    this.capeEdge
      .moveTo(-17, -31)
      .quadraticCurveTo(-22, -2, -12, 25)
      .stroke({ color: secondary, alpha: 0.66, width: 1.6 })
      .moveTo(17, -31)
      .quadraticCurveTo(22, -2, 12, 25)
      .stroke({ color: primary, alpha: 0.5, width: 1.4 })
      .moveTo(-11, 21)
      .lineTo(0, 27)
      .lineTo(11, 21)
      .stroke({ color: rune, alpha: 0.32, width: 1.2 });

    this.armorTrim
      .moveTo(-19, -29)
      .lineTo(-11, -37)
      .lineTo(-5, -31)
      .stroke({ color: secondary, alpha: 0.8, width: 1.7 })
      .moveTo(19, -29)
      .lineTo(11, -37)
      .lineTo(5, -31)
      .stroke({ color: secondary, alpha: 0.8, width: 1.7 })
      .moveTo(-13, -11)
      .lineTo(0, -2)
      .lineTo(13, -11)
      .stroke({ color: 0xf3dfb0, alpha: 0.5, width: 1.3 })
      .moveTo(-8, -23)
      .lineTo(0, -16)
      .lineTo(8, -23)
      .stroke({ color: rune, alpha: 0.46, width: 1.1 });

    this.faceCrest
      .moveTo(0, -48)
      .lineTo(3, -42)
      .lineTo(0, -38)
      .lineTo(-3, -42)
      .closePath()
      .fill({ color: rune, alpha: 0.5 })
      .stroke({ color: 0xffffff, alpha: 0.5, width: 0.9 })
      .moveTo(-7, -39)
      .lineTo(0, -36)
      .lineTo(7, -39)
      .stroke({ color: secondary, alpha: 0.42, width: 1 });

    this.runeCore
      .circle(0, -19, 6.5)
      .stroke({ color: rune, alpha: 0.9, width: 1.5 })
      .circle(0, -19, 3)
      .fill({ color: rune, alpha: 0.5 })
      .moveTo(0, -29)
      .lineTo(4, -23)
      .lineTo(10, -19)
      .lineTo(4, -15)
      .lineTo(0, -9)
      .lineTo(-4, -15)
      .lineTo(-10, -19)
      .lineTo(-4, -23)
      .closePath()
      .stroke({ color: 0xffffff, alpha: 0.32, width: 1 });

    if (this.appearance.weaponVisualFamily === 'greatblade') {
      this.weaponRune
        .moveTo(8, -3)
        .lineTo(43, -8)
        .lineTo(56, 0)
        .lineTo(43, 8)
        .lineTo(8, 3)
        .closePath()
        .stroke({ color: secondary, alpha: 0.72, width: 1.5 })
        .moveTo(20, 0)
        .lineTo(50, 0)
        .stroke({ color: rune, alpha: 0.66, width: 1.3 });
    } else if (this.appearance.weaponVisualFamily === 'riftlance') {
      this.weaponRune
        .moveTo(7, 0)
        .lineTo(65, 0)
        .stroke({ color: secondary, alpha: 0.76, width: 1.5 })
        .moveTo(56, -7)
        .lineTo(72, 0)
        .lineTo(56, 7)
        .closePath()
        .stroke({ color: rune, alpha: 0.84, width: 1.6 });
    } else {
      this.weaponRune
        .moveTo(8, 0)
        .lineTo(43, -3)
        .lineTo(51, 0)
        .lineTo(43, 3)
        .closePath()
        .stroke({ color: secondary, alpha: 0.72, width: 1.4 })
        .moveTo(20, 0)
        .lineTo(46, 0)
        .stroke({ color: rune, alpha: 0.62, width: 1.1 });
    }
    this.weaponRune.position.set(0, -7);
  }
}
