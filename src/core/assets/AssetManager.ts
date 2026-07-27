import { Assets } from 'pixi.js';
import type { AssetBundleDefinition } from './AssetCatalog';

const ALLOWED_IMAGE_EXTENSIONS = new Set(['png', 'webp']);

interface BundleState {
  readonly definition: AssetBundleDefinition;
  references: number;
}

export interface AssetDiagnostics {
  readonly loadedUrls: number;
  readonly activeBundles: number;
  readonly estimatedBundleBytes: number;
}

export interface AssetLoader {
  load<T = unknown>(url: string): Promise<T>;
  unload(url: string): Promise<void>;
}

export class AssetManager {
  private readonly loadedAssets = new Map<string, unknown>();
  private readonly urlReferences = new Map<string, number>();
  private readonly bundles = new Map<string, BundleState>();

  public constructor(private readonly loader: AssetLoader = Assets) {}

  public async load<T = unknown>(url: string): Promise<T> {
    this.validate(url);
    const existing = this.loadedAssets.get(url);
    if (existing !== undefined) return existing as T;

    const asset = await this.loader.load<T>(url);
    this.loadedAssets.set(url, asset);
    return asset;
  }

  public get<T = unknown>(url: string): T | undefined {
    return this.loadedAssets.get(url) as T | undefined;
  }

  public async loadBundle(
    definition: AssetBundleDefinition,
    onProgress?: (progress: number, url: string) => void,
  ): Promise<void> {
    const existing = this.bundles.get(definition.id);
    if (existing) {
      existing.references += 1;
      for (const url of definition.urls) this.addUrlReference(url);
      onProgress?.(1, definition.urls.at(-1) ?? '');
      return;
    }

    const loadedNow: string[] = [];
    try {
      for (const [index, url] of definition.urls.entries()) {
        const wasLoaded = this.loadedAssets.has(url);
        await this.load(url);
        if (!wasLoaded) loadedNow.push(url);
        onProgress?.((index + 1) / Math.max(1, definition.urls.length), url);
      }
    } catch (error: unknown) {
      await Promise.all(loadedNow.map(async (url) => {
        if ((this.urlReferences.get(url) ?? 0) === 0) await this.unload(url);
      }));
      throw error;
    }

    this.bundles.set(definition.id, { definition, references: 1 });
    for (const url of definition.urls) this.addUrlReference(url);
  }

  public async releaseBundle(bundleId: string): Promise<void> {
    const state = this.bundles.get(bundleId);
    if (!state) return;

    state.references -= 1;
    for (const url of state.definition.urls) await this.releaseUrlReference(url);
    if (state.references <= 0) this.bundles.delete(bundleId);
  }

  public async unload(url: string): Promise<void> {
    this.urlReferences.delete(url);
    if (!this.loadedAssets.delete(url)) return;
    await this.loader.unload(url);
  }

  public async unloadAll(): Promise<void> {
    const urls = [...this.loadedAssets.keys()];
    this.loadedAssets.clear();
    this.urlReferences.clear();
    this.bundles.clear();
    await Promise.all(urls.map(async (url) => this.loader.unload(url)));
  }

  public diagnostics(): AssetDiagnostics {
    let estimatedBundleBytes = 0;
    for (const state of this.bundles.values()) {
      estimatedBundleBytes += state.definition.estimatedBytes;
    }
    return {
      loadedUrls: this.loadedAssets.size,
      activeBundles: this.bundles.size,
      estimatedBundleBytes,
    };
  }

  private addUrlReference(url: string): void {
    this.urlReferences.set(url, (this.urlReferences.get(url) ?? 0) + 1);
  }

  private async releaseUrlReference(url: string): Promise<void> {
    const next = (this.urlReferences.get(url) ?? 0) - 1;
    if (next > 0) {
      this.urlReferences.set(url, next);
      return;
    }
    this.urlReferences.delete(url);
    if (this.loadedAssets.delete(url)) await this.loader.unload(url);
  }

  private validate(url: string): void {
    const clean = url.split(/[?#]/, 1)[0] ?? '';
    const extension = clean.includes('.') ? clean.split('.').pop()?.toLowerCase() : undefined;
    if (extension === 'svg' || extension === 'svgz') {
      throw new Error(`SVG 리소스는 사용할 수 없습니다: ${url}`);
    }
    if (extension && ['jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(extension)) {
      throw new Error(`이미지는 PNG/WebP만 사용할 수 있습니다: ${url}`);
    }
    if (extension && !ALLOWED_IMAGE_EXTENSIONS.has(extension) && !['json', 'ogg', 'opus'].includes(extension)) {
      console.warn(`[Assets] 등록되지 않은 확장자입니다: ${url}`);
    }
  }
}
