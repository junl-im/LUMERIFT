import type { Spritesheet, Texture } from 'pixi.js';
import type { PremiumCharacterRuntimeState } from './PremiumCharacterRuntimeV14';
import type { DirectionId } from './direction';

export const PLAYER_ACTION_PARTS_V18_SCHEMA = 'lumerift-player-action-parts-v18' as const;

export type PlayerActionPartKindV18 = 'attack' | 'dodge' | 'skill';

export interface PlayerActionPartFrameV18 {
  readonly action: PlayerActionPartKindV18;
  readonly frame: 0 | 1;
  readonly texture?: Texture;
}

export function playerActionKindV18(
  state: PremiumCharacterRuntimeState,
): PlayerActionPartKindV18 | undefined {
  if (state === 'dodging') return 'dodge';
  if (state === 'skill') return 'skill';
  if (state === 'attacking' || state === 'showcase') return 'attack';
  return undefined;
}

export function playerActionPartFrameV18(
  sheet: Spritesheet | undefined,
  direction: DirectionId,
  state: PremiumCharacterRuntimeState,
  actionProgress: number,
): PlayerActionPartFrameV18 | undefined {
  const action = playerActionKindV18(state);
  if (!action) return undefined;
  const frame: 0 | 1 = Math.max(0, Math.min(1, actionProgress)) >= 0.5 ? 1 : 0;
  const key = `premium.action.v18.player.${direction}.${action}.${frame}`;
  const fallback = `premium.action.v18.player.s.${action}.${frame}`;
  return { action, frame, texture: sheet?.textures[key] ?? sheet?.textures[fallback] };
}
