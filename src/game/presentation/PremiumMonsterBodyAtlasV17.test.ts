import { describe, expect, it } from 'vitest';
import { monsterBodyTexturesV17, premiumMonsterBodyFamily, PREMIUM_MONSTER_BODY_V17_SCHEMA } from './PremiumMonsterBodyAtlasV17';

describe('PremiumMonsterBodyAtlasV17', () => {
  it('maps elite and boss variants to stable art families', () => {
    expect(PREMIUM_MONSTER_BODY_V17_SCHEMA).toBe('lumerift-premium-monster-body-v17');
    expect(premiumMonsterBodyFamily('abyssal-harbinger')).toBe('boss');
    expect(premiumMonsterBodyFamily('lumen-mender')).toBe('frost');
    expect(premiumMonsterBodyFamily('elite-generic')).toBe('inferno');
  });

  it('resolves all six body layers', () => {
    const textures = Object.fromEntries(['headplate','torso','forelegs','hindlegs','dorsal','tailtip'].map((part) => [`premium.body.v17.monster.boss.${part}`, { part }]));
    const result = monsterBodyTexturesV17({ textures } as never, 'abyssal-harbinger');
    expect(Object.values(result).filter(Boolean)).toHaveLength(6);
  });
});
