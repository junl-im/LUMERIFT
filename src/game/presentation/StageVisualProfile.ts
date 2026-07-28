export type ChapterOneVisualTier = 'approach' | 'ruins' | 'depths' | 'core';

export interface StageVisualProfile {
  readonly tier: ChapterOneVisualTier;
  readonly accentColor: number;
  readonly secondaryColor: number;
  readonly corruption: number;
  readonly decorationSeed: number;
}

export function resolveStageVisualProfile(stageOrder: number): StageVisualProfile {
  if (stageOrder >= 9) {
    return {
      tier: 'core',
      accentColor: 0xff5367,
      secondaryColor: 0xd870ff,
      corruption: 1,
      decorationSeed: 1704,
    };
  }
  if (stageOrder >= 6) {
    return {
      tier: 'depths',
      accentColor: 0xb96ff4,
      secondaryColor: 0x69d9d0,
      corruption: 0.82,
      decorationSeed: 1703,
    };
  }
  if (stageOrder >= 3) {
    return {
      tier: 'ruins',
      accentColor: 0xf0bd67,
      secondaryColor: 0x73d8ca,
      corruption: 0.68,
      decorationSeed: 1702,
    };
  }
  return {
    tier: 'approach',
    accentColor: 0x72ded1,
    secondaryColor: 0xf0c776,
    corruption: 0.58,
    decorationSeed: 1701,
  };
}

export function normalizeBossPhase(phase: number): 1 | 2 | 3 {
  if (phase >= 3) return 3;
  if (phase >= 2) return 2;
  return 1;
}
