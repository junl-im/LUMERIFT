import type { CombatActionConfig, PlayerCombatConfig } from './combatData';
import type { WeaponVisualFamily } from '../presentation/CharacterEquipmentVisualProfile';

export interface WeaponAttackTimingProfile {
  readonly anticipationRatio: number;
  readonly contactRatio: number;
  readonly recoveryRatio: number;
  readonly bodyAnimationSpeed: number;
  readonly poseTravel: number;
  readonly rotationWeight: number;
}

export interface WeaponMotionProfile {
  readonly family: WeaponVisualFamily;
  readonly label: string;
  readonly cadenceLabel: string;
  readonly reachLabel: string;
  readonly impactLabel: string;
  readonly description: string;
  readonly comboTimings: readonly [WeaponAttackTimingProfile, WeaponAttackTimingProfile, WeaponAttackTimingProfile];
  readonly skillTiming: WeaponAttackTimingProfile;
}

const PROFILES: Readonly<Record<WeaponVisualFamily, WeaponMotionProfile>> = {
  blade: {
    family: 'blade',
    label: '균열검 연격',
    cadenceLabel: 'FAST',
    reachLabel: 'MID',
    impactLabel: 'LIGHT',
    description: '짧은 선행과 빠른 회수, 교차 베기 중심의 본체 프레임으로 수동 입력 반응을 우선합니다.',
    comboTimings: [
      timing(0.18, 0.34, 0.48, 0.31, 6, 0.72),
      timing(0.16, 0.32, 0.52, 0.3, 7, -0.78),
      timing(0.2, 0.38, 0.42, 0.28, 9, 0.94),
    ],
    skillTiming: timing(0.24, 0.42, 0.34, 0.24, 11, 0.8),
  },
  greatblade: {
    family: 'greatblade',
    label: '대검 중량식',
    cadenceLabel: 'HEAVY',
    reachLabel: 'WIDE',
    impactLabel: 'HIGH',
    description: '긴 축적과 넓은 절단각, 접촉 직후 긴 회수 프레임으로 무게와 타격 정지를 분리합니다.',
    comboTimings: [
      timing(0.34, 0.48, 0.18, 0.19, 4, 1.05),
      timing(0.38, 0.5, 0.12, 0.18, 5, -1.12),
      timing(0.42, 0.56, 0.02, 0.17, 7, 1.24),
    ],
    skillTiming: timing(0.4, 0.55, 0.05, 0.17, 8, 1.18),
  },
  riftlance: {
    family: 'riftlance',
    label: '균열 장창 찌르기',
    cadenceLabel: 'PRECISE',
    reachLabel: 'LONG',
    impactLabel: 'FOCUSED',
    description: '짧은 축적 뒤 빠른 접촉 프레임과 긴 전진 거리로 직선 관통 타이밍을 강조합니다.',
    comboTimings: [
      timing(0.14, 0.27, 0.59, 0.28, 15, 0.3),
      timing(0.16, 0.3, 0.54, 0.26, 17, -0.24),
      timing(0.18, 0.32, 0.5, 0.24, 20, 0.18),
    ],
    skillTiming: timing(0.2, 0.34, 0.46, 0.23, 22, 0.24),
  },
};

export function resolveWeaponMotionProfile(family: WeaponVisualFamily): WeaponMotionProfile {
  return PROFILES[family];
}

export function resolveWeaponAttackTiming(
  family: WeaponVisualFamily,
  comboStep: number,
  skill = false,
): WeaponAttackTimingProfile {
  const profile = PROFILES[family];
  if (skill) return profile.skillTiming;
  const index = Math.max(0, Math.min(2, Math.floor(comboStep) - 1));
  return profile.comboTimings[index] ?? profile.comboTimings[0];
}

export function applyWeaponMotionProfile(
  config: PlayerCombatConfig,
  family: WeaponVisualFamily,
): PlayerCombatConfig {
  return {
    ...config,
    combo: config.combo.map((action, index) => tuneComboAction(action, family, index)),
    skills: {
      skill1: tuneSkillAction(config.skills.skill1, family, 'skill1'),
      skill2: tuneSkillAction(config.skills.skill2, family, 'skill2'),
    },
  };
}

function tuneComboAction(action: CombatActionConfig, family: WeaponVisualFamily, comboIndex: number): CombatActionConfig {
  const timingProfile = PROFILES[family].comboTimings[comboIndex] ?? PROFILES[family].comboTimings[0];
  if (family === 'greatblade') {
    const finisher = comboIndex === 2;
    const duration = round(action.duration * (finisher ? 1.2 : 1.12));
    return {
      ...action,
      duration,
      hitTime: round(duration * timingProfile.contactRatio),
      damageMultiplier: round(action.damageMultiplier * (finisher ? 1.12 : 1.07)),
      range: round(action.range + 12),
      halfAngleRadians: action.halfAngleRadians * 1.12,
      hitStop: round(action.hitStop + 0.018),
      shake: round(action.shake + 0.6),
      lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
      comboWindow: round(action.comboWindow + 0.06),
    };
  }
  if (family === 'riftlance') {
    const duration = round(action.duration * 1.02);
    return {
      ...action,
      duration,
      hitTime: round(duration * timingProfile.contactRatio),
      damageMultiplier: round(action.damageMultiplier * 1.04),
      range: round(action.range + 24),
      halfAngleRadians: action.halfAngleRadians * 0.82,
      lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
      comboWindow: round(action.comboWindow + 0.03),
    };
  }
  const duration = round(action.duration * 0.92);
  return {
    ...action,
    duration,
    hitTime: round(duration * timingProfile.contactRatio),
    lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
    comboWindow: round(action.comboWindow + 0.04),
  };
}

function tuneSkillAction(
  action: CombatActionConfig,
  family: WeaponVisualFamily,
  slot: 'skill1' | 'skill2',
): CombatActionConfig {
  const timingProfile = PROFILES[family].skillTiming;
  if (family === 'greatblade') {
    const duration = round(action.duration * 1.08);
    return {
      ...action,
      duration,
      hitTime: round(duration * timingProfile.contactRatio),
      damageMultiplier: round(action.damageMultiplier * (slot === 'skill2' ? 1.08 : 1.05)),
      range: round(action.range + 10),
      hitStop: round(action.hitStop + 0.02),
      shake: round(action.shake + 0.8),
      lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
    };
  }
  if (family === 'riftlance') {
    const duration = round(action.duration * 0.98);
    return {
      ...action,
      duration,
      hitTime: round(duration * timingProfile.contactRatio),
      range: round(action.range + (slot === 'skill2' ? 18 : 26)),
      lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
    };
  }
  const duration = round(action.duration * 0.96);
  return {
    ...action,
    duration,
    hitTime: round(duration * timingProfile.contactRatio),
    lungeDistance: round(action.lungeDistance + timingProfile.poseTravel),
  };
}

function timing(
  anticipationRatio: number,
  contactRatio: number,
  recoveryRatio: number,
  bodyAnimationSpeed: number,
  poseTravel: number,
  rotationWeight: number,
): WeaponAttackTimingProfile {
  return { anticipationRatio, contactRatio, recoveryRatio, bodyAnimationSpeed, poseTravel, rotationWeight };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
