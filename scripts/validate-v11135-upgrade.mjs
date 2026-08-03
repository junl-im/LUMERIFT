import { readFile, stat } from 'node:fs/promises';
const errors = [];
const read = (path) => readFile(path, 'utf8');
const json = async (path) => JSON.parse(await read(path));
const required = [
  'src/game/presentation/PlayerActionPhasesV19.ts','src/game/presentation/PlayerActionPhasesV19.test.ts',
  'src/game/presentation/PremiumMonsterDirectionV19.ts','src/game/presentation/PremiumMonsterDirectionV19.test.ts',
  'src/game/presentation/BossCoreTrailsV19.ts','src/game/presentation/BossCoreTrailsV19.test.ts',
  'src/game/presentation/PremiumCombatVfxV19.ts','src/game/presentation/PremiumCombatVfxV19.test.ts',
  'public/assets/live/v19/atlases/player/player_action_phases_v19.json','public/assets/live/v19/atlases/player/player_action_phases_v19.webp',
  'public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.json','public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.webp',
  'public/assets/live/v19/atlases/effects/boss_core_trails_v19.json','public/assets/live/v19/atlases/effects/boss_core_trails_v19.webp',
  'public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.json','public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.webp',
  'public/assets/live/v19/production/PLAYER_ACTION_PHASES_V19.json','public/assets/live/v19/production/MONSTER_DIRECTION_LIMB_V19.json',
  'public/assets/live/v19/production/BOSS_CORE_TRAILS_V19.json','public/assets/live/v19/production/PREMIUM_COMBAT_VFX_V19.json',
  'docs/PATCH_NOTES_v1.11.35.md','docs/PLAYER_ACTION_PHASES_v1.11.35.md','docs/MONSTER_DIRECTION_LIMB_v1.11.35.md',
  'docs/BOSS_CORE_TRAILS_v1.11.35.md','docs/PREMIUM_COMBAT_VFX_v1.11.35.md','docs/NEXT_UPDATE_v1.11.36.md'
];
for (const path of required) { try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); } catch { errors.push(`${path}: missing`); } }
const checks = {
  'src/game/presentation/PlayerActionPhasesV19.ts': ["'lumerift-player-action-phases-v19'", 'contact', 'sustain', 'recover'],
  'src/game/presentation/PremiumMonsterDirectionV19.ts': ["'lumerift-premium-monster-direction-v19'", 'three-quarter', 'premiumMonsterDirectionTextureV19'],
  'src/game/presentation/BossCoreTrailsV19.ts': ["'lumerift-boss-core-trails-v19'", 'bossCoreTrailTextureV19'],
  'src/game/presentation/PremiumCombatVfxV19.ts': ["'lumerift-premium-combat-vfx-v19'", 'ultimate', 'premiumCombatVfxTexturesV19'],
  'src/scenes/BattleScene.ts': ['premiumPlayerActionPhaseV19Sheet','premiumMonsterDirectionV19Sheet','bossCoreTrailV19Sheet','premiumCombatVfxV19Sheet'],
  'src/scenes/CharacterWardrobeScene.ts': ['premiumPlayerActionPhaseV19Atlas'],
  'src/core/assets/AssetCatalog.ts': ['premiumPlayerActionPhaseV19Atlas','premiumMonsterDirectionV19Atlas','bossCoreTrailV19Atlas','premiumCombatVfxV19Atlas','PREMIUM_RUNTIME_V19_CONTRACT_BUNDLE']
};
for (const [path,tokens] of Object.entries(checks)) { const content=await read(path); for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`); }
const specs = [
 ['player','public/assets/live/v19/atlases/player/player_action_phases_v19.json','public/assets/live/v19/atlases/player/player_action_phases_v19.webp',72,24,381100,768,864],
 ['monster','public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.json','public/assets/live/v19/atlases/monsters/monster_direction_limb_v19.webp',48,48,338474,768,576],
 ['core','public/assets/live/v19/atlases/effects/boss_core_trails_v19.json','public/assets/live/v19/atlases/effects/boss_core_trails_v19.webp',36,5,187820,768,480],
 ['vfx','public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.json','public/assets/live/v19/atlases/effects/premium_combat_vfx_v19.webp',24,6,127296,768,288]
];
for (const [label,atlasPath,imagePath,frames,animations,bytes,w,h] of specs) { const atlas=await json(atlasPath); const image=await stat(imagePath); if (Object.keys(atlas.frames??{}).length!==frames) errors.push(`${label} frames`); if (Object.keys(atlas.animations??{}).length!==animations) errors.push(`${label} animations`); if (atlas.meta?.version!=='1.11.35'||atlas.meta?.size?.w!==w||atlas.meta?.size?.h!==h) errors.push(`${label} metadata`); if (image.size!==bytes) errors.push(`${label} bytes ${image.size}`); }
const player=await json('public/assets/live/v19/production/PLAYER_ACTION_PHASES_V19.json');
const monster=await json('public/assets/live/v19/production/MONSTER_DIRECTION_LIMB_V19.json');
const core=await json('public/assets/live/v19/production/BOSS_CORE_TRAILS_V19.json');
const vfx=await json('public/assets/live/v19/production/PREMIUM_COMBAT_VFX_V19.json');
if (player.frames!==72||player.animations!==24||player.attackFootprintChanged||player.finalFullBodyHandPaintedAtlasComplete) errors.push('player contract');
if (monster.frames!==48||monster.animations!==48||monster.gameplayTimingChanged||monster.finalFullBodyHandPaintedAtlasComplete) errors.push('monster contract');
if (core.frames!==36||core.animations!==5||!core.continuousTrails||core.attackFootprintChanged) errors.push('core contract');
if (vfx.frames!==24||vfx.animations!==6||vfx.gameplayDataChanged||!vfx.adaptiveBudgetPreserved) errors.push('vfx contract');
const pkg=await json('package.json'), state=await json('HANDOFF_STATE.json'), release=await json('RELEASE_MANIFEST.json'), assets=await json('public/assets/ASSET_MANIFEST.json');
for (const [label,version] of Object.entries({package:pkg.version,state:state.version,release:release.version,assets:assets.release})) if (!/^1\.11\.(?:3[5-9]|[4-9]\d)$/.test(version)) errors.push(`${label} version ${version} is older than 1.11.35`);
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11135')||!pkg.scripts?.verify?.includes('validate:production:v11135')) errors.push('verify chain v11135');
const brand=await read('src/app/brand.ts'); if (!/version: '1\.11\.(?:3[5-9]|[4-9]\d)'/.test(brand)) errors.push('brand version is older than v1.11.35');
if (state.featureMetrics?.premiumPlayerActionPhaseV19Frames!==72||state.featureMetrics?.premiumMonsterDirectionV19Frames!==48||state.featureMetrics?.premiumBossCoreTrailV19Frames!==36||state.featureMetrics?.premiumCombatVfxV19Frames!==24) errors.push('feature metrics');
if (state.featureMetrics?.finalHandPaintedV19FullBodyAtlasesComplete!==false||state.featureMetrics?.physicalDeviceV11135Approved!==false) errors.push('completion flags');
if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; } else console.log('PASS v1.11.35 upgrade: 3-phase player actions, directional monster limbs, continuous boss core trails, premium combat VFX');
