import { AnimatedSprite, Container, type Spritesheet, type Texture } from 'pixi.js';
import type { GraphicsQualityPreset } from '../../core/graphics/GraphicsQualityController';
import { ObjectPool } from '../../core/pooling/ObjectPool';
import type { Vec2 } from '../combat/geometry';

interface ActiveVfx {
  readonly sprite: AnimatedSprite;
  readonly key: BattleVfxKey;
  remaining: number;
}

export type BattleVfxKey = 'slash' | 'nova' | 'hit' | 'explosion' | 'dodge';

export class BattleVfxSystem {
  public readonly view = new Container();
  private readonly active = new Set<ActiveVfx>();
  private readonly pools = new Map<BattleVfxKey, ObjectPool<ActiveVfx>>();
  private sequence = 0;

  public constructor(
    private readonly sheet: Spritesheet | undefined,
    private readonly quality: GraphicsQualityPreset,
  ) {}

  public spawn(
    key: BattleVfxKey,
    position: Vec2,
    rotation = 0,
    scale = 1,
  ): void {
    if (!this.sheet) return;
    this.sequence += 1;
    const particleStride = Math.max(1, Math.ceil(1 / Math.max(0.1, this.quality.particleMultiplier)));
    if (key === 'hit' && this.sequence % particleStride !== 0) return;

    const pool = this.getPool(key);
    const item = pool.acquire();
    item.remaining = key === 'nova' || key === 'explosion' ? 0.48 : 0.3;
    item.sprite.position.set(position.x, position.y);
    item.sprite.rotation = rotation;
    item.sprite.scale.set(scale * (0.8 + this.quality.effectDensity * 0.28));
    item.sprite.alpha = 1;
    item.sprite.visible = true;
    item.sprite.gotoAndPlay(0);
    this.active.add(item);
    this.view.addChild(item.sprite);
  }

  public update(deltaSeconds: number): void {
    for (const item of [...this.active]) {
      item.remaining -= deltaSeconds;
      item.sprite.alpha = Math.max(0, Math.min(1, item.remaining * 5));
      if (item.remaining > 0 && item.sprite.playing) continue;
      this.release(item);
    }
  }

  public clear(): void {
    for (const item of [...this.active]) this.release(item);
    for (const pool of this.pools.values()) pool.releaseAll();
    this.view.removeChildren();
  }

  private getPool(key: BattleVfxKey): ObjectPool<ActiveVfx> {
    const existing = this.pools.get(key);
    if (existing) return existing;
    const sheet = this.sheet;
    if (!sheet) throw new Error('VFX spritesheet is not loaded.');
    const textures = sheet.animations[`effect.${key}`] as Texture[] | undefined;
    const fallbackTexture = Object.values(sheet.textures)[0];
    const safeTextures = textures && textures.length > 0
      ? textures
      : fallbackTexture
        ? [fallbackTexture]
        : [];
    if (safeTextures.length === 0) throw new Error(`VFX texture is missing: ${key}`);
    const pool = new ObjectPool<ActiveVfx>(() => {
      const sprite = new AnimatedSprite({ textures: safeTextures, loop: false, autoPlay: false });
      sprite.anchor.set(0.5);
      sprite.animationSpeed = 0.3;
      return { sprite, key, remaining: 0 };
    }, 8);
    this.pools.set(key, pool);
    return pool;
  }

  private release(item: ActiveVfx): void {
    item.sprite.stop();
    item.sprite.parent?.removeChild(item.sprite);
    item.sprite.visible = false;
    this.active.delete(item);
    this.pools.get(item.key)?.release(item);
  }
}
