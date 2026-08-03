import { readFile, stat } from 'node:fs/promises';
const json=async(path)=>JSON.parse(await readFile(path,'utf8')); const failures=[];
const specs=[
 ['player','public/assets/live/v19/atlases/player/player_action_phases_v19.json','public/assets/live/v19/atlases/player/player_action_phases_v19.webp',72,24,381100],
 ['monster','public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.json','public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.webp',48,48,338474],
 ['core','public/assets/live/v19/atlases/effects/boss_core_trails_v19.json','public/assets/live/v19/atlases/effects/boss_core_trails_v19.webp',36,5,187820],
 ['vfx','public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.json','public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.webp',24,6,127296]
];
for (const [label,a,i,f,n,b] of specs) { const atlas=await json(a), image=await stat(i); if(Object.keys(atlas.frames??{}).length!==f||Object.keys(atlas.animations??{}).length!==n||image.size!==b) failures.push(label); }
const player=await json('public/assets/live/v19/production/PLAYER_ACTION_PHASES_V19.json'); const monster=await json('public/assets/live/v19/production/MONSTER_DIRECTION_LIMB_V19.json'); const core=await json('public/assets/live/v19/production/BOSS_CORE_TRAILS_V19.json'); const vfx=await json('public/assets/live/v19/production/PREMIUM_COMBAT_VFX_V19.json');
if(player.phases.length!==3||player.directions!==8||player.attackFootprintChanged||player.finalFullBodyHandPaintedAtlasComplete) failures.push('player completion');
if(monster.directions.length!==4||monster.variants.length!==4||monster.gameplayTimingChanged||monster.finalFullBodyHandPaintedAtlasComplete) failures.push('monster completion');
if(!core.continuousTrails||core.states.length!==5||core.attackFootprintChanged) failures.push('core completion');
if(vfx.effects.length!==6||vfx.gameplayDataChanged||!vfx.adaptiveBudgetPreserved) failures.push('vfx completion');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;} else console.log('PASS v1.11.35 production: 180 raster frames, 83 animations, four v19 WebP Atlases, final full-body art still pending');
