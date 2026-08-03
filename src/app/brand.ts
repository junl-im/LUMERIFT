export const BRAND = {
  id: 'lumerift',
  title: 'LUMERIFT',
  koreanTitle: '루메리프트',
  subtitle: '균열의 계승자',
  fullTitle: 'LUMERIFT: 균열의 계승자',
  version: '1.11.29',
} as const;

export const STORAGE_KEYS = {
  localUid: `${BRAND.id}.localUid`,
  fpsMode: `${BRAND.id}.fpsMode`,
  graphicsQuality: `${BRAND.id}.graphicsQuality`,
  accessibility: `${BRAND.id}.accessibility.v1`,
  playerArtVariant: `${BRAND.id}.playerArtVariant.v1`,
  characterDyePreset: `${BRAND.id}.characterDye.v1`,
  characterWardrobe: `${BRAND.id}.characterWardrobe.v1`,
  characterAppearanceCloud: `${BRAND.id}.characterAppearanceCloud.v1`,
  characterAppearanceRecovery: `${BRAND.id}.characterAppearanceRecovery.v1`,
  characterAppearanceMergeUndo: `${BRAND.id}.characterAppearanceMergeUndo.v1`,
  characterAppearanceAudit: `${BRAND.id}.characterAppearanceAudit.v1`,
  characterDisplayCalibration: `${BRAND.id}.characterDisplayCalibration.v1`,
  joystickCalibration: `${BRAND.id}.joystickCalibration.v2`,
  profilePrefix: `${BRAND.id}.profile`,
} as const;
