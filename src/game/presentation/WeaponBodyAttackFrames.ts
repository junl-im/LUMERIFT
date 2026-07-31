import type { Spritesheet, Texture } from 'pixi.js';
import type { CharacterShowcasePose } from '../../core/presentation/CharacterWardrobeController';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { DirectionId } from './direction';

export type WeaponBodyCorrectionProfile = 'shared' | 'blade-hand-tune' | 'greatblade-weight-tune' | 'riftlance-thrust-tune';

export interface WeaponBodyFrameCorrection {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly layerLag: number;
}

export interface WeaponBodyFrameRecipe {
  readonly family: WeaponVisualFamily;
  readonly sourcePose: CharacterShowcasePose;
  readonly frameOrder: readonly number[];
  readonly animationSpeed: number;
  readonly loop: boolean;
  readonly phaseLabel: string;
  readonly correctionProfile: WeaponBodyCorrectionProfile;
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
      correctionProfile: 'shared',
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
  dedicatedAttackSheet?: Spritesheet,
): { readonly textures: readonly Texture[]; readonly recipe: WeaponBodyFrameRecipe; readonly key: string } | undefined {
  const recipeValue = resolveWeaponBodyFrameRecipe(family, pose);
  if (isAttackPose(pose)) {
    const dedicatedKey = `weapon_body.${family}.${pose}.${direction}`;
    const dedicatedFallback = `weapon_body.${family}.${pose}.s`;
    const dedicated = (dedicatedAttackSheet?.animations[dedicatedKey]
      ?? dedicatedAttackSheet?.animations[dedicatedFallback]) as Texture[] | undefined;
    if (dedicated?.length) {
      return {
        textures: dedicated,
        recipe: {
          ...recipeValue,
          sourcePose: pose,
          frameOrder: dedicated.map((_, index) => index),
          phaseLabel: `${recipeValue.phaseLabel} · 전용 Atlas`,
        },
        key: `dedicated:${dedicatedKey}`,
      };
    }
  }

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

export function resolveWeaponBodyFrameCorrection(
  recipe: WeaponBodyFrameRecipe,
  frameIndex: number,
  direction: DirectionId,
): WeaponBodyFrameCorrection {
  const count = Math.max(1, recipe.frameOrder.length);
  const progress = Math.max(0, Math.min(1, frameIndex / Math.max(1, count - 1)));
  const contact = Math.sin(progress * Math.PI);
  const directionSign = direction.includes('w') ? -1 : 1;
  if (recipe.correctionProfile === 'greatblade-weight-tune') {
    return {
      offsetX: directionSign * (-2 + progress * 5),
      offsetY: -contact * 2.4 + progress * 1.2,
      rotation: directionSign * (progress - 0.42) * 0.055,
      scaleX: 1 + contact * 0.018,
      scaleY: 1 - contact * 0.016,
      layerLag: directionSign * contact * -0.032,
    };
  }
  if (recipe.correctionProfile === 'riftlance-thrust-tune') {
    return {
      offsetX: directionSign * contact * 4.2,
      offsetY: -contact * 0.8,
      rotation: directionSign * (0.012 - contact * 0.018),
      scaleX: 1 + contact * 0.026,
      scaleY: 1 - contact * 0.01,
      layerLag: directionSign * contact * -0.018,
    };
  }
  if (recipe.correctionProfile === 'blade-hand-tune') {
    const cross = Math.sin(progress * Math.PI * 2);
    return {
      offsetX: directionSign * (contact * 1.8 + cross * 0.6),
      offsetY: -contact * 1.2,
      rotation: directionSign * cross * 0.024,
      scaleX: 1 + contact * 0.012,
      scaleY: 1 - contact * 0.008,
      layerLag: directionSign * cross * -0.012,
    };
  }
  return { offsetX: 0, offsetY: 0, rotation: 0, scaleX: 1, scaleY: 1, layerLag: 0 };
}

function recipe(
  family: WeaponVisualFamily,
  sourcePose: CharacterShowcasePose,
  frameOrder: readonly number[],
  animationSpeed: number,
  phaseLabel: string,
): WeaponBodyFrameRecipe {
  const correctionProfile: WeaponBodyCorrectionProfile = family === 'greatblade'
    ? 'greatblade-weight-tune'
    : family === 'riftlance'
      ? 'riftlance-thrust-tune'
      : 'blade-hand-tune';
  return { family, sourcePose, frameOrder, animationSpeed, loop: false, phaseLabel, correctionProfile };
}

function isAttackPose(pose: CharacterShowcasePose): pose is 'attack1' | 'attack2' | 'attack3' {
  return pose === 'attack1' || pose === 'attack2' || pose === 'attack3';
}
