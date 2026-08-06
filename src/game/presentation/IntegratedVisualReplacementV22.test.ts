import { describe, expect, it } from 'vitest';
import {
  INTEGRATED_VISUAL_REPLACEMENT_V22,
  INTEGRATED_VISUAL_REPLACEMENT_V22_SCHEMA,
} from './IntegratedVisualReplacementV22';

describe('IntegratedVisualReplacementV22', () => {
  it('uses the unified replacement path and disables the old body overlay stack', () => {
    expect(INTEGRATED_VISUAL_REPLACEMENT_V22_SCHEMA).toBe('lumerift-integrated-visual-replacement-v22');
    expect(INTEGRATED_VISUAL_REPLACEMENT_V22.enabled).toBe(true);
    expect(INTEGRATED_VISUAL_REPLACEMENT_V22.oldBodyOverlayStackEnabled).toBe(false);
    expect(INTEGRATED_VISUAL_REPLACEMENT_V22.mobileReadabilityMinimum).toBe(80);
  });
});
