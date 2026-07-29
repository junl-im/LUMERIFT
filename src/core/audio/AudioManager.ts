export type AudioCategory = 'bgm' | 'sfx' | 'ui' | 'voice' | 'ambient';

export interface AudioPlayOptions {
  readonly volumeScale?: number;
  readonly playbackRate?: number;
  readonly delayMs?: number;
  readonly offsetSeconds?: number;
}

export interface AudioLayer extends AudioPlayOptions {
  readonly url: string;
  readonly category?: AudioCategory;
}

interface CachedAudio {
  readonly url: string;
  readonly element: HTMLAudioElement;
  readonly category: AudioCategory;
}

export class AudioManager {
  private context?: AudioContext;
  private readonly volumes: Record<AudioCategory, number> = {
    bgm: 0.8,
    sfx: 1,
    ui: 1,
    voice: 1,
    ambient: 0.8,
  };
  private readonly cached = new Map<string, CachedAudio>();
  private readonly active = new Set<HTMLAudioElement>();
  private bgm?: HTMLAudioElement;

  public async unlock(): Promise<void> {
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
  }

  public setVolume(category: AudioCategory, volume: number): void {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
    for (const item of this.cached.values()) {
      if (item.category === category) item.element.volume = this.volumes[category];
    }
    if (category === 'bgm' && this.bgm) this.bgm.volume = this.volumes.bgm;
  }

  public getVolume(category: AudioCategory): number {
    return this.volumes[category];
  }

  public preload(url: string, category: AudioCategory): HTMLAudioElement {
    this.validate(url);
    const cached = this.cached.get(url);
    if (cached) return cached.element;

    const element = new Audio(url);
    element.preload = 'auto';
    element.volume = this.volumes[category];
    this.cached.set(url, { url, element, category });
    return element;
  }

  public async play(
    url: string,
    category: AudioCategory = 'sfx',
    options: AudioPlayOptions = {},
  ): Promise<HTMLAudioElement> {
    this.validate(url);
    await this.unlock();
    if ((options.delayMs ?? 0) > 0) await delay(options.delayMs ?? 0);
    const template = this.preload(url, category);
    const audio = template.cloneNode(true) as HTMLAudioElement;
    audio.volume = Math.max(0, Math.min(1, this.volumes[category] * (options.volumeScale ?? 1)));
    audio.playbackRate = Math.max(0.5, Math.min(2, options.playbackRate ?? 1));
    audio.currentTime = Math.max(0, options.offsetSeconds ?? 0);
    this.active.add(audio);
    const release = () => this.active.delete(audio);
    audio.addEventListener('ended', release, { once: true });
    try {
      await audio.play();
      return audio;
    } catch (error) {
      release();
      throw error;
    }
  }

  public async playLayered(layers: readonly AudioLayer[]): Promise<void> {
    const results = await Promise.allSettled(
      layers.map((layer) => this.play(layer.url, layer.category ?? 'sfx', layer)),
    );
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (rejected) throw rejected.reason;
  }

  public async playBgm(url: string, loop = true): Promise<void> {
    this.validate(url);
    await this.unlock();
    if (this.bgm?.src.endsWith(url) && !this.bgm.paused) return;
    this.stopBgm();
    const audio = this.preload(url, 'bgm');
    audio.loop = loop;
    audio.currentTime = 0;
    audio.volume = this.volumes.bgm;
    this.bgm = audio;
    await audio.play();
  }

  public stopBgm(): void {
    if (!this.bgm) return;
    this.bgm.pause();
    this.bgm.currentTime = 0;
    this.bgm = undefined;
  }

  public stopAll(): void {
    this.stopBgm();
    for (const audio of this.active) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.active.clear();
  }

  public release(url?: string): void {
    if (url) {
      const item = this.cached.get(url);
      item?.element.pause();
      this.cached.delete(url);
      return;
    }
    this.stopAll();
    this.cached.clear();
  }

  public diagnostics(): { cached: number; active: number; bgm: boolean } {
    return { cached: this.cached.size, active: this.active.size, bgm: Boolean(this.bgm) };
  }

  public async suspend(): Promise<void> {
    this.stopAll();
    if (this.context?.state === 'running') await this.context.suspend();
  }

  private validate(url: string): void {
    if (!/\.(ogg|opus)(?:[?#].*)?$/i.test(url)) {
      throw new Error(`오디오는 OGG/Opus만 사용할 수 있습니다: ${url}`);
    }
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));
}
