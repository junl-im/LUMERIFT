import { describe, expect, it } from 'vitest';
import { CharacterDyeController, characterDyeLabel } from './CharacterDyeController';

function memoryStorage(seed: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe('CharacterDyeController', () => {
  it('cycles through the four local-only dye presets', () => {
    const controller = new CharacterDyeController(memoryStorage());
    expect(controller.current).toBe('heir-gold');
    expect(controller.cycle()).toBe('rift-azure');
    expect(controller.cycle()).toBe('abyss-violet');
    expect(controller.cycle()).toBe('moon-silver');
    expect(controller.cycle()).toBe('heir-gold');
  });

  it('restores a stored preset and exposes its label', () => {
    const controller = new CharacterDyeController(memoryStorage({ 'lumerift.characterDye.v1': 'abyss-violet' }));
    expect(controller.current).toBe('abyss-violet');
    expect(characterDyeLabel(controller.current)).toBe('심연 바이올렛');
  });
});
