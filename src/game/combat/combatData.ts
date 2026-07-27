export type CombatActionKind = 'basic' | 'skill1' | 'skill2';
export type HitShape = 'arc' | 'circle';
export type StatusEffectId = 'burn' | 'slow';
export type MonsterRank = 'normal' | 'elite' | 'boss';
export type MonsterTargetMode = 'self' | 'playerLocked';
export type StageNodeType = 'normal' | 'elite' | 'boss';

export interface StatusEffectApplication {
  readonly id: StatusEffectId;
  readonly chance: number;
  readonly duration: number;
  readonly potency: number;
  readonly tickInterval?: number;
}

export interface CombatActionConfig {
  readonly id: string;
  readonly label: string;
  readonly kind: CombatActionKind;
  readonly duration: number;
  readonly hitTime: number;
  readonly damageMultiplier: number;
  readonly range: number;
  readonly halfAngleRadians: number;
  readonly hitShape: HitShape;
  readonly cooldown: number;
  readonly hitStop: number;
  readonly shake: number;
  readonly lungeDistance: number;
  readonly effectColor: number;
  readonly statusEffect?: StatusEffectApplication;
}

export interface PlayerCombatConfig {
  readonly id: string;
  readonly name: string;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly moveSpeed: number;
  readonly radius: number;
  readonly hitRecovery: number;
  readonly dodge: {
    readonly duration: number;
    readonly speed: number;
    readonly cooldown: number;
    readonly invulnerability: number;
  };
  readonly combo: readonly CombatActionConfig[];
  readonly skills: Readonly<Record<'skill1' | 'skill2', CombatActionConfig>>;
}

export interface MonsterPatternConfig {
  readonly id: string;
  readonly label: string;
  readonly shape: HitShape;
  readonly targetMode: MonsterTargetMode;
  readonly damageMultiplier: number;
  readonly range: number;
  readonly triggerRange: number;
  readonly halfAngleRadians: number;
  readonly cooldown: number;
  readonly windup: number;
  readonly duration: number;
  readonly effectColor: number;
}

export interface MonsterCombatConfig {
  readonly id: string;
  readonly name: string;
  readonly rank: MonsterRank;
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly radius: number;
  readonly moveSpeed: number;
  readonly detectionRange: number;
  readonly hitRecovery: number;
  readonly statusDurationMultiplier: number;
  readonly patterns: readonly MonsterPatternConfig[];
}

export interface MonsterVisualConfig {
  readonly bodyColor: number;
  readonly accentColor: number;
  readonly eyeColor: number;
}

export interface MonsterDefinition {
  readonly combat: MonsterCombatConfig;
  readonly visual: MonsterVisualConfig;
}

export interface StageEnemySpawn {
  readonly monsterId: string;
  readonly x: number;
  readonly y: number;
}

export interface StageWaveConfig {
  readonly id: string;
  readonly label: string;
  readonly spawnDelay: number;
  readonly enemies: readonly StageEnemySpawn[];
}

export interface StageRewardBundle {
  readonly exp: number;
  readonly gold: number;
  readonly itemIds: readonly string[];
}

export interface StageConfig {
  readonly id: string;
  readonly order: number;
  readonly label: string;
  readonly areaName: string;
  readonly description: string;
  readonly nodeType: StageNodeType;
  readonly recommendedPower: number;
  readonly previousStageId?: string;
  readonly playerSpawn: {
    readonly x: number;
    readonly y: number;
  };
  readonly rewards: {
    readonly exp: number;
    readonly gold: number;
    readonly firstClear: StageRewardBundle;
    readonly dropTable: readonly {
      readonly itemId: string;
      readonly chance: number;
    }[];
  };
  readonly waves: readonly StageWaveConfig[];
}
