import type { MonsterRank } from '../combat/combatData';

export const PREMIUM_MONSTER_PRODUCTION_SCHEMA = 'lumerift-premium-monster-production-v1' as const;

export type PremiumMonsterElement = 'void' | 'frost' | 'inferno' | 'lumen';

export interface PremiumMonsterProductionEntry {
  readonly id: string;
  readonly label: string;
  readonly rank: Extract<MonsterRank, 'elite' | 'boss'>;
  readonly element: PremiumMonsterElement;
  readonly silhouette: string;
  readonly weakPoint: string;
  readonly signatureMotion: string;
  readonly directions: 8;
  readonly plannedFrames: number;
  readonly initialBundle: false;
}

export const PREMIUM_MONSTER_PRODUCTION_PLAN: readonly PremiumMonsterProductionEntry[] = [
  {
    id: 'elite_void_warden',
    label: '공허 감시자',
    rank: 'elite',
    element: 'void',
    silhouette: '전방으로 기운 뿔과 등 크리스털 능선',
    weakPoint: '흉부 보랏빛 균열 코어',
    signatureMotion: '반월 절단 후 공허 파동',
    directions: 8,
    plannedFrames: 192,
    initialBundle: false,
  },
  {
    id: 'elite_frost_mauler',
    label: '빙결 파쇄수',
    rank: 'elite',
    element: 'frost',
    silhouette: '넓은 전완과 얼음 쐐기 어깨',
    weakPoint: '등 중앙의 청백색 결정핵',
    signatureMotion: '지면 강타와 서리 부채꼴',
    directions: 8,
    plannedFrames: 176,
    initialBundle: false,
  },
  {
    id: 'elite_inferno_stalker',
    label: '홍염 추적수',
    rank: 'elite',
    element: 'inferno',
    silhouette: '낮은 사족 자세와 갈라진 화염 꼬리',
    weakPoint: '목 아래 주황색 용융핵',
    signatureMotion: '도약 물기와 잔불 궤적',
    directions: 8,
    plannedFrames: 184,
    initialBundle: false,
  },
  {
    id: 'boss_abyssal_crown',
    label: '심연관의 군주',
    rank: 'boss',
    element: 'lumen',
    silhouette: '왕관형 뿔, 갑주 흉곽, 삼중 꼬리 룬',
    weakPoint: '3단계로 개방되는 왕관 코어',
    signatureMotion: '3페이즈 룬 장벽·돌진·균열 폭발',
    directions: 8,
    plannedFrames: 384,
    initialBundle: false,
  },
] as const;

export interface PremiumMonsterPlanTotals {
  readonly eliteCount: number;
  readonly bossCount: number;
  readonly plannedFrames: number;
  readonly initialBundleEntries: number;
}

export function premiumMonsterPlanTotals(): PremiumMonsterPlanTotals {
  return {
    eliteCount: PREMIUM_MONSTER_PRODUCTION_PLAN.filter((entry) => entry.rank === 'elite').length,
    bossCount: PREMIUM_MONSTER_PRODUCTION_PLAN.filter((entry) => entry.rank === 'boss').length,
    plannedFrames: PREMIUM_MONSTER_PRODUCTION_PLAN.reduce((sum, entry) => sum + entry.plannedFrames, 0),
    initialBundleEntries: PREMIUM_MONSTER_PRODUCTION_PLAN.filter((entry) => entry.initialBundle).length,
  };
}
