import { AnimatedSprite, Container, Graphics, Text, TextStyle, type Spritesheet } from 'pixi.js';
import { COLORS } from '../../app/constants';
import {
  characterCostumeSetLabel,
  characterDirectionLabel,
  characterShowcasePoseLabel,
  type CharacterAppearancePreset,
} from '../../core/presentation/CharacterWardrobeController';
import { characterDyeLabel } from '../../core/presentation/CharacterDyeController';
import type { GameDataRegistry } from '../data/GameDataRegistry';
import type { PlayerProfile } from '../../repositories/PlayerRepository';
import {
  resolveCharacterEquipmentAppearance,
  type CharacterEquipmentAppearance,
} from './CharacterEquipmentVisualProfile';
import { CharacterEquipmentLayerView } from './CharacterEquipmentLayerView';
import {
  resolveWeaponBodyFrameCorrection,
  resolveWeaponBodyTextures,
  type WeaponBodyFrameRecipe,
} from './WeaponBodyAttackFrames';

export type CharacterAppearanceSnapshotSource = 'local' | 'remote' | 'result';

export interface CharacterAppearanceSnapshotCardOptions {
  readonly title: string;
  readonly source: CharacterAppearanceSnapshotSource;
  readonly preset: CharacterAppearancePreset | undefined;
  readonly profile: PlayerProfile;
  readonly registry: GameDataRegistry;
  readonly sheet: Spritesheet | undefined;
  readonly attackSheet: Spritesheet | undefined;
  readonly locked?: boolean;
  readonly changedFields?: readonly string[];
  readonly width?: number;
  readonly height?: number;
}

export class CharacterAppearanceSnapshotCard {
  public readonly view = new Container();
  private readonly sprite?: AnimatedSprite;
  private readonly equipment?: CharacterEquipmentLayerView;
  private readonly aura?: Graphics;
  private readonly recipe?: WeaponBodyFrameRecipe;
  private readonly direction?: CharacterAppearancePreset['direction'];
  private readonly baseX: number;
  private readonly baseY: number;
  private readonly baseScale: number;
  private readonly facingX: number;

