import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumCharacterRuntimeState } from './PremiumCharacterRuntimeV14';
import type { DirectionId } from './direction';
import { playerActionKindV18, type PlayerActionPartKindV18 } from './PlayerActionPartsV18';

export const PLAYER_ACTION_PHASES_V19_SCHEMA = 'lumerift-player-action-phases-v19' as const;

export type PlayerActionPhaseV19 = 'contact' | 'sustain' | 'recover';

export interface PlayerActionPhaseFrameV19 {
  readonly action: PlayerActionPartKindV18;
  readonly phase: PlayerActionPhaseV19;
  readonly texture?: Texture;
}

export function playerActionPhaseV19(progress: number): PlayerActionPhaseV19 {
  const value = Math.max(0, Math.min(1, progress));
  if (value < 0.34) return 'contact';
  if (value < 0.72) return 'sustain';
  return 'recover';
}

export function playerActionPhaseFrameV19(
  sheet: Spritesheet | undefined,
  direction: DirectionId,
  state: PremiumCharacterRuntimeState,
  actionProgress: number,
): PlayerActionPhaseFrameV19 | undefined {
  const action = playerActionKindV18(state);
  if (!action) return undefined;
  const phase = playerActionPhaseV19(actionProgress);
  const key = `premium.phase.v19.player.${direction}.${action}.${phase}`;
  const fallback = `premium.phase.v19.player.s.${action}.${phase}`;
  return { action, phase, texture: sheet?.textures[key] ?? sheet?.textures[fallback] };
}
