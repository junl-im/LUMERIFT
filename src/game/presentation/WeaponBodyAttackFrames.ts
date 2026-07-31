import type { Spritesheet, Texture } from 'pixi.js';
import type { CharacterShowcasePose } from '../../core/presentation/CharacterWardrobeController';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { DirectionId } from './direction';

export interface WeaponBodyFrameRecipe {
  readonly family: WeaponVisualFamily;
  readonly sourcePose: CharacterShowcasePose;
  readonly frameOrder: readonly number[];
  readonly animationSpeed: number;
  readonly loop: boolean;
  readonly phaseLabel: string;
}

const DEFAULT_ORDER = [0, 1, 2, 3] as const;

export function resolveWeaponBodyFrameRecipe(
  family: WeaponVisualFamily,
  pose: CharacterShowcasePose,
): WeaponBodyFrameRecipe {
  if (!isAttackPose(pose)) {
    return {
      family,
      sourcePose: pose,
      frameOrder: DEFAULT_ORDER,
      animationSpeed: pose === 'run' ? 0.22 : pose === 'dodge' ? 0.24 : 0.13,
      loop: pose === 'idle' || pose === 'run',
      phaseLabel: '공통 본체 프레임',
    };
  }

  if (family === 'greatblade') {
    if (pose === 'attack1') return recipe(family, 'attack3', [0, 0, 1, 2, 2, 3], 0.19, '긴 선행 · 강한 절단');
    if (pose === 'attack2') return recipe(family, 'skill1', [0, 0, 1, 1, 2, 3], 0.18, '상체 회전 · 넓은 궤적');
    return recipe(family, 'attack3', [0, 0, 1, 2, 3, 3, 3], 0.17, '마무리 축적 · 긴 회수');
  }

  if (family === 'riftlance') {
    if (pose === 'attack1') return recipe(family, 'attack2', [0, 1, 1, 2, 3], 0.28, '짧은 준비 · 선제 찌르기');
    if (pose === 'attack2') return recipe(family, 'skill2', [0, 1, 2, 2, 3], 0.26, '전진 찌르기 · 거리 유지');
    return recipe(family, 'attack1', [0, 1, 2, 3, 3], 0.24, '직선 관통 · 빠른 복귀');
  }

  if (pose === 'attack1') return recipe(family, 'attack1', [0, 1, 2, 3], 0.31, '즉시 발도 · 빠른 회수');
  if (pose === 'attack2') return recipe(family, 'attack2', [0, 1, 2, 3], 0.3, '교차 베기 · 연계 유지');
  return recipe(family, 'attack3', [0, 1, 2, 3, 3], 0.28, '마무리 베기 · 짧은 잔상');
}

export function resolveWeaponBodyTextures(
  sheet: Spritesheet | undefined,
  family: WeaponVisualFamily,
  pose: CharacterShowcasePose,
  direction: DirectionId,
): { readonly textures: readonly Texture[]; readonly recipe: WeaponBodyFrameRecipe; readonly key: string } | undefined {
  const recipeValue = resolveWeaponBodyFrameRecipe(family, pose);
  const preferredKey = `player.${recipeValue.sourcePose}.${direction}`;
  const fallbackKey = `player.${recipeValue.sourcePose}.s`;
  const source = (sheet?.animations[preferredKey] ?? sheet?.animations[fallbackKey]) as Texture[] | undefined;
  if (!source?.length) return undefined;
  const textures = recipeValue.frameOrder
    .map((index) => source[Math.min(source.length - 1, Math.max(0, index))])
    .filter((texture): texture is Texture => Boolean(texture));
  if (!textures.length) return undefined;
  return {
    textures,
    recipe: recipeValue,
    key: `${family}:${preferredKey}:${recipeValue.frameOrder.join('-')}`,
  };
}

function recipe(
  family: WeaponVisualFamily,
  sourcePose: CharacterShowcasePose,
  frameOrder: readonly number[],
  animationSpeed: number,
  phaseLabel: string,
): WeaponBodyFrameRecipe {
  return { family, sourcePose, frameOrder, animationSpeed, loop: false, phaseLabel };
}

function isAttackPose(pose: CharacterShowcasePose): pose is 'attack1' | 'attack2' | 'attack3' {
  return pose === 'attack1' || pose === 'attack2' || pose === 'attack3';
}
