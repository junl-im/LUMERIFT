import type { PlayerState } from '../actors/player/PlayerCombatController';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';

export const PREMIUM_CHARACTER_RUNTIME_SCHEMA = 'lumerift-premium-character-runtime-v2' as const;

export type PremiumCharacterRuntimeState = PlayerState | 'showcase';

export interface PremiumWeaponSilhouetteProfile {
  readonly family: WeaponVisualFamily;
  readonly bladeLength: number;
  readonly bladeWidth: number;
  readonly guardWidth: number;
  readonly motionArc: number;
  readonly thrustBias: number;
  readonly echoCount: number;
  readonly cadenceLabel: string;
}

export interface PremiumCharacterRuntimeTuning {
  readonly hairSweep: number;
  readonly faceLightAlpha: number;
  readonly shoulderScale: number;
  readonly capeWidth: number;
  readonly capeLength: number;
  readonly runeScale: number;
}

const WEAPON_PROFILES: Readonly<Record<WeaponVisualFamily, PremiumWeaponSilhouetteProfile>> = {
  blade: {
    family: 'blade',
    bladeLength: 50,
    bladeWidth: 4.2,
    guardWidth: 14,
    motionArc: 0.92,
    thrustBias: 0.18,
    echoCount: 2,
    cadenceLabel: '정밀 연격',
  },
  greatblade: {
    family: 'greatblade',
    bladeLength: 64,
    bladeWidth: 9.5,
    guardWidth: 22,
    motionArc: 1.18,
    thrustBias: 0.04,
    echoCount: 3,
    cadenceLabel: '중량 절단',
  },
  riftlance: {
    family: 'riftlance',
    bladeLength: 76,
    bladeWidth: 3.4,
    guardWidth: 11,
    motionArc: 0.46,
    thrustBias: 0.82,
    echoCount: 3,
    cadenceLabel: '직선 관통',
  },
};

export function premiumWeaponSilhouetteProfile(family: WeaponVisualFamily): PremiumWeaponSilhouetteProfile {
  return WEAPON_PROFILES[family];
}

export function resolvePremiumCharacterRuntimeTuning(input: {
  readonly armorSilhouette: string;
  readonly capeStyle: string;
  readonly auraStrength: number;
}): PremiumCharacterRuntimeTuning {
  const armorWeight = input.armorSilhouette === 'royal' ? 1.16 : input.armorSilhouette === 'guarded' ? 1.08 : 0.96;
  const capeWidth = input.capeStyle.includes('banner') ? 1.18 : input.capeStyle.includes('split') ? 1.08 : 0.94;
  const capeLength = input.capeStyle.includes('banner') ? 1.2 : input.capeStyle.includes('short') ? 0.86 : 1.04;
  return {
    hairSweep: input.armorSilhouette === 'royal' ? 0.86 : 1,
    faceLightAlpha: Math.min(0.78, 0.34 + input.auraStrength * 0.22),
    shoulderScale: armorWeight,
    capeWidth,
    capeLength,
    runeScale: Math.min(1.18, 0.9 + input.auraStrength * 0.14),
  };
}

export function premiumCharacterActionWeight(
  state: PremiumCharacterRuntimeState,
  progress: number,
  comboStep = 1,
): number {
  const normalized = Math.max(0, Math.min(1, progress));
  if (state === 'skill') return 0.92 + Math.sin(normalized * Math.PI) * 0.08;
  if (state === 'attacking' || state === 'showcase') {
    const comboBoost = Math.max(0, Math.min(3, comboStep)) * 0.06;
    return Math.min(1.16, 0.72 + Math.sin(normalized * Math.PI) * 0.32 + comboBoost);
  }
  if (state === 'dodging') return 0.46;
  if (state === 'hit') return 0.28;
  return 0.34;
}
