import type { Spritesheet, Texture } from 'pixi.js';
import type { BossCoreState } from './BossCoreLifecycle';

export const BOSS_CORE_FX_V18_SCHEMA = 'lumerift-boss-core-fx-v18' as const;

const FRAME_COUNTS: Readonly<Record<BossCoreState, number>> = {
  stable: 4,
  shielded: 4,
  fractured: 4,
  shattered: 8,
  regenerating: 8,
  overdrive: 6,
};

const FRAME_RATES: Readonly<Record<BossCoreState, number>> = {
  stable: 5,
  shielded: 5,
  fractured: 7,
  shattered: 16,
  regenerating: 12,
  overdrive: 11,
};

export function bossCoreFxTextureV18(
  sheet: Spritesheet | undefined,
  state: BossCoreState,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const visualState = state === 'stable' ? 'shielded' : state;
  const frame = Math.floor(Math.max(0, elapsed) * FRAME_RATES[state]) % FRAME_COUNTS[state];
  return sheet.textures[`premium.core.v18.${visualState}.${frame}`];
}
