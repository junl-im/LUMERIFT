import { readFile } from 'node:fs/promises';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const character = await json('public/assets/live/v14/production/CHARACTER_RUNTIME_V14.json');
const monsters = await json('public/assets/live/v14/production/MONSTER_RUNTIME_V14.json');
const vfx = await json('public/assets/live/v14/production/RUNE_VFX_V14.json');
const ui = await json('public/assets/live/v14/production/UI_FRAME_V14.json');
const failures = [];
if (character.schema !== 'lumerift-premium-character-runtime-v2') failures.push('character schema');
if (character.runtimeLayers.length !== 10 || Object.keys(character.weaponFamilies).length !== 3) failures.push('character layers/families');
if (monsters.schema !== 'lumerift-premium-monster-runtime-v2' || monsters.variants.length !== 4) failures.push('monster variants');
if (monsters.variants.find((entry) => entry.id === 'abyssal-harbinger')?.phaseShards !== 10) failures.push('boss phase shards');
if (vfx.impactTiers.light.sparks !== 5 || vfx.impactTiers.heavy.sparks !== 8 || vfx.impactTiers.ultimate.sparks !== 12) failures.push('spark tiers');
if (ui.schema !== 'lumerift-premium-ui-frame-v3.1' || ui.initialBundleAddedBytes !== 0) failures.push('UI frame');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.30 production contracts: 10 character layers, 3 weapon silhouettes, 4 monster variants, 5/8/12 sparks, UI Frame v3.1');
