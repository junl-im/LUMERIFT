import { describe, expect, it } from 'vitest';
import { BOSS_CORE_EVENTS_V20_SCHEMA, bossCoreEventV20 } from './BossCoreEventsV20';

describe('BossCoreEventsV20', () => {
  it('chains collision, dissolve and reverse regeneration', () => {
    expect(BOSS_CORE_EVENTS_V20_SCHEMA).toBe('lumerift-boss-core-events-v20');
    expect(bossCoreEventV20('shattered', .1)).toBe('collision');
    expect(bossCoreEventV20('shattered', .5)).toBe('dissolve');
    expect(bossCoreEventV20('regenerating', .5)).toBe('reverse-regenerate');
  });
});
