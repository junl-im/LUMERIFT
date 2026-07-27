import { describe, expect, it, vi } from 'vitest';

vi.mock('pixi.js', () => ({
  Assets: { load: vi.fn(), unload: vi.fn() },
}));
import { AssetManager, type AssetLoader } from './AssetManager';
import type { AssetBundleDefinition } from './AssetCatalog';

class FakeLoader implements AssetLoader {
  public readonly loads: string[] = [];
  public readonly unloads: string[] = [];
  public failUrl?: string;

  public async load<T = unknown>(url: string): Promise<T> {
    this.loads.push(url);
    if (url === this.failUrl) throw new Error(`failed ${url}`);
    return { url } as T;
  }

  public async unload(url: string): Promise<void> {
    this.unloads.push(url);
  }
}

const bundle: AssetBundleDefinition = {
  id: 'battle-test',
  urls: ['a.webp', 'b.json'],
  estimatedBytes: 100,
};

describe('AssetManager bundle references', () => {
  it('unloads only after the last bundle reference is released', async () => {
    const loader = new FakeLoader();
    const assets = new AssetManager(loader);

    await assets.loadBundle(bundle);
    await assets.loadBundle(bundle);
    expect(loader.loads).toEqual(['a.webp', 'b.json']);

    await assets.releaseBundle(bundle.id);
    expect(loader.unloads).toEqual([]);

    await assets.releaseBundle(bundle.id);
    expect(loader.unloads.sort()).toEqual(['a.webp', 'b.json']);
  });

  it('reports deterministic bundle loading progress', async () => {
    const loader = new FakeLoader();
    const assets = new AssetManager(loader);
    const progress: number[] = [];
    await assets.loadBundle(bundle, (value) => progress.push(value));
    expect(progress).toEqual([0.5, 1]);
  });

  it('cleans up assets loaded before a bundle failure', async () => {
    const loader = new FakeLoader();
    loader.failUrl = 'b.json';
    const assets = new AssetManager(loader);

    await expect(assets.loadBundle(bundle)).rejects.toThrow('failed b.json');
    expect(loader.unloads).toEqual(['a.webp']);
    expect(assets.diagnostics().activeBundles).toBe(0);
  });
});
