export type BossPhase = 1 | 2 | 3;

export interface BossPhasePresentation {
  readonly phase: BossPhase;
  readonly title: string;
  readonly subtitle: string;
  readonly accentColor: number;
  readonly secondaryColor: number;
  readonly cinematicSeconds: number;
  readonly zoom: number;
  readonly shake: number;
  readonly bodyScale: number;
  readonly auraRings: number;
  readonly telegraphIntensity: number;
}

const PHASES: Readonly<Record<BossPhase, BossPhasePresentation>> = {
  1: {
    phase: 1,
    title: '심연의 전령',
    subtitle: '균열핵을 지키는 첫 번째 형상',
    accentColor: 0xd5a7ff,
    secondaryColor: 0x55e6bf,
    cinematicSeconds: 1.15,
    zoom: 1.12,
    shake: 8,
    bodyScale: 1,
    auraRings: 1,
    telegraphIntensity: 1,
  },
  2: {
    phase: 2,
    title: 'PHASE II · 침식 개방',
    subtitle: '공격 속도와 균열 파동이 강화됩니다',
    accentColor: 0xffb45f,
    secondaryColor: 0xd5a7ff,
    cinematicSeconds: 0.78,
    zoom: 1.145,
    shake: 11,
    bodyScale: 1.06,
    auraRings: 2,
    telegraphIntensity: 1.12,
  },
  3: {
    phase: 3,
    title: 'PHASE III · 심연 폭주',
    subtitle: '마지막 형상 · 모든 공격이 치명적으로 변합니다',
    accentColor: 0xff6f86,
    secondaryColor: 0xffce6a,
    cinematicSeconds: 0.94,
    zoom: 1.18,
    shake: 15,
    bodyScale: 1.12,
    auraRings: 3,
    telegraphIntensity: 1.24,
  },
};

export function normalizeBossPhaseValue(value: number): BossPhase {
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

export function resolveBossPhasePresentation(value: number): BossPhasePresentation {
  return PHASES[normalizeBossPhaseValue(value)];
}

export function bossCinematicAlpha(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0 || remainingSeconds <= 0) return 0;
  const elapsed = totalSeconds - remainingSeconds;
  const fadeIn = Math.min(1, elapsed / Math.min(0.18, totalSeconds * 0.3));
  const fadeOut = Math.min(1, remainingSeconds / Math.min(0.24, totalSeconds * 0.35));
  return Math.max(0, Math.min(fadeIn, fadeOut));
}
