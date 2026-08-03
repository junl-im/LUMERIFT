import { readFile, stat } from 'node:fs/promises';
const errors=[]; const read=(p)=>readFile(p,'utf8'); const json=async(p)=>JSON.parse(await read(p));
const required=[
 'src/game/presentation/PlayerWeaponPhasesV20.ts','src/game/presentation/PlayerWeaponPhasesV20.test.ts',
 'src/game/presentation/MonsterDamagePartsV20.ts','src/game/presentation/MonsterDamagePartsV20.test.ts',
 'src/game/presentation/BossCoreEventsV20.ts','src/game/presentation/BossCoreEventsV20.test.ts',
 'src/game/presentation/PremiumStatusVfxV20.ts','src/game/presentation/PremiumStatusVfxV20.test.ts',
 'src/ui/PremiumSupportUiV20.ts','src/ui/PremiumSupportUiV20.test.ts',
 'public/assets/live/v20/atlases/player/player_weapon_phases_v20.json','public/assets/live/v20/atlases/player/player_weapon_phases_v20.webp',
 'public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.json','public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.webp',
 'public/assets/live/v20/atlases/effects/boss_core_events_v20.json','public/assets/live/v20/atlases/effects/boss_core_events_v20.webp',
 'public/assets/live/v20/atlases/effects/status_vfx_v20.json','public/assets/live/v20/atlases/effects/status_vfx_v20.webp',
 'public/assets/live/v20/atlases/ui/premium_support_ui_v20.json','public/assets/live/v20/atlases/ui/premium_support_ui_v20.webp',
 'public/assets/live/v20/production/PLAYER_WEAPON_PHASES_V20.json','public/assets/live/v20/production/MONSTER_DAMAGE_PARTS_V20.json',
 'public/assets/live/v20/production/BOSS_CORE_EVENTS_V20.json','public/assets/live/v20/production/STATUS_VFX_V20.json','public/assets/live/v20/production/PREMIUM_SUPPORT_UI_V20.json',
 'docs/PATCH_NOTES_v1.11.36.md','docs/PLAYER_WEAPON_PHASES_v1.11.36.md','docs/MONSTER_DAMAGE_PARTS_v1.11.36.md','docs/BOSS_CORE_EVENTS_v1.11.36.md','docs/STATUS_VFX_SUPPORT_UI_v1.11.36.md','docs/NEXT_UPDATE_v1.11.37.md'
];
for(const path of required){try{if((await stat(path)).size<100)errors.push(`${path}: too small`);}catch{errors.push(`${path}: missing`);}}
const checks={
 'src/game/presentation/PlayerWeaponPhasesV20.ts':["'lumerift-player-weapon-phases-v20'",'anticipation','follow-through','playerWeaponPhaseFrameV20'],
 'src/game/presentation/PremiumCharacterDetailLayerView.ts':['weaponPhaseSheetV20?: Spritesheet','updateWeaponPhaseOverlayV20','playerWeaponPhaseFrameV20'],
 'src/game/presentation/MonsterDamagePartsV20.ts':["'lumerift-monster-damage-parts-v20'","'down'",'monsterDamageTextureV20'],
 'src/game/presentation/PremiumMonsterDetailLayerView.ts':['damageV20Sheet?: Spritesheet','coreEventV20Sheet?: Spritesheet','updateDamageOverlayV20'],
 'src/game/presentation/BossCoreEventsV20.ts':["'lumerift-boss-core-events-v20'",'reverse-regenerate','bossCoreEventTextureV20'],
 'src/game/presentation/PremiumStatusVfxV20.ts':["'lumerift-status-vfx-v20'",'premiumStatusVfxTexturesV20'],
 'src/game/presentation/BattleActorView.ts':['premiumMonsterDamageV20Sheet','bossCoreEventV20Sheet','premiumStatusV20Sheet','statusVfx'],
 'src/scenes/BattleScene.ts':['premiumPlayerWeaponPhaseV20Sheet','premiumMonsterDamageV20Sheet','bossCoreEventV20Sheet','premiumStatusV20Sheet'],
 'src/scenes/CharacterWardrobeScene.ts':['premiumPlayerWeaponPhaseV20Atlas'],
 'src/ui/PremiumSupportUiV20.ts':["'lumerift-premium-support-ui-v20'",'mobileVerify','recovery','cloud'],
 'src/core/assets/AssetCatalog.ts':['premiumPlayerWeaponPhaseV20Atlas','premiumMonsterDamageV20Atlas','bossCoreEventV20Atlas','premiumStatusV20Atlas','premiumSupportUiV20Atlas','PREMIUM_RUNTIME_V20_CONTRACT_BUNDLE']
};
for(const [path,tokens] of Object.entries(checks)){const content=await read(path);for(const token of tokens)if(!content.includes(token))errors.push(`${path}: missing ${token}`);}
const specs=[
 ['player','public/assets/live/v20/atlases/player/player_weapon_phases_v20.json','public/assets/live/v20/atlases/player/player_weapon_phases_v20.webp',120,24,554828,768,1440],
 ['monster','public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.json','public/assets/live/v20/atlases/monsters/monster_damage_parts_v20.webp',128,64,554686,768,1536],
 ['core','public/assets/live/v20/atlases/effects/boss_core_events_v20.json','public/assets/live/v20/atlases/effects/boss_core_events_v20.webp',24,3,119212,768,288],
 ['status','public/assets/live/v20/atlases/effects/status_vfx_v20.json','public/assets/live/v20/atlases/effects/status_vfx_v20.webp',32,8,145708,768,384],
 ['ui','public/assets/live/v20/atlases/ui/premium_support_ui_v20.json','public/assets/live/v20/atlases/ui/premium_support_ui_v20.webp',16,16,29640,768,192]
];
for(const [label,a,i,f,n,b,w,h] of specs){const atlas=await json(a),image=await stat(i);if(Object.keys(atlas.frames??{}).length!==f)errors.push(`${label} frames`);if(Object.keys(atlas.animations??{}).length!==n)errors.push(`${label} animations`);if(atlas.meta?.version!=='1.11.36'||atlas.meta?.size?.w!==w||atlas.meta?.size?.h!==h)errors.push(`${label} metadata`);if(image.size!==b)errors.push(`${label} bytes ${image.size}`);}
const player=await json('public/assets/live/v20/production/PLAYER_WEAPON_PHASES_V20.json');
const monster=await json('public/assets/live/v20/production/MONSTER_DAMAGE_PARTS_V20.json');
const core=await json('public/assets/live/v20/production/BOSS_CORE_EVENTS_V20.json');
const status=await json('public/assets/live/v20/production/STATUS_VFX_V20.json');
const ui=await json('public/assets/live/v20/production/PREMIUM_SUPPORT_UI_V20.json');
if(player.frames!==120||player.animations!==24||player.weapons.length!==3||player.phases.length!==5||player.directions!==8||player.attackFootprintChanged||player.finalFullBodyHandPaintedAtlasComplete)errors.push('player contract');
if(monster.frames!==128||monster.animations!==64||monster.variants.length!==4||monster.directions!==8||monster.gameplayTimingChanged||monster.finalFullBodyHandPaintedAtlasComplete)errors.push('monster contract');
if(core.frames!==24||core.animations!==3||!core.reverseRegeneration||core.attackFootprintChanged)errors.push('core contract');
if(status.frames!==32||status.animations!==8||status.effects.length!==8||status.gameplayDataChanged||!status.adaptiveBudgetPreserved)errors.push('status contract');
if(ui.frames!==16||ui.animations!==16||ui.icons.length!==16||ui.initialBundleRequired)errors.push('ui contract');
const pkg=await json('package.json'),state=await json('HANDOFF_STATE.json'),release=await json('RELEASE_MANIFEST.json'),assets=await json('public/assets/ASSET_MANIFEST.json');
for(const [label,version] of Object.entries({package:pkg.version,state:state.version,release:release.version,assets:assets.release}))if(version!=='1.11.36')errors.push(`${label} version ${version}`);
if(!pkg.scripts?.verify?.includes('validate:upgrade:v11136')||!pkg.scripts?.verify?.includes('validate:production:v11136'))errors.push('verify chain v11136');
const brand=await read('src/app/brand.ts');if(!brand.includes("version: '1.11.36'"))errors.push('brand version');
if(state.featureMetrics?.premiumPlayerWeaponPhaseV20Frames!==120||state.featureMetrics?.premiumMonsterDamageV20Frames!==128||state.featureMetrics?.premiumBossCoreEventsV20Frames!==24||state.featureMetrics?.premiumStatusVfxV20Frames!==32||state.featureMetrics?.premiumSupportUiV20Frames!==16)errors.push('feature metrics');
if(state.featureMetrics?.finalHandPaintedV20FullBodyAtlasesComplete!==false||state.featureMetrics?.physicalDeviceV11136Approved!==false)errors.push('completion flags');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('PASS v1.11.36 upgrade: five-phase weapons, 8-direction damage/down, core follow-up events, status VFX, support UI');
