import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumCharacterRuntimeState } from './PremiumCharacterRuntimeV14';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { DirectionId } from './direction';

export const PLAYER_WEAPON_INTERPOLATION_V21_SCHEMA = 'lumerift-player-weapon-interpolation-v21' as const;

export interface PlayerWeaponInterpolationFrameV21 {
  readonly family: WeaponVisualFamily;
  readonly frame: number;
  readonly texture?: Texture;
}

export function playerWeaponInterpolationFrameV21(
  sheet: Spritesheet | undefined,
  family: WeaponVisualFamily,
  direction: DirectionId,
  state: PremiumCharacterRuntimeState,
  progress: number,
): PlayerWeaponInterpolationFrameV21 | undefined {
  if (state !== 'attacking' && state !== 'showcase') return undefined;
  const value = Math.max(0, Math.min(1, progress));
  const frame = Math.min(7, Math.floor(value * 8));
  const key = `premium.interpolate.v21.player.${family}.${direction}.${frame}`;
  const fallback = `premium.interpolate.v21.player.${family}.s.${frame}`;
  return { family, frame, texture: sheet?.textures[key] ?? sheet?.textures[fallback] };
}
