import type { CharacterShowcasePose } from '../../core/presentation/CharacterWardrobeController';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';

export const PREMIUM_CHARACTER_PRODUCTION_SCHEMA = 'lumerift-premium-character-production-v1' as const;

export const PREMIUM_CHARACTER_DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
export type PremiumCharacterDirection = typeof PREMIUM_CHARACTER_DIRECTIONS[number];

export type PremiumCharacterLayer = 'body' | 'face' | 'armor' | 'cape' | 'rune' | 'weapon';

export interface PremiumCharacterActionSpec {
  readonly pose: CharacterShowcasePose | 'hit' | 'death';
  readonly frames: number;
  readonly fps: number;
  readonly loop: boolean;
  readonly contactFrame?: number;
  readonly readabilityCue: string;
}

export interface PremiumWeaponProductionSpec {
  readonly family: WeaponVisualFamily;
  readonly label: string;
  readonly silhouette: string;
  readonly attackAxis: string;
  readonly weaponLengthRatio: number;
  readonly capeLagFrames: number;
  readonly runePeakFrameOffset: number;
}

export interface PremiumCharacterProductionTotals {
  readonly directions: number;
  readonly weaponFamilies: number;
  readonly actionsPerFamily: number;
  readonly framesPerDirection: number;
  readonly bodyFrames: number;
  readonly layeredFramePlacements: number;
}

export const PREMIUM_CHARACTER_ACTIONS: readonly PremiumCharacterActionSpec[] = [
  { pose: 'idle', frames: 8, fps: 10, loop: true, readabilityCue: '흉부 룬 호흡과 망토 미세 흔들림' },
  { pose: 'run', frames: 8, fps: 14, loop: true, readabilityCue: '발 위치와 무기 후방 실루엣 분리' },
  { pose: 'attack1', frames: 6, fps: 18, loop: false, contactFrame: 3, readabilityCue: '짧은 선행 후 첫 타격축 강조' },
  { pose: 'attack2', frames: 6, fps: 18, loop: false, contactFrame: 3, readabilityCue: '반대 방향 회전과 망토 관성' },
  { pose: 'attack3', frames: 7, fps: 17, loop: false, contactFrame: 4, readabilityCue: '강한 마무리 자세와 룬 피크' },
  { pose: 'skill1', frames: 8, fps: 16, loop: false, contactFrame: 5, readabilityCue: '무기 계열 룬 문법과 중심 충격' },
  { pose: 'skill2', frames: 10, fps: 16, loop: false, contactFrame: 6, readabilityCue: '오버드라이브 발광과 실루엣 확장' },
  { pose: 'dodge', frames: 6, fps: 20, loop: false, readabilityCue: '머리·갑주 중심축 유지와 잔상' },
  { pose: 'hit', frames: 4, fps: 16, loop: false, readabilityCue: '피격 방향과 흰색 플래시 판독' },
  { pose: 'death', frames: 10, fps: 12, loop: false, readabilityCue: '무기·망토·본체 순차 붕괴' },
] as const;

export const PREMIUM_WEAPON_PRODUCTION_SPECS: Readonly<Record<WeaponVisualFamily, PremiumWeaponProductionSpec>> = {
  blade: {
    family: 'blade',
    label: '계승자의 검',
    silhouette: '가늘고 선명한 직선 칼날, 손목 중심 회전',
    attackAxis: '대각선 절단과 빠른 회수',
    weaponLengthRatio: 0.82,
    capeLagFrames: 1,
    runePeakFrameOffset: 0,
  },
  greatblade: {
    family: 'greatblade',
    label: '균열 대검',
    silhouette: '넓은 칼등과 무게 중심이 낮은 쐐기형',
    attackAxis: '큰 호와 지면 압력, 늦은 회수',
    weaponLengthRatio: 1.02,
    capeLagFrames: 2,
    runePeakFrameOffset: 1,
  },
  riftlance: {
    family: 'riftlance',
    label: '균열 장창',
    silhouette: '긴 직선 축과 삼각형 룬 창날',
    attackAxis: '전방 찌르기와 직선 전진',
    weaponLengthRatio: 1.18,
    capeLagFrames: 1,
    runePeakFrameOffset: -1,
  },
};

export const PREMIUM_CHARACTER_LAYER_ORDER: readonly PremiumCharacterLayer[] = [
  'cape',
  'body',
  'armor',
  'face',
  'weapon',
  'rune',
] as const;

export function premiumCharacterProductionTotals(): PremiumCharacterProductionTotals {
  const framesPerDirection = PREMIUM_CHARACTER_ACTIONS.reduce((sum, action) => sum + action.frames, 0);
  const weaponFamilies = Object.keys(PREMIUM_WEAPON_PRODUCTION_SPECS).length;
  const bodyFrames = framesPerDirection * PREMIUM_CHARACTER_DIRECTIONS.length * weaponFamilies;
  return {
    directions: PREMIUM_CHARACTER_DIRECTIONS.length,
    weaponFamilies,
    actionsPerFamily: PREMIUM_CHARACTER_ACTIONS.length,
    framesPerDirection,
    bodyFrames,
    layeredFramePlacements: bodyFrames * PREMIUM_CHARACTER_LAYER_ORDER.length,
  };
}
