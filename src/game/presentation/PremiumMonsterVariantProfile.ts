import type { MonsterRank, MonsterVisualConfig } from '../combat/combatData';

export const PREMIUM_MONSTER_VARIANT_SCHEMA = 'lumerift-premium-monster-runtime-v2' as const;

export type PremiumMonsterVariant = 'normal' | 'void-warden' | 'lumen-mender' | 'abyssal-harbinger' | 'elite-generic';

export interface PremiumMonsterVariantProfile {
  readonly variant: PremiumMonsterVariant;
  readonly crestSpikes: number;
  readonly shoulderSpikes: number;
  readonly jawFangs: number;
  readonly phaseShards: number;
  readonly motionWeight: number;
  readonly primaryColor: number;
  readonly secondaryColor: number;
  readonly coreColor: number;
  readonly label: string;
}

export function resolvePremiumMonsterVariant(
  monsterId: string,
  rank: MonsterRank,
  visual: MonsterVisualConfig,
): PremiumMonsterVariantProfile {
  if (rank === 'normal') {
    return {
      variant: 'normal',
      crestSpikes: 0,
      shoulderSpikes: 0,
      jawFangs: 0,
      phaseShards: 0,
      motionWeight: 0.8,
      primaryColor: visual.bodyColor,
      secondaryColor: visual.accentColor,
      coreColor: visual.eyeColor,
      label: 'NORMAL',
    };
  }
  if (monsterId === 'monster_warden') {
    return {
      variant: 'void-warden',
      crestSpikes: 5,
      shoulderSpikes: 4,
      jawFangs: 2,
      phaseShards: 4,
      motionWeight: 1.06,
      primaryColor: 0x6d4bd8,
      secondaryColor: 0x9f7cff,
      coreColor: 0x73f7e1,
      label: 'VOID WARDEN',
    };
  }
  if (monsterId === 'monster_mender') {
    return {
      variant: 'lumen-mender',
      crestSpikes: 4,
      shoulderSpikes: 3,
      jawFangs: 1,
      phaseShards: 5,
      motionWeight: 0.92,
      primaryColor: 0x2f786d,
      secondaryColor: 0x66f4d1,
      coreColor: 0xffd982,
      label: 'LUMEN MENDER',
    };
  }
  if (rank === 'boss' || monsterId === 'boss_harbinger') {
    return {
      variant: 'abyssal-harbinger',
      crestSpikes: 7,
      shoulderSpikes: 6,
      jawFangs: 4,
      phaseShards: 10,
      motionWeight: 1.24,
      primaryColor: 0x43276f,
      secondaryColor: 0xc488ff,
      coreColor: 0xffd77c,
      label: 'ABYSSAL HARBINGER',
    };
  }
  return {
    variant: 'elite-generic',
    crestSpikes: 4,
    shoulderSpikes: 4,
    jawFangs: 2,
    phaseShards: 4,
    motionWeight: 1,
    primaryColor: visual.bodyColor,
    secondaryColor: visual.accentColor,
    coreColor: visual.eyeColor,
    label: 'ELITE',
  };
}
