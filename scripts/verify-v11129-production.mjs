import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const character = await readJson('public/assets/live/v13/production/CHARACTER_BODY_V13.json');
const monsters = await readJson('public/assets/live/v13/production/MONSTER_ELITE_BOSS_V13.json');
const vfx = await readJson('public/assets/live/v13/production/RUNE_VFX_V13.json');
const ui = await readJson('public/assets/live/v13/production/UI_FRAME_V13.json');

const framesPerDirection = Object.values(character.actions).reduce((sum, value) => sum + Number(value), 0);
const bodyFrames = framesPerDirection * character.directions.length * character.weaponFamilies.length;
const monsterFrames = monsters.entries.reduce((sum, entry) => sum + Number(entry.plannedFrames), 0);

const failures = [];
if (character.schema !== 'lumerift-premium-character-production-v1') failures.push('character schema');
if (bodyFrames !== 1752) failures.push(`character body frames ${bodyFrames}`);
if (character.layers.length !== 6) failures.push('character layer count');
if (monsters.schema !== 'lumerift-premium-monster-production-v1') failures.push('monster schema');
if (monsters.entries.filter((entry) => entry.rank === 'elite').length !== 3) failures.push('elite count');
if (monsters.entries.filter((entry) => entry.rank === 'boss').length !== 1) failures.push('boss count');
if (monsterFrames !== 936) failures.push(`monster planned frames ${monsterFrames}`);
if (vfx.impactTiers.light.spokes !== 6 || vfx.impactTiers.heavy.spokes !== 8 || vfx.impactTiers.ultimate.spokes !== 12) failures.push('rune impact tiers');
if (ui.roles.length !== 4 || ui.initialBundleAddedBytes !== 0) failures.push('ui frame contract');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS v1.11.29 production contracts: character ${bodyFrames} frames, monsters ${monsterFrames} planned frames, tiered rune VFX, premium UI frame v3`);
}
