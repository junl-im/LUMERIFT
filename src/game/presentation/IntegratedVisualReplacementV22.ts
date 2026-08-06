export const INTEGRATED_VISUAL_REPLACEMENT_V22_SCHEMA = 'lumerift-integrated-visual-replacement-v22' as const;

export const INTEGRATED_VISUAL_REPLACEMENT_V22 = Object.freeze({
  enabled: true,
  useUnifiedPlayerBody: true,
  useUnifiedMonsterBody: true,
  useUnifiedUi: true,
  useUnifiedCombatEffects: true,
  oldBodyOverlayStackEnabled: false,
  equipmentOverlayAlpha: 0.18,
  mobileReadabilityMinimum: 80,
  qualityStage: 'production-candidate-unified-art-pass',
} as const);

export function integratedVisualReplacementV22Enabled(): boolean {
  return INTEGRATED_VISUAL_REPLACEMENT_V22.enabled;
}
