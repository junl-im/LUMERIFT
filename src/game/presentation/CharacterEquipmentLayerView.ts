import { Container, Graphics } from 'pixi.js';
import type { PlayerState } from '../actors/player/PlayerCombatController';
import type { CharacterEquipmentAppearance } from './CharacterEquipmentVisualProfile';

export interface CharacterEquipmentLayerPose {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotation: number;
  readonly facingX: number;
  readonly elapsed: number;
  readonly actionProgress: number;
  readonly state: PlayerState | 'showcase';
  readonly overdrive: boolean;
}

export class CharacterEquipmentLayerView {
  public readonly back = new Container();
  public readonly front = new Container();
  private readonly cape = new Graphics();
  private readonly armor = new Graphics();
  private readonly rune = new Graphics();
  private pose: CharacterEquipmentLayerPose = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    facingX: 0,
    elapsed: 0,
    actionProgress: 0,
    state: 'showcase',
    overdrive: false,
  };

  public constructor(private readonly appearance: CharacterEquipmentAppearance) {
    this.drawCape();
    this.drawArmor();
    this.drawRune();
    this.back.addChild(this.cape);
    this.front.addChild(this.armor, this.rune);
    this.tick(0);
  }

  public update(pose: CharacterEquipmentLayerPose): void {
    this.pose = pose;
    this.applyTransform();
    this.tick(pose.elapsed);
  }

  public tick(elapsed: number): void {
    const pulse = 0.82 + Math.sin(elapsed * 3.2) * 0.18;
    const action = this.pose.state === 'attacking' || this.pose.state === 'skill'
      ? Math.sin(this.pose.actionProgress * Math.PI)
      : 0;
    const capeDirection = this.pose.facingX >= 0 ? -1 : 1;
    const capeWeight = this.appearance.capeLayerMask === 'harbinger-banner'
      ? 0.055
      : this.appearance.capeLayerMask === 'warden-split'
        ? 0.044
        : 0.034;
    this.cape.rotation = capeDirection * (capeWeight + action * 0.09) + Math.sin(elapsed * 2.1) * 0.018;
    this.cape.position.set(-this.pose.facingX * 3, action * 1.4);
    this.armor.alpha = this.pose.state === 'dodging' ? 0.58 : 0.74 + action * 0.08;
    this.armor.scale.set(1 + action * 0.018, 1 - action * 0.012);
    this.rune.alpha = (this.pose.overdrive ? 0.98 : 0.56 + pulse * 0.22) * this.appearance.auraStrength;
    this.rune.scale.set(this.pose.overdrive ? 1.12 + pulse * 0.05 : 0.96 + pulse * 0.04);
    const runeDirection = this.appearance.runeLayerMask === 'rift-crown' ? -1 : 1;
    const runeSpeed = this.appearance.runeLayerMask === 'core-hex' ? 0.08 : 0.13;
    this.rune.rotation = runeDirection * Math.sin(elapsed * runeSpeed * 10) * 0.045;
  }

  private applyTransform(): void {
    for (const layer of [this.back, this.front]) {
      layer.position.set(this.pose.x, this.pose.y);
      layer.scale.set(this.pose.scaleX, this.pose.scaleY);
      layer.rotation = this.pose.rotation;
    }
  }

  private drawCape(): void {
    const cape = this.cape;
    cape.clear();
    const color = this.appearance.secondaryColor;
    const outline = this.appearance.primaryColor;

    if (this.appearance.capeLayerMask === 'warden-split') {
      cape
        .poly([-19, -35, -3, -33, -5, 8, -13, 25, -22, 14, -24, -2])
        .fill({ color, alpha: 0.34 })
        .stroke({ color: outline, alpha: 0.56, width: 1.5 });
      cape
        .poly([3, -33, 19, -35, 24, -2, 22, 14, 13, 25, 5, 8])
        .fill({ color, alpha: 0.34 })
        .stroke({ color: outline, alpha: 0.56, width: 1.5 });
      cape.moveTo(-8, -28).lineTo(-12, 12).stroke({ color: this.appearance.runeColor, alpha: 0.3, width: 1.1 });
      cape.moveTo(8, -28).lineTo(12, 12).stroke({ color: this.appearance.runeColor, alpha: 0.3, width: 1.1 });
    } else if (this.appearance.capeLayerMask === 'harbinger-banner') {
      cape
        .poly([-20, -37, 20, -37, 24, 15, 13, 38, 0, 27, -13, 38, -24, 15])
        .fill({ color, alpha: 0.32 })
        .stroke({ color: outline, alpha: 0.62, width: 1.6 });
      cape
        .poly([-13, -29, 13, -29, 10, 18, 0, 25, -10, 18])
        .stroke({ color: this.appearance.runeColor, alpha: 0.4, width: 1.4 });
      cape.circle(0, -24, 3).fill({ color: this.appearance.runeColor, alpha: 0.45 });
    } else {
      cape
        .poly([-16, -34, 16, -34, 19, 3, 9, 16, 0, 20, -9, 16, -19, 3])
        .fill({ color, alpha: 0.3 })
        .stroke({ color: outline, alpha: 0.5, width: 1.3 });
      cape.moveTo(-10, -24).lineTo(0, 12).lineTo(10, -24).stroke({ color: this.appearance.runeColor, alpha: 0.25, width: 1 });
    }
    cape.position.set(0, -7);
  }

  private drawArmor(): void {
    const armor = this.armor;
    armor.clear();

    if (this.appearance.armorLayerMask === 'harbinger-crown') {
      armor
        .poly([-21, -31, -11, -38, -4, -33, 0, -40, 4, -33, 11, -38, 21, -31, 17, 7, 8, 14, -8, 14, -17, 7])
        .fill({ color: this.appearance.primaryColor, alpha: 0.23 })
        .stroke({ color: this.appearance.secondaryColor, alpha: 0.72, width: 1.7 });
      armor
        .poly([-29, -27, -18, -35, -12, -22, -21, -16])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.48 });
      armor
        .poly([29, -27, 18, -35, 12, -22, 21, -16])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.48 });
      armor.moveTo(-13, -9).lineTo(0, 4).lineTo(13, -9).stroke({ color: this.appearance.runeColor, alpha: 0.5, width: 1.4 });
    } else if (this.appearance.armorLayerMask === 'warden-bastion') {
      armor
        .roundRect(-18, -34, 36, 41, 7)
        .fill({ color: this.appearance.primaryColor, alpha: 0.22 })
        .stroke({ color: this.appearance.secondaryColor, alpha: 0.68, width: 1.7 });
      armor
        .poly([-28, -29, -16, -36, -12, -19, -25, -15])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.44 });
      armor
        .poly([28, -29, 16, -36, 12, -19, 25, -15])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.44 });
      armor.roundRect(-12, -24, 24, 16, 4).stroke({ color: this.appearance.runeColor, alpha: 0.36, width: 1.2 });
      armor.moveTo(0, -24).lineTo(0, -8).stroke({ color: this.appearance.runeColor, alpha: 0.42, width: 1 });
    } else {
      armor
        .poly([-14, -31, -8, -35, 0, -30, 8, -35, 14, -31, 12, 3, 0, 10, -12, 3])
        .fill({ color: this.appearance.primaryColor, alpha: 0.2 })
        .stroke({ color: this.appearance.secondaryColor, alpha: 0.58, width: 1.4 });
      armor
        .poly([-21, -27, -13, -33, -9, -21, -18, -17])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.36 });
      armor
        .poly([21, -27, 13, -33, 9, -21, 18, -17])
        .fill({ color: this.appearance.secondaryColor, alpha: 0.36 });
      armor.moveTo(-9, -13).lineTo(0, -6).lineTo(9, -13).stroke({ color: this.appearance.runeColor, alpha: 0.32, width: 1 });
    }
    armor.position.set(0, -7);
  }

  private drawRune(): void {
    const rune = this.rune;
    rune.clear();

    if (this.appearance.runeLayerMask === 'rift-crown') {
      rune
        .poly([0, -31, 5, -25, 11, -27, 9, -19, 13, -14, 5, -14, 0, -9, -5, -14, -13, -14, -9, -19, -11, -27, -5, -25])
        .stroke({ color: this.appearance.runeColor, alpha: 0.94, width: 1.8 })
        .circle(0, -20, 6)
        .stroke({ color: 0xffffff, alpha: 0.62, width: 1.1 })
        .circle(0, -20, 2.6)
        .fill({ color: this.appearance.runeColor, alpha: 0.82 });
    } else if (this.appearance.runeLayerMask === 'core-hex') {
      rune
        .poly([0, -30, 9, -25, 9, -15, 0, -10, -9, -15, -9, -25])
        .stroke({ color: this.appearance.runeColor, alpha: 0.94, width: 1.8 })
        .poly([0, -27, 6, -23, 6, -17, 0, -13, -6, -17, -6, -23])
        .stroke({ color: 0xffffff, alpha: 0.56, width: 1.1 })
        .circle(0, -20, 2.4)
        .fill({ color: this.appearance.runeColor, alpha: 0.78 });
    } else {
      rune
        .circle(0, -20, 8)
        .stroke({ color: this.appearance.runeColor, alpha: 0.92, width: 1.7 })
        .circle(0, -20, 4.5)
        .stroke({ color: 0xffffff, alpha: 0.5, width: 1 })
        .poly([0, -29, 3, -23, 9, -20, 3, -17, 0, -11, -3, -17, -9, -20, -3, -23])
        .stroke({ color: this.appearance.runeColor, alpha: 0.7, width: 1.1 })
        .circle(0, -20, 2.2)
        .fill({ color: this.appearance.runeColor, alpha: 0.76 });
    }
  }
}
