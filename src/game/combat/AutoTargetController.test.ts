import { describe, expect, it } from 'vitest';
import { AutoTargetController, targetScore } from './AutoTargetController';

const candidate = (id: string, x: number, y: number, rank: 'normal' | 'elite' | 'boss' = 'normal', hp = 100, telegraphing = false) => ({
  id,
  position: { x, y },
  rank,
  hp,
  maxHp: 100,
  alive: true,
  telegraphing,
});

describe('AutoTargetController', () => {
  it('selects a nearby forward target', () => {
    const controller = new AutoTargetController();
    const result = controller.update({ x: 0, y: 0 }, { x: 1, y: 0 }, [candidate('front', 90, 0), candidate('back', -80, 0)]);
    expect(result?.targetId).toBe('front');
  });

  it('prioritizes a boss in boss mode', () => {
    const controller = new AutoTargetController();
    const result = controller.update(
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      [candidate('normal', 70, 0), candidate('boss', 190, 0, 'boss')],
      { priority: 'boss', devicePreset: 'balanced' },
    );
    expect(result?.targetId).toBe('boss');
  });

  it('supports weak and threat priority scoring', () => {
    const origin = { x: 0, y: 0 };
    const facing = { x: 1, y: 0 };
    expect(targetScore(origin, facing, candidate('weak', 120, 0, 'normal', 10), 'weak'))
      .toBeGreaterThan(targetScore(origin, facing, candidate('healthy', 100, 0, 'normal', 100), 'weak'));
    expect(targetScore(origin, facing, candidate('danger', 140, 0, 'normal', 100, true), 'threat'))
      .toBeGreaterThan(targetScore(origin, facing, candidate('idle', 100, 0), 'threat'));
  });
});
