import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumCharacterRuntimeState } from './PremiumCharacterRuntimeV14';
import type { WeaponVisualFamily } from './CharacterEquipmentVisualProfile';
import type { DirectionId } from './direction';

export const PLAYER_WEAPON_PHASES_V20_SCHEMA = 'lumerift-player-weapon-phases-v20' as const;

export type PlayerWeaponPhaseV20 = 'anticipation' | 'contact' | 'sustain' | 'recover' | 'follow-through';

export interface PlayerWeaponPhaseFrameV20 {
  readonly family: WeaponVisualFamily;
  readonly phase: PlayerWeaponPhaseV20;
  readonly texture?: Texture;
}

export function playerWeaponPhaseV20(progress: number): PlayerWeaponPhaseV20 {
  const value = Math.max(0, Math.min(1, progress));
  if (value < 0.18) return 'anticipation';
  if (value < 0.38) return 'contact';
  if (value < 0.62) return 'sustain';
  if (value < 0.82) return 'recover';
  return 'follow-through';
}

export function playerWeaponPhaseFrameV20(
  sheet: Spritesheet | undefined,
  family: WeaponVisualFamily,
  direction: DirectionId,
  state: PremiumCharacterRuntimeState,
  progress: number,
): PlayerWeaponPhaseFrameV20 | undefined {
  if (state !== 'attacking' && state !== 'showcase') return undefined;
  const phase = playerWeaponPhaseV20(progress);
  const key = `premium.weapon.v20.player.${family}.${direction}.${phase}`;
  const fallback = `premium.weapon.v20.player.${family}.s.${phase}`;
  return { family, phase, texture: sheet?.textures[key] ?? sheet?.textures[fallback] };
}
