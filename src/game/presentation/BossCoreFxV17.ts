import type { Spritesheet, Texture } from 'pixi.js';
import type { BossCoreState } from './BossCoreLifecycle';

export const BOSS_CORE_FX_V17_SCHEMA = 'lumerift-boss-core-fx-v17' as const;

const FRAME_COUNTS: Readonly<Record<BossCoreState, number>> = {
  stable: 4,
  shielded: 4,
  fractured: 4,
  shattered: 6,
  regenerating: 6,
  overdrive: 4,
};

const FRAME_RATES: Readonly<Record<BossCoreState, number>> = {
  stable: 5,
  shielded: 5,
  fractured: 6,
  shattered: 14,
  regenerating: 10,
  overdrive: 9,
};

export function bossCoreFxTextureV17(
  sheet: Spritesheet | undefined,
  state: BossCoreState,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const visualState = state === 'stable' ? 'shielded' : state;
  const count = FRAME_COUNTS[state];
  const frame = Math.floor(Math.max(0, elapsed) * FRAME_RATES[state]) % count;
  return sheet.textures[`premium.core.v17.${visualState}.${frame}`];
}
