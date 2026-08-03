import { describe, expect, it } from 'vitest';
import { PREMIUM_UI_FRAME_RUNTIME_SCHEMA, PREMIUM_UI_FRAME_SCHEMA } from './PremiumFrameV3';

describe('PremiumFrameV3', () => {
  it('keeps the v3 compatibility key while extending runtime ornamentation', () => {
    expect(PREMIUM_UI_FRAME_SCHEMA).toBe('lumerift-premium-ui-frame-v3');
    expect(PREMIUM_UI_FRAME_RUNTIME_SCHEMA).toBe('lumerift-premium-ui-frame-v3.1');
  });
});
