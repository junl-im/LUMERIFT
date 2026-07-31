import { describe, expect, it } from 'vitest';
import { resolveCharacterStateMaterial, resolveFxState } from './CharacterStateMaterialProfile';


describe('CharacterStateMaterialProfile', () => {
  it('maps combat states to the matching directional character FX row', () => {
    expect(resolveFxState('attacking')).toBe('attack');
    expect(resolveFxState('skill')).toBe('skill');
    expect(resolveFxState('dodging')).toBe('dodge');
    expect(resolveFxState('moving')).toBe('idle');
  });

  it('raises material intensity during overdrive', () => {
    const normal = resolveCharacterStateMaterial('skill', false, 0.3, false);
    const boosted = resolveCharacterStateMaterial('skill', true, 1, false);
    expect(boosted.frontAlpha).toBeGreaterThan(normal.frontAlpha);
    expect(boosted.scale).toBeGreaterThan(normal.scale);
  });
});
