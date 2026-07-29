import { describe, expect, it } from 'vitest';
import { AutoTargetController } from './AutoTargetController';

const candidate = (id: string, x: number, y: number, rank: 'normal' | 'elite' | 'boss' = 'normal') => ({
  id,
  position: { x, y },
  rank,
  hp: 100,
  maxHp: 100,
  alive: true,
  telegraphing: false,
});

describe('AutoTargetController', () => {
  it('selects a nearby forward target', () => {
    const controller = new AutoTargetController();
    const result = controller.update({ x: 0, y: 0 }, { x: 1, y: 0 }, [candidate('front', 90, 0), candidate('back', -80, 0)]);
    expect(result?.targetId).toBe('front');
  });

  it('prioritizes a boss without constantly switching targets', () => {
    const controller = new AutoTargetController();
    const result = controller.update({ x: 0, y: 0 }, { x: 1, y: 0 }, [candidate('normal', 70, 0), candidate('boss', 150, 0, 'boss')]);
    expect(result?.targetId).toBe('boss');
  });
});
