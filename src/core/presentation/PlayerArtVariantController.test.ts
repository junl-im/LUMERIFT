import { describe, expect, it } from 'vitest';
import { PlayerArtVariantController } from './PlayerArtVariantController';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('PlayerArtVariantController', () => {
  it('keeps the detailed art as default and persists the owned preview opt-in', () => {
    const storage = new MemoryStorage();
    const controller = new PlayerArtVariantController(storage);
    expect(controller.current).toBe('detail');
    expect(controller.cycle()).toBe('owned-preview');
    expect(new PlayerArtVariantController(storage).current).toBe('owned-preview');
    expect(controller.cycle()).toBe('owned-painted');
    expect(controller.cycle()).toBe('detail');
  });
});
