import { describe, expect, it } from 'vitest';
import { GraphicsQualityController } from './GraphicsQualityController';

describe('GraphicsQualityController', () => {
  it('cycles and persists graphics quality', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const controller = new GraphicsQualityController(storage);
    expect(controller.mode).toBe('balanced');
    expect(controller.cycle().mode).toBe('low');
    expect(values.size).toBe(1);
  });
});
