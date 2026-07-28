export const BRAND = {
  id: 'lumerift',
  title: 'LUMERIFT',
  koreanTitle: '루메리프트',
  subtitle: '균열의 계승자',
  fullTitle: 'LUMERIFT: 균열의 계승자',
  version: '1.10.1',
} as const;

export const STORAGE_KEYS = {
  localUid: `${BRAND.id}.localUid`,
  fpsMode: `${BRAND.id}.fpsMode`,
  graphicsQuality: `${BRAND.id}.graphicsQuality`,
  accessibility: `${BRAND.id}.accessibility.v1`,
  profilePrefix: `${BRAND.id}.profile`,
} as const;
