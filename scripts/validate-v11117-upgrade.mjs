import { readFile, stat } from 'node:fs/promises';
const pkg=JSON.parse(await readFile('package.json','utf8'));
const errors=[];
if(pkg.version<'1.11.17') errors.push('version');
for(const f of ['public/assets/live/v8/portraits/hero_premium_v8.webp','public/assets/live/v8/atlases/player/player_premium_overlay_v8.webp','public/assets/live/v8/atlases/player/player_premium_overlay_v8.json','docs/PREMIUM_CHARACTER_ART_v1.11.17.md']){try{if((await stat(f)).size<20) errors.push(f);}catch{errors.push(f)}}
for(const [f,m] of Object.entries({'src/core/assets/AssetCatalog.ts':['hero_premium_v8.webp','premiumPlayerOverlayAtlas'],'src/game/presentation/BattleActorView.ts':['premiumOverlaySheet','resolvePremiumOverlayTexture'],'src/scenes/BattleScene.ts':['premiumPlayerOverlaySheet']})){const s=await readFile(f,'utf8');for(const x of m)if(!s.includes(x))errors.push(`${f}:${x}`)}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log('PASS v1.11.17 upgrade: premium portrait and 8-direction character material overlay contracts');
