export const PREMIUM_ART_DIRECTION_SCHEMA = 'lumerift-premium-art-direction-v2' as const;

export type PremiumArtDomain = 'character' | 'monster' | 'ui' | 'skill-vfx' | 'equipment';

export interface PremiumArtDomainProfile {
  readonly domain: PremiumArtDomain;
  readonly label: string;
  readonly targetQuality: number;
  readonly silhouettePriority: number;
  readonly materialPriority: number;
  readonly lightingPriority: number;
  readonly effectPriority: number;
  readonly mobileReadabilityPriority: number;
  readonly runtimeStrategy: 'atlas' | 'lazy-image' | 'programmatic-plus-atlas';
  readonly requiredTraits: readonly string[];
}

export interface PremiumArtQualitySample {
  readonly silhouette: number;
  readonly materials: number;
  readonly lighting: number;
  readonly effects: number;
  readonly mobileReadability: number;
}

export interface PremiumArtQualityResult {
  readonly score: number;
  readonly passed: boolean;
  readonly weakestDimension: keyof PremiumArtQualitySample;
  readonly targetQuality: number;
}

export const PREMIUM_ART_DIRECTION_PROFILES: Readonly<Record<PremiumArtDomain, PremiumArtDomainProfile>> = {
  character: {
    domain: 'character',
    label: '프리미엄 영웅 캐릭터',
    targetQuality: 92,
    silhouettePriority: 0.28,
    materialPriority: 0.22,
    lightingPriority: 0.16,
    effectPriority: 0.12,
    mobileReadabilityPriority: 0.22,
    runtimeStrategy: 'atlas',
    requiredTraits: ['8방향 실루엣', '얼굴 표정', '갑주·망토·룬 분리', '무기 계열 판독성', '절제된 발광'],
  },
  monster: {
    domain: 'monster',
    label: '엘리트 몬스터·보스',
    targetQuality: 91,
    silhouettePriority: 0.32,
    materialPriority: 0.19,
    lightingPriority: 0.13,
    effectPriority: 0.14,
    mobileReadabilityPriority: 0.22,
    runtimeStrategy: 'atlas',
    requiredTraits: ['종족별 실루엣', '공격 전조', '약점 코어', '속성 변형', '피격 판독성'],
  },
  ui: {
    domain: 'ui',
    label: '리프트 글래스 UI',
    targetQuality: 90,
    silhouettePriority: 0.1,
    materialPriority: 0.24,
    lightingPriority: 0.16,
    effectPriority: 0.12,
    mobileReadabilityPriority: 0.38,
    runtimeStrategy: 'programmatic-plus-atlas',
    requiredTraits: ['금속·유리 프레임', '상태 대비', '48px 터치 영역', '블루·바이올렛·골드 계층', '작은 화면 가독성'],
  },
  'skill-vfx': {
    domain: 'skill-vfx',
    label: '룬·스킬 VFX',
    targetQuality: 90,
    silhouettePriority: 0.12,
    materialPriority: 0.08,
    lightingPriority: 0.23,
    effectPriority: 0.35,
    mobileReadabilityPriority: 0.22,
    runtimeStrategy: 'programmatic-plus-atlas',
    requiredTraits: ['룬 문법', '타격 중심', '속성 색상', '잔상 감쇠', '렌더 예산 단계화'],
  },
  equipment: {
    domain: 'equipment',
    label: '무기·장비 파츠',
    targetQuality: 91,
    silhouettePriority: 0.25,
    materialPriority: 0.3,
    lightingPriority: 0.15,
    effectPriority: 0.1,
    mobileReadabilityPriority: 0.2,
    runtimeStrategy: 'atlas',
    requiredTraits: ['무기 계열 차이', '금속·천·크리스털 재질', '등급별 룬', '세트 조화', '캐릭터 본체 정렬'],
  },
};

export function premiumArtProfile(domain: PremiumArtDomain): PremiumArtDomainProfile {
  return PREMIUM_ART_DIRECTION_PROFILES[domain];
}

export function evaluatePremiumArtQuality(
  domain: PremiumArtDomain,
  sample: PremiumArtQualitySample,
): PremiumArtQualityResult {
  const profile = premiumArtProfile(domain);
  const normalized = normalizeSample(sample);
  const score = Math.round(
    normalized.silhouette * profile.silhouettePriority
    + normalized.materials * profile.materialPriority
    + normalized.lighting * profile.lightingPriority
    + normalized.effects * profile.effectPriority
    + normalized.mobileReadability * profile.mobileReadabilityPriority,
  );
  const weakestDimension = (Object.entries(normalized) as [keyof PremiumArtQualitySample, number][])
    .sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'mobileReadability';
  return {
    score,
    passed: score >= profile.targetQuality && normalized.mobileReadability >= 80,
    weakestDimension,
    targetQuality: profile.targetQuality,
  };
}

function normalizeSample(sample: PremiumArtQualitySample): PremiumArtQualitySample {
  return {
    silhouette: clampScore(sample.silhouette),
    materials: clampScore(sample.materials),
    lighting: clampScore(sample.lighting),
    effects: clampScore(sample.effects),
    mobileReadability: clampScore(sample.mobileReadability),
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
