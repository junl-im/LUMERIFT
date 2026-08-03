import type { Spritesheet, Texture } from 'pixi.js';
import type { BossCoreState } from './BossCoreLifecycle';

export const BOSS_CORE_TRAILS_V19_SCHEMA = 'lumerift-boss-core-trails-v19' as const;

const FRAME_COUNTS: Readonly<Record<BossCoreState, number>> = {
  stable: 6,
  shielded: 6,
  fractured: 6,
  shattered: 8,
  regenerating: 8,
  overdrive: 8,
};

const FRAME_RATES: Readonly<Record<BossCoreState, number>> = {
  stable: 6,
  shielded: 6,
  fractured: 8,
  shattered: 18,
  regenerating: 15,
  overdrive: 14,
};

export function bossCoreTrailTextureV19(
  sheet: Spritesheet | undefined,
  state: BossCoreState,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const visualState = state === 'stable' ? 'shielded' : state;
  const frame = Math.floor(Math.max(0, elapsed) * FRAME_RATES[state]) % FRAME_COUNTS[state];
  return sheet.textures[`premium.core.v19.${visualState}.${frame}`];
}
