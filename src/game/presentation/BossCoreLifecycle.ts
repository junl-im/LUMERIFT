import type { MonsterRank } from '../combat/combatData';

export const BOSS_CORE_LIFECYCLE_SCHEMA = 'lumerift-boss-core-lifecycle-v1' as const;

export type BossCoreState = 'stable' | 'shielded' | 'fractured' | 'shattered' | 'regenerating' | 'overdrive';

export interface BossCoreLifecycleInput {
  readonly rank: MonsterRank;
  readonly phase: number;
  readonly hpRatio: number;
  readonly secondsSincePhaseChange: number;
  readonly alive: boolean;
}

export interface BossCorePresentation {
  readonly state: BossCoreState;
  readonly coreAlpha: number;
  readonly shieldAlpha: number;
  readonly crackAlpha: number;
  readonly fragmentAlpha: number;
  readonly pulseRate: number;
  readonly scale: number;
  readonly label: string;
}

const STABLE: BossCorePresentation = {
  state: 'stable',
  coreAlpha: 0.76,
  shieldAlpha: 0,
  crackAlpha: 0,
  fragmentAlpha: 0,
  pulseRate: 2.4,
  scale: 1,
  label: 'STABLE',
};

export function resolveBossCorePresentation(input: BossCoreLifecycleInput): BossCorePresentation {
  const hpRatio = clamp01(input.hpRatio);
  const phase = Math.max(1, Math.round(input.phase));
  const phaseElapsed = Math.max(0, input.secondsSincePhaseChange);

  if (!input.alive) {
    return {
      state: 'shattered',
      coreAlpha: 0.08,
      shieldAlpha: 0,
      crackAlpha: 0.9,
      fragmentAlpha: 1,
      pulseRate: 0,
      scale: 1.28,
      label: 'DESTROYED',
    };
  }
  if (input.rank !== 'boss') return STABLE;

  // A phase change is presented as a readable break -> rebuild sequence before the new steady state.
  if (phase > 1 && phaseElapsed < 0.24) {
    return {
      state: 'shattered',
      coreAlpha: 0.12,
      shieldAlpha: 0,
      crackAlpha: 1,
      fragmentAlpha: 0.96,
      pulseRate: 8.4,
      scale: 1.32,
      label: 'BREAK',
    };
  }
  if (phase > 1 && phaseElapsed < 0.86) {
    const progress = (phaseElapsed - 0.24) / 0.62;
    return {
      state: 'regenerating',
      coreAlpha: 0.28 + progress * 0.52,
      shieldAlpha: progress * 0.42,
      crackAlpha: 0.86 - progress * 0.62,
      fragmentAlpha: 0.82 - progress * 0.58,
      pulseRate: 6.2,
      scale: 1.22 - progress * 0.16,
      label: 'REFORM',
    };
  }

  if (phase >= 3 || hpRatio <= 0.3) {
    return {
      state: 'overdrive',
      coreAlpha: 1,
      shieldAlpha: 0.18,
      crackAlpha: 0.86,
      fragmentAlpha: 0.72,
      pulseRate: 7.4,
      scale: 1.18,
      label: 'OVERDRIVE',
    };
  }
  if (phase >= 2 || hpRatio <= 0.65) {
    return {
      state: 'fractured',
      coreAlpha: 0.9,
      shieldAlpha: 0.16,
      crackAlpha: 0.74,
      fragmentAlpha: 0.28,
      pulseRate: 4.8,
      scale: 1.08,
      label: 'FRACTURED',
    };
  }

  return {
    state: 'shielded',
    coreAlpha: 0.88,
    shieldAlpha: 0.72,
    crackAlpha: 0.12,
    fragmentAlpha: 0.06,
    pulseRate: 3.2,
    scale: 1.02,
    label: 'SHIELDED',
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
