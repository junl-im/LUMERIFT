import type { CombatActionConfig } from './combatData';

export type CombatStyleRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface CombatMomentumSnapshot {
  readonly drive: number;
  readonly maxDrive: number;
  readonly chain: number;
  readonly chainRemaining: number;
  readonly styleRank: CombatStyleRank;
  readonly styleMultiplier: number;
  readonly overdrive: boolean;
  readonly overdriveRemaining: number;
}

export interface SkillMomentumBoost {
  readonly multiplier: number;
  readonly empowered: boolean;
  readonly spent: number;
}

const MAX_DRIVE = 100;
const CHAIN_WINDOW = 2.25;
const OVERDRIVE_DURATION = 7;

export class CombatMomentumController {
  private driveValue = 0;
  private chainValue = 0;
  private chainRemainingValue = 0;
  private overdriveRemainingValue = 0;

  public update(deltaSeconds: number): void {
    const delta = Math.max(0, deltaSeconds);
    this.chainRemainingValue = Math.max(0, this.chainRemainingValue - delta);
    if (this.chainRemainingValue <= 0) this.chainValue = 0;

    if (this.overdriveRemainingValue > 0) {
      this.overdriveRemainingValue = Math.max(0, this.overdriveRemainingValue - delta);
      this.driveValue = Math.max(0, this.driveValue - delta * 8.5);
    } else if (this.chainValue === 0) {
      this.driveValue = Math.max(0, this.driveValue - delta * 1.2);
    }
  }

  public prepareSkill(action: CombatActionConfig): SkillMomentumBoost {
    if (action.kind === 'basic' || action.driveCost <= 0) {
      return { multiplier: this.passiveDamageMultiplier, empowered: false, spent: 0 };
    }

    const canEmpower = this.driveValue >= action.driveCost;
    if (!canEmpower) {
      return { multiplier: this.passiveDamageMultiplier, empowered: false, spent: 0 };
    }

    this.driveValue = Math.max(0, this.driveValue - action.driveCost);
    const impactBonus = action.impactTier === 'ultimate' ? 0.34 : 0.2;
    return {
      multiplier: this.passiveDamageMultiplier + impactBonus,
      empowered: true,
      spent: action.driveCost,
    };
  }

  public registerHit(action: CombatActionConfig, targets: number, criticals: number): void {
    if (targets <= 0) return;
    const targetBonus = Math.max(0, targets - 1) * 2;
    const criticalBonus = Math.max(0, criticals) * 2.5;
    this.driveValue = Math.min(MAX_DRIVE, this.driveValue + action.driveGain + targetBonus + criticalBonus);
    this.chainValue = Math.min(999, this.chainValue + Math.max(1, targets));
    this.chainRemainingValue = Math.max(CHAIN_WINDOW, action.comboWindow + 1.35);

    if (this.driveValue >= MAX_DRIVE && this.overdriveRemainingValue <= 0) {
      this.overdriveRemainingValue = OVERDRIVE_DURATION;
    }
  }

  public registerDefeat(): void {
    this.driveValue = Math.min(MAX_DRIVE, this.driveValue + 5);
    this.chainRemainingValue = Math.max(this.chainRemainingValue, CHAIN_WINDOW);
  }

  public registerPerfectDodge(): void {
    this.driveValue = Math.min(MAX_DRIVE, this.driveValue + 18);
    this.chainValue = Math.min(999, this.chainValue + 2);
    this.chainRemainingValue = CHAIN_WINDOW + 0.5;
    if (this.driveValue >= MAX_DRIVE && this.overdriveRemainingValue <= 0) {
      this.overdriveRemainingValue = OVERDRIVE_DURATION;
    }
  }

  public resetChain(): void {
    this.chainValue = 0;
    this.chainRemainingValue = 0;
  }

  public get passiveDamageMultiplier(): number {
    const styleBonus = Math.min(0.18, this.chainValue * 0.006);
    const overdriveBonus = this.overdriveRemainingValue > 0 ? 0.2 : 0;
    return 1 + styleBonus + overdriveBonus;
  }

  public snapshot(): CombatMomentumSnapshot {
    return {
      drive: this.driveValue,
      maxDrive: MAX_DRIVE,
      chain: this.chainValue,
      chainRemaining: this.chainRemainingValue,
      styleRank: resolveStyleRank(this.chainValue),
      styleMultiplier: this.passiveDamageMultiplier,
      overdrive: this.overdriveRemainingValue > 0,
      overdriveRemaining: this.overdriveRemainingValue,
    };
  }
}

export function resolveStyleRank(chain: number): CombatStyleRank {
  if (chain >= 32) return 'SS';
  if (chain >= 22) return 'S';
  if (chain >= 14) return 'A';
  if (chain >= 8) return 'B';
  if (chain >= 3) return 'C';
  return 'D';
}

export function styleRankColor(rank: CombatStyleRank): number {
  if (rank === 'SS') return 0xffd36a;
  if (rank === 'S') return 0xd9a7ff;
  if (rank === 'A') return 0x7fffd4;
  if (rank === 'B') return 0x7cc8ff;
  if (rank === 'C') return 0xb8c7d8;
  return 0x788793;
}
