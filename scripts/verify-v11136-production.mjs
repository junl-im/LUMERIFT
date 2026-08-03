import { readFile, stat } from 'node:fs/promises';
const json=async(p)=>JSON.parse(await readFile(p,'utf8')); const failures=[];
const specs=[
 ['player','public/assets/live/v20/atlases/player/player_weapon_phases_v20.json','public/assets/live/v20/atlases/player/player_weapon_phases_v20.webp',120,24,554828],
 ['monster','public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.json','public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.webp',128,64,554686],
 ['core','public/assets/live/v20/atlases/effects/boss_core_events_v20.json','public/assets/live/v20/atlases/effects/boss_core_events_v20.webp',24,3,119212],
 ['status','public/assets/live/v20/atlases/effects/status_vfx_v20.json','public/assets/live/v20/atlases/effects/status_vfx_v20.webp',32,8,145708],
 ['ui','public/assets/live/v20/atlases/ui/premium_support_ui_v20.json','public/assets/live/v20/atlases/ui/premium_support_ui_v20.webp',16,16,29640]
];
for(const [label,a,i,f,n,b] of specs){const atlas=await json(a),image=await stat(i);if(Object.keys(atlas.frames??{}).length!==f||Object.keys(atlas.animations??{}).length!==n||image.size!==b)failures.push(label);}
const player=await json('public/assets/live/v20/production/PLAYER_WEAPON_PHASES_V20.json'); const monster=await json('public/assets/live/v20/production/MONSTER_DAMAGE_PARTS_V20.json'); const core=await json('public/assets/live/v20/production/BOSS_CORE_EVENTS_V20.json'); const status=await json('public/assets/live/v20/production/STATUS_VFX_V20.json'); const ui=await json('public/assets/live/v20/production/PREMIUM_SUPPORT_UI_V20.json');
if(player.phases.length!==5||player.directions!==8||player.attackFootprintChanged||player.finalFullBodyHandPaintedAtlasComplete)failures.push('player completion');
if(monster.states.length!==2||monster.directions!==8||monster.variants.length!==4||monster.gameplayTimingChanged||monster.finalFullBodyHandPaintedAtlasComplete)failures.push('monster completion');
if(core.events.length!==3||!core.reverseRegeneration||core.attackFootprintChanged)failures.push('core completion');
if(status.effects.length!==8||status.gameplayDataChanged||!status.adaptiveBudgetPreserved)failures.push('status completion');
if(ui.icons.length!==16||ui.initialBundleRequired)failures.push('ui completion');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('PASS v1.11.36 production: 320 raster frames, 115 animations, five v20 WebP Atlases, final full-body art still pending');
