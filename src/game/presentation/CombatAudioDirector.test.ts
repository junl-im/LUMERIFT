import { describe, expect, it } from 'vitest';
import { resolveCombatAudioLayers } from './CombatAudioDirector';

const paths = { slash: 'slash.ogg', hit: 'hit.ogg', skill: 'skill.ogg', dodge: 'dodge.ogg' };

describe('resolveCombatAudioLayers', () => {
  it('adds a delayed low impact layer for critical and ultimate hits', () => {
    const layers = resolveCombatAudioLayers(paths, { kind: 'impact', tier: 'ultimate', critical: true, hitCount: 3 });
    expect(layers).toHaveLength(2);
    expect(layers[1]?.delayMs).toBeGreaterThan(0);
    expect(layers[1]?.playbackRate).toBeLessThan(1);
  });

  it('keeps ordinary dodge lightweight and perfect dodge layered', () => {
    expect(resolveCombatAudioLayers(paths, { kind: 'dodge', perfect: false })).toHaveLength(1);
    expect(resolveCombatAudioLayers(paths, { kind: 'dodge', perfect: true })).toHaveLength(2);
  });
});
