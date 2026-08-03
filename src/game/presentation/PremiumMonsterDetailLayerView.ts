import { Container, Graphics } from 'pixi.js';
import type { MonsterState } from '../actors/monsters/MonsterController';
import type { MonsterRank, MonsterVisualConfig } from '../combat/combatData';

export interface PremiumMonsterDetailPose {
  readonly elapsed: number;
  readonly state: MonsterState;
  readonly phase: number;
  readonly facingSign: -1 | 1;
  readonly flashRemaining: number;
  readonly alive: boolean;
}

export class PremiumMonsterDetailLayerView {
  public readonly back = new Container();
  public readonly front = new Container();
  private readonly silhouette = new Graphics();
  private readonly crown = new Graphics();
  private readonly core = new Graphics();
  private readonly claws = new Graphics();

  public constructor(
    private readonly rank: MonsterRank,
    private readonly radius: number,
    private readonly visual: MonsterVisualConfig,
  ) {
    this.drawStatic();
    this.back.addChild(this.silhouette);
    this.front.addChild(this.crown, this.core, this.claws);
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
    const flash = pose.flashRemaining > 0 ? 1.35 : 1;

    this.crown.scale.set(pose.facingSign, 1);
    this.crown.rotation = pose.facingSign * (telegraph * 0.025 - attack * 0.04);
    this.crown.alpha = Math.min(1, (0.54 + pulse * 0.18 + telegraph * 0.18) * flash);

    this.core.alpha = Math.min(1, (0.6 + pulse * 0.3 + telegraph * 0.16) * flash);
    this.core.scale.set(1 + pulse * 0.06 + (phaseStrength - 1) * 0.045);
    this.core.rotation = pose.elapsed * (this.rank === 'boss' ? 0.32 : 0.18) * pose.facingSign;

    this.silhouette.alpha = 0.28 + telegraph * 0.16 + pulse * 0.08;
    this.silhouette.scale.set(pose.facingSign, 1 + attack * 0.035);
    this.silhouette.rotation = -pose.facingSign * attack * 0.028;

    this.claws.alpha = 0.34 + attack * 0.36 + telegraph * 0.1;
    this.claws.scale.set(pose.facingSign, 1);
    this.claws.position.x = pose.facingSign * attack * 3;
  }

  private drawStatic(): void {
    const radius = this.radius;
    const accent = this.visual.accentColor;
    const body = this.visual.bodyColor;
    const eye = this.visual.eyeColor;
    const bossScale = this.rank === 'boss' ? 1.2 : 1;

    this.silhouette
      .moveTo(-radius * 0.95, -radius * 0.4)
      .lineTo(-radius * 1.22, -radius * 0.78)
      .lineTo(-radius * 0.72, -radius * 0.68)
      .lineTo(-radius * 0.5, -radius * 1.02)
      .lineTo(-radius * 0.2, -radius * 0.72)
      .stroke({ color: body, alpha: 0.64, width: 3 })
      .moveTo(radius * 0.95, -radius * 0.4)
      .lineTo(radius * 1.22, -radius * 0.78)
      .lineTo(radius * 0.72, -radius * 0.68)
      .lineTo(radius * 0.5, -radius * 1.02)
      .lineTo(radius * 0.2, -radius * 0.72)
      .stroke({ color: accent, alpha: 0.64, width: 3 });

    const crownY = -radius * 0.86;
    this.crown
      .moveTo(-radius * 0.56, crownY)
      .lineTo(-radius * 0.34, crownY - radius * 0.62 * bossScale)
      .lineTo(-radius * 0.1, crownY - radius * 0.22)
      .lineTo(0, crownY - radius * 0.72 * bossScale)
      .lineTo(radius * 0.1, crownY - radius * 0.22)
      .lineTo(radius * 0.34, crownY - radius * 0.62 * bossScale)
      .lineTo(radius * 0.56, crownY)
      .stroke({ color: accent, alpha: 0.82, width: this.rank === 'boss' ? 3.2 : 2.4 })
      .moveTo(-radius * 0.4, crownY - radius * 0.04)
      .lineTo(0, crownY - radius * 0.18)
      .lineTo(radius * 0.4, crownY - radius * 0.04)
      .stroke({ color: 0xf3dfb0, alpha: 0.54, width: 1.4 });

    const coreY = -radius * 0.12;
    const coreRadius = radius * (this.rank === 'boss' ? 0.24 : 0.19);
    this.core
      .circle(0, coreY, coreRadius)
      .fill({ color: accent, alpha: 0.2 })
      .stroke({ color: accent, alpha: 0.9, width: this.rank === 'boss' ? 3 : 2 })
      .circle(0, coreY, coreRadius * 0.45)
      .fill({ color: eye, alpha: 0.76 })
      .moveTo(0, coreY - coreRadius * 1.6)
      .lineTo(coreRadius * 0.65, coreY - coreRadius * 0.55)
      .lineTo(coreRadius * 1.5, coreY)
      .lineTo(coreRadius * 0.65, coreY + coreRadius * 0.55)
      .lineTo(0, coreY + coreRadius * 1.6)
      .lineTo(-coreRadius * 0.65, coreY + coreRadius * 0.55)
      .lineTo(-coreRadius * 1.5, coreY)
      .lineTo(-coreRadius * 0.65, coreY - coreRadius * 0.55)
      .closePath()
      .stroke({ color: 0xffffff, alpha: 0.34, width: 1.2 });

    const clawY = radius * 0.52;
    for (const side of [-1, 1] as const) {
      const x = side * radius * 0.62;
      this.claws
        .moveTo(x, clawY)
        .lineTo(x + side * radius * 0.32, clawY + radius * 0.22)
        .lineTo(x + side * radius * 0.12, clawY + radius * 0.08)
        .stroke({ color: side < 0 ? body : accent, alpha: 0.72, width: 2.2 });
    }
  }
}
