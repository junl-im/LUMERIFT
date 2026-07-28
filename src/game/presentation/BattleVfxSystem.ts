import { AnimatedSprite, Container, Graphics, type Spritesheet, type Texture } from 'pixi.js';
import type { GraphicsQualityPreset } from '../../core/graphics/GraphicsQualityController';
import { ObjectPool } from '../../core/pooling/ObjectPool';
import type { CombatImpactTier } from '../combat/combatData';
import type { Vec2 } from '../combat/geometry';

interface ActiveVfx {
  readonly root: Container;
  readonly sprite: AnimatedSprite;
  readonly accent: Graphics;
  readonly key: BattleVfxKey;
  remaining: number;
  duration: number;
  color: number;
  impactTier: CombatImpactTier;
}

export interface BattleVfxSpawnOptions {
  readonly color?: number;
  readonly impactTier?: CombatImpactTier;
}

export type BattleVfxKey = 'slash' | 'nova' | 'hit' | 'explosion' | 'dodge';

export class BattleVfxSystem {
  public readonly view = new Container();
  private readonly active = new Set<ActiveVfx>();
  private readonly pools = new Map<BattleVfxKey, ObjectPool<ActiveVfx>>();
  private sequence = 0;
  private intensity = 1;

  public constructor(
    private readonly sheet: Spritesheet | undefined,
    private quality: GraphicsQualityPreset,
  ) {}

  public setRuntimeProfile(quality: GraphicsQualityPreset, intensity: number): void {
    this.quality = quality;
    this.intensity = Math.max(0.35, Math.min(1.2, intensity));
  }

  public spawn(
    key: BattleVfxKey,
    position: Vec2,
    rotation = 0,
    scale = 1,
    options: BattleVfxSpawnOptions = {},
  ): void {
    if (!this.sheet) return;
    const activeLimit = Math.max(6, Math.round(18 * this.quality.particleMultiplier * this.intensity));
    if (this.active.size >= activeLimit && key === 'hit') return;
    this.sequence += 1;
    const particleStride = Math.max(1, Math.ceil(1 / Math.max(0.1, this.quality.particleMultiplier)));
    if (key === 'hit' && this.sequence % particleStride !== 0) return;

    const pool = this.getPool(key);
    const item = pool.acquire();
    item.duration = key === 'nova' || key === 'explosion' ? 0.52 : key === 'dodge' ? 0.36 : 0.32;
    item.remaining = item.duration;
    item.color = options.color ?? defaultColor(key);
    item.impactTier = options.impactTier ?? defaultTier(key);
    item.root.position.set(position.x, position.y);
    item.root.rotation = rotation;
    item.root.scale.set(scale * (0.78 + this.quality.effectDensity * 0.3) * this.intensity);
    item.root.alpha = 1;
    item.root.visible = true;
    item.sprite.alpha = 1;
    item.sprite.gotoAndPlay(0);
    this.redrawAccent(item, 0);
    this.active.add(item);
    this.view.addChild(item.root);
  }

  public update(deltaSeconds: number): void {
    for (const item of [...this.active]) {
      item.remaining -= deltaSeconds;
      const progress = Math.max(0, Math.min(1, 1 - item.remaining / Math.max(0.01, item.duration)));
      item.root.alpha = Math.max(0, Math.min(1, item.remaining * 5));
      this.redrawAccent(item, progress);
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
      const root = new Container();
      const accent = new Graphics();
      const sprite = new AnimatedSprite({ textures: safeTextures, loop: false, autoPlay: false });
      sprite.anchor.set(0.5);
      sprite.animationSpeed = key === 'nova' || key === 'explosion' ? 0.26 : 0.34;
      root.addChild(accent, sprite);
      return {
        root,
        sprite,
        accent,
        key,
        remaining: 0,
        duration: 0.3,
        color: defaultColor(key),
        impactTier: defaultTier(key),
      };
    }, 8);
    this.pools.set(key, pool);
    return pool;
  }

  private redrawAccent(item: ActiveVfx, progress: number): void {
    const graphics = item.accent;
    graphics.clear();
    const tierScale = item.impactTier === 'ultimate' ? 1.34 : item.impactTier === 'heavy' ? 1.12 : 0.92;
    const alpha = (1 - progress) * this.intensity;
    const color = item.color;

    if (item.key === 'hit') {
      const rayCount = item.impactTier === 'ultimate' ? 12 : item.impactTier === 'heavy' ? 9 : 6;
      for (let index = 0; index < rayCount; index += 1) {
        const angle = (Math.PI * 2 * index) / rayCount + progress * 0.35;
        const inner = 12 + progress * 8;
        const outer = (30 + progress * 42) * tierScale;
        graphics
          .moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
          .lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
          .stroke({ color: index % 2 === 0 ? 0xffffff : color, alpha: alpha * (index % 2 === 0 ? 0.72 : 0.48), width: index % 2 === 0 ? 2 : 4 });
      }
      return;
    }

    if (item.key === 'slash') {
      const radius = (42 + progress * 34) * tierScale;
      for (let layer = 0; layer < (this.quality.effectDensity > 0.75 ? 3 : 2); layer += 1) {
        const start = -1.15 + layer * 0.08;
        const end = 1.15 - layer * 0.05;
        graphics.arc(0, 0, radius - layer * 7, start, end)
          .stroke({ color: layer === 0 ? 0xffffff : color, alpha: alpha * (0.74 - layer * 0.16), width: layer === 0 ? 2 : 7 - layer });
      }
      return;
    }

    if (item.key === 'dodge') {
      for (let index = -2; index <= 2; index += 1) {
        const y = index * 10;
        graphics
          .moveTo(-18 - progress * 20, y)
          .lineTo(-92 - progress * 46, y * 1.15)
          .stroke({ color: index === 0 ? 0xffffff : color, alpha: alpha * (index === 0 ? 0.64 : 0.34), width: index === 0 ? 3 : 5 });
      }
      return;
    }

    const radius = (34 + progress * (item.key === 'nova' ? 106 : 76)) * tierScale;
    graphics.circle(0, 0, radius)
      .stroke({ color, alpha: alpha * 0.76, width: item.impactTier === 'ultimate' ? 8 : 5 });
    if (this.quality.effectDensity > 0.55) {
      graphics.circle(0, 0, radius * 0.72)
        .stroke({ color: 0xffffff, alpha: alpha * 0.38, width: 2 });
    }
    if (item.impactTier === 'ultimate') {
      const points = 8;
      for (let index = 0; index < points; index += 1) {
        const angle = (Math.PI * 2 * index) / points + progress;
        graphics
          .moveTo(Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5)
          .lineTo(Math.cos(angle) * radius * 1.08, Math.sin(angle) * radius * 1.08)
          .stroke({ color: index % 2 === 0 ? 0xffffff : color, alpha: alpha * 0.42, width: 3 });
      }
    }
  }

  private release(item: ActiveVfx): void {
    item.sprite.stop();
    item.root.parent?.removeChild(item.root);
    item.root.visible = false;
    item.accent.clear();
    this.active.delete(item);
    this.pools.get(item.key)?.release(item);
  }
}

function defaultColor(key: BattleVfxKey): number {
  if (key === 'nova') return 0xb991ff;
  if (key === 'dodge') return 0x67f5df;
  if (key === 'explosion') return 0xffb65d;
  if (key === 'hit') return 0xffffff;
  return 0x7ee9ff;
}

function defaultTier(key: BattleVfxKey): CombatImpactTier {
  if (key === 'nova' || key === 'explosion') return 'ultimate';
  if (key === 'slash') return 'heavy';
  return 'light';
}
