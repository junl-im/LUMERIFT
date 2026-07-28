import { describe, expect, it } from 'vitest';
import { GraphicsQualityController } from '../graphics/GraphicsQualityController';
import { CombatRenderBudget } from './CombatRenderBudget';

function storage(): Pick<Storage, 'getItem' | 'setItem'> {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); },
  };
}

describe('CombatRenderBudget', () => {
  it('reduces visual work under sustained pressure', () => {
    const controller = new GraphicsQualityController(storage());
    controller.setMode('high');
    const budget = new CombatRenderBudget();
    budget.update(controller.current, 'stable');
    const stable = budget.snapshot();
    budget.update(controller.current, 'sustained');
    const sustained = budget.snapshot();
    expect(sustained.effectLimit).toBeLessThan(stable.effectLimit);
    expect(sustained.arcSegments).toBeLessThan(stable.arcSegments);
  });
});
