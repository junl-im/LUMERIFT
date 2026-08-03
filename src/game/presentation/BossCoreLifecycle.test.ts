import { describe, expect, it } from 'vitest';
import { resolveBossCorePresentation } from './BossCoreLifecycle';

describe('BossCoreLifecycle', () => {
  it('transitions from shielded to break, regeneration, fracture, and overdrive', () => {
    expect(resolveBossCorePresentation({ rank: 'boss', phase: 1, hpRatio: 1, secondsSincePhaseChange: 10, alive: true }).state).toBe('shielded');
    expect(resolveBossCorePresentation({ rank: 'boss', phase: 2, hpRatio: 0.64, secondsSincePhaseChange: 0.1, alive: true }).state).toBe('shattered');
    expect(resolveBossCorePresentation({ rank: 'boss', phase: 2, hpRatio: 0.64, secondsSincePhaseChange: 0.5, alive: true }).state).toBe('regenerating');
    expect(resolveBossCorePresentation({ rank: 'boss', phase: 2, hpRatio: 0.5, secondsSincePhaseChange: 2, alive: true }).state).toBe('fractured');
    expect(resolveBossCorePresentation({ rank: 'boss', phase: 3, hpRatio: 0.2, secondsSincePhaseChange: 2, alive: true }).state).toBe('overdrive');
  });

  it('keeps normal and elite monsters on a stable readable core', () => {
    expect(resolveBossCorePresentation({ rank: 'elite', phase: 1, hpRatio: 0.4, secondsSincePhaseChange: 0, alive: true }).state).toBe('stable');
  });
});