  public constructor(options: CharacterAppearanceSnapshotCardOptions) {
    const width = options.width ?? 148;
    const height = options.height ?? 424;
    this.baseX = width / 2;
    this.baseY = 230;
    this.baseScale = 1.62;
    this.facingX = directionFacingX(options.preset?.direction ?? 's');

    const tone = sourceTone(options.source);
    const panel = new Graphics()
      .roundRect(0, 0, width, height, 16)
      .fill({ color: COLORS.panel, alpha: 0.96 })
      .stroke({ color: tone, alpha: options.source === 'result' ? 0.9 : 0.5, width: options.source === 'result' ? 2 : 1.2 });
    const title = new Text({
      text: options.title,
      style: new TextStyle({ fill: tone, fontSize: 9, fontWeight: '900' }),
    });
    title.position.set(12, 12);

    const status = new Text({
      text: options.locked ? 'LOCKED' : options.preset ? 'READY' : 'EMPTY',
      style: new TextStyle({ fill: options.locked ? COLORS.warning : COLORS.muted, fontSize: 7, fontWeight: '900' }),
    });
    status.anchor.set(1, 0);
    status.position.set(width - 12, 14);
    this.view.addChild(panel, title, status);

    if (!options.preset) {
      const empty = new Text({
        text: '저장된 외형 없음',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '800' }),
      });
      empty.anchor.set(0.5);
      empty.position.set(width / 2, 210);
      this.view.addChild(empty);
      return;
    }

    const appearance = resolveCharacterEquipmentAppearance(
      options.profile,
      options.registry,
      options.preset.dyePreset,
      { costumeSet: options.preset.costumeSet, dyeChannels: options.preset.dyeChannels },
    );
    const aura = createAura(this.baseX, 188, appearance, options.source);
    this.aura = aura;
    const equipment = new CharacterEquipmentLayerView(appearance);
    this.equipment = equipment;
    equipment.update({
      x: this.baseX,
      y: this.baseY,
      scaleX: this.baseScale,
      scaleY: this.baseScale,
      rotation: 0,
      facingX: this.facingX,
      elapsed: 0,
      actionProgress: actionProgress(options.preset.pose),
      state: 'showcase',
      overdrive: options.preset.pose === 'skill2',
    });

    const body = resolveWeaponBodyTextures(
      options.sheet,
      appearance.weaponVisualFamily,
      options.preset.pose,
      options.preset.direction,
      options.attackSheet,
    );
    this.recipe = body?.recipe;
    this.direction = options.preset.direction;
    if (body?.textures.length) {
      const sprite = new AnimatedSprite({
        textures: [...body.textures],
        animationSpeed: body.recipe.animationSpeed,
        loop: body.recipe.loop,
        autoPlay: true,
      });
      sprite.anchor.set(0.5, 0.76);
      sprite.position.set(this.baseX, this.baseY);
      sprite.scale.set(this.baseScale);
      sprite.tint = appearance.bodyTint;
      this.sprite = sprite;
    }

    const info = new Text({
      text: [
        truncate(options.preset.name, 17),
        characterDyeLabel(options.preset.dyePreset),
        characterCostumeSetLabel(options.preset.costumeSet),
        `${characterDirectionLabel(options.preset.direction)} · ${characterShowcasePoseLabel(options.preset.pose)}`,
        channelLabel(options.preset),
        changedFieldsLabel(options.changedFields),
      ].join('\n'),
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: 7,
        lineHeight: 14,
        fontWeight: '700',
        wordWrap: true,
        wordWrapWidth: width - 24,
      }),
    });
    info.position.set(12, 302);

    this.view.addChild(aura, equipment.back);
    if (this.sprite) this.view.addChild(this.sprite);
    this.view.addChild(equipment.front, info);
  }

  public update(elapsed: number): void {
    const sprite = this.sprite;
    if (sprite && this.recipe && this.direction) {
      const correction = resolveWeaponBodyFrameCorrection(this.recipe, sprite.currentFrame, this.direction);
      const action = sprite.totalFrames > 1 ? sprite.currentFrame / (sprite.totalFrames - 1) : 0;
      sprite.position.set(this.baseX + correction.offsetX, this.baseY + correction.offsetY);
      sprite.scale.set(this.baseScale * correction.scaleX, this.baseScale * correction.scaleY);
      sprite.rotation = correction.rotation;
      this.equipment?.update({
        x: this.baseX + correction.offsetX,
        y: this.baseY + correction.offsetY,
        scaleX: this.baseScale * correction.scaleX,
        scaleY: this.baseScale * correction.scaleY,
        rotation: correction.rotation + correction.layerLag,
        facingX: this.facingX,
        elapsed,
        actionProgress: action,
        state: 'showcase',
        overdrive: false,
      });
    } else {
      this.equipment?.tick(elapsed);
    }
    if (this.aura) {
      this.aura.alpha = 0.7 + Math.sin(elapsed * 2.4) * 0.12;
      this.aura.rotation += 0.0015;
    }
  }

  public destroy(): void {
    this.sprite?.stop();
    this.view.destroy({ children: true });
  }
}

function createAura(
  x: number,
  y: number,
  appearance: CharacterEquipmentAppearance,
  source: CharacterAppearanceSnapshotSource,
): Graphics {
  const sourceMultiplier = source === 'result' ? 1.08 : 1;
  return new Graphics()
    .circle(x, y, 54)
    .fill({ color: appearance.primaryColor, alpha: 0.08 * sourceMultiplier })
    .circle(x, y, 43)
    .stroke({ color: appearance.secondaryColor, alpha: 0.42 * sourceMultiplier, width: 2.2 })
    .circle(x, y, 29)
    .stroke({ color: appearance.runeColor, alpha: 0.28 * sourceMultiplier, width: 1.4 });
}

function sourceTone(source: CharacterAppearanceSnapshotSource): number {
  if (source === 'remote') return COLORS.warning;
  if (source === 'result') return COLORS.accent;
  return COLORS.primary;
}

function actionProgress(pose: CharacterAppearancePreset['pose']): number {
  return pose.startsWith('attack') || pose.startsWith('skill') ? 0.5 : 0;
}

function directionFacingX(direction: string): number {
  if (direction.includes('w')) return -0.82;
  if (direction.includes('e')) return 0.82;
  return 0;
}

function channelLabel(preset: CharacterAppearancePreset): string {
  const channels = preset.dyeChannels;
  return `갑 ${channels.primary} · 망 ${channels.secondary} · 룬 ${channels.rune}${preset.favorite ? ' · ★' : ''}`;
}

function changedFieldsLabel(fields: readonly string[] | undefined): string {
  if (!fields?.length) return '차이 없음';
  const labels: Readonly<Record<string, string>> = {
    name: '이름', favorite: '즐겨찾기', dye: '염색', pose: '포즈', direction: '방향', costume: '세트', channels: '채널', preset: '프리셋',
  };
  return `변경 · ${fields.map((field) => labels[field] ?? field).join('·')}`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
