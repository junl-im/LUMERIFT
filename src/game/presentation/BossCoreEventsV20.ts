import type { Spritesheet, Texture } from 'pixi.js';
import type { BossCoreState } from './BossCoreLifecycle';

export const BOSS_CORE_EVENTS_V20_SCHEMA = 'lumerift-boss-core-events-v20' as const;
export type BossCoreEventV20 = 'collision' | 'dissolve' | 'reverse-regenerate';

export function bossCoreEventV20(state: BossCoreState, elapsed: number): BossCoreEventV20 | undefined {
  if (state === 'shattered') return elapsed < 0.24 ? 'collision' : 'dissolve';
  if (state === 'regenerating') return 'reverse-regenerate';
  return undefined;
}

export function bossCoreEventTextureV20(
  sheet: Spritesheet | undefined,
  state: BossCoreState,
  elapsed: number,
): Texture | undefined {
  if (!sheet) return undefined;
  const event = bossCoreEventV20(state, Math.max(0, elapsed));
  if (!event) return undefined;
  const localElapsed = event === 'dissolve' ? Math.max(0, elapsed - 0.24) : Math.max(0, elapsed);
  const frame = Math.min(7, Math.floor(localElapsed * (event === 'collision' ? 24 : 13))) % 8;
  return sheet.textures[`premium.core.v20.${event}.${frame}`];
}
