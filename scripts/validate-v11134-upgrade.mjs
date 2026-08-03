import { readFile, stat } from 'node:fs/promises';
const errors = [];
const read = (path) => readFile(path, 'utf8');
const json = async (path) => JSON.parse(await read(path));
const required = [
  'src/game/presentation/PlayerActionPartsV18.ts',
  'src/game/presentation/PlayerActionPartsV18.test.ts',
  'src/game/presentation/PremiumMonsterMotionAtlasV18.ts',
  'src/game/presentation/PremiumMonsterMotionAtlasV18.test.ts',
  'src/game/presentation/BossCoreFxV18.ts',
  'src/game/presentation/BossCoreFxV18.test.ts',
  'src/ui/PremiumUiIconArtV18.ts',
  'src/ui/PremiumUiIconArtV18.test.ts',
  'public/assets/live/v18/atlases/player/player_action_parts_v18.json',
  'public/assets/live/v18/atlases/player/player_action_parts_v18.webp',
  'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.json',
  'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.webp',
  'public/assets/live/v18/atlases/effects/boss_core_fx_v18.json',
  'public/assets/live/v18/atlases/effects/boss_core_fx_v18.webp',
  'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.json',
  'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.webp',
  'public/assets/live/v18/production/PLAYER_ACTION_PARTS_V18.json',
  'public/assets/live/v18/production/MONSTER_MOTION_PARTS_V18.json',
  'public/assets/live/v18/production/BOSS_CORE_FX_V18.json',
  'public/assets/live/v18/production/PREMIUM_UI_ICONS_V18.json',
  'docs/PATCH_NOTES_v1.11.34.md',
  'docs/PLAYER_ACTION_PARTS_v1.11.34.md',
  'docs/MONSTER_MOTION_PARTS_v1.11.34.md',
  'docs/BOSS_CORE_FX_v1.11.34.md',
  'docs/PREMIUM_UI_ICONS_v1.11.34.md',
  'docs/NEXT_UPDATE_v1.11.35.md',
];
for (const path of required) {
  try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); }
  catch { errors.push(`${path}: missing`); }
}
const checks = {
  'src/game/presentation/PlayerActionPartsV18.ts': ["'lumerift-player-action-parts-v18'", 'playerActionPartFrameV18', "'dodge'", "'skill'"],
  'src/game/presentation/PremiumCharacterDetailLayerView.ts': ['actionSheetV18?: Spritesheet', 'updateActionOverlayV18', 'playerActionPartFrameV18'],
  'src/game/presentation/PremiumMonsterMotionAtlasV18.ts': ["'lumerift-premium-monster-motion-v18'", 'premiumMonsterMotionTextureV18', "'enrage'"],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': ['motionV18Sheet?: Spritesheet', 'coreFxV18Sheet?: Spritesheet', 'updateMotionOverlayV18'],
  'src/game/presentation/BossCoreFxV18.ts': ["'lumerift-boss-core-fx-v18'", 'shattered: 8', 'regenerating: 8', 'bossCoreFxTextureV18'],
  'src/ui/PremiumUiIconArtV18.ts': ["'lumerift-premium-ui-icon-v18'", 'mobileQa', 'buildVerify'],
  'src/scenes/BattleScene.ts': ['premiumPlayerActionV18Sheet', 'premiumMonsterMotionV18Sheet', 'bossCoreFxV18Sheet', 'premiumUiV18Sheet'],
  'src/scenes/CharacterWardrobeScene.ts': ['premiumPlayerActionV18Atlas', 'actionPartSheet'],
  'src/scenes/InventoryScene.ts': ['premiumUiV18Sheet', 'premiumUiIconsV18Atlas'],
  'src/core/assets/AssetCatalog.ts': ['premiumPlayerActionV18Atlas', 'premiumMonsterMotionV18Atlas', 'bossCoreFxV18Atlas', 'premiumUiIconsV18Atlas', 'PREMIUM_RUNTIME_V18_CONTRACT_BUNDLE'],
};
for (const [path, tokens] of Object.entries(checks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}
const specs = [
  ['player-action', 'public/assets/live/v18/atlases/player/player_action_parts_v18.json', 'public/assets/live/v18/atlases/player/player_action_parts_v18.webp', 48, 24, 223776, 1024, 768],
  ['monster-motion', 'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.json', 'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.webp', 32, 16, 288136, 1024, 512],
  ['boss-core', 'public/assets/live/v18/atlases/effects/boss_core_fx_v18.json', 'public/assets/live/v18/atlases/effects/boss_core_fx_v18.webp', 30, 5, 301020, 1024, 512],
  ['ui', 'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.json', 'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.webp', 16, 16, 69584, 1024, 256],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes, width, height] of specs) {
  const atlas = await json(atlasPath); const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames) errors.push(`${label} frame count mismatch`);
  if (Object.keys(atlas.animations ?? {}).length !== animations) errors.push(`${label} animation count mismatch`);
  if (atlas.meta?.version !== '1.11.34' || atlas.meta?.size?.w !== width || atlas.meta?.size?.h !== height) errors.push(`${label} metadata mismatch`);
  if (image.size !== bytes) errors.push(`${label} image bytes ${image.size} != ${bytes}`);
}
const player = await json('public/assets/live/v18/production/PLAYER_ACTION_PARTS_V18.json');
const monster = await json('public/assets/live/v18/production/MONSTER_MOTION_PARTS_V18.json');
const core = await json('public/assets/live/v18/production/BOSS_CORE_FX_V18.json');
const ui = await json('public/assets/live/v18/production/PREMIUM_UI_ICONS_V18.json');
if (player.schema !== 'lumerift-player-action-parts-v18' || player.frames !== 48 || player.animations !== 24 || player.attackFootprintChanged || player.finalFullBodyHandPaintedAtlasComplete) errors.push('player v18 contract mismatch');
if (monster.schema !== 'lumerift-premium-monster-motion-v18' || monster.frames !== 32 || monster.animations !== 16 || monster.gameplayTimingChanged || monster.finalFullBodyHandPaintedAtlasComplete) errors.push('monster v18 contract mismatch');
if (core.schema !== 'lumerift-boss-core-fx-v18' || core.frames !== 30 || core.animations !== 5 || core.attackFootprintChanged) errors.push('boss core v18 contract mismatch');
if (ui.schema !== 'lumerift-premium-ui-icons-v18' || ui.frames !== 16 || ui.animations !== 16 || ui.gameplayDataChanged) errors.push('UI v18 contract mismatch');
const pkg = await json('package.json'); const state = await json('HANDOFF_STATE.json'); const release = await json('RELEASE_MANIFEST.json'); const assets = await json('public/assets/ASSET_MANIFEST.json');
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) if (!/^1\.11\.(?:3[4-9]|[4-9]\d)$/.test(version)) errors.push(`${label} version ${version} is older than 1.11.34`);
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11134') || !pkg.scripts?.verify?.includes('validate:production:v11134')) errors.push('verify chain missing v1.11.34');
const brand = await read('src/app/brand.ts'); if (!/version: '1\.11\.(?:3[4-9]|[4-9]\d)'/.test(brand)) errors.push('brand version is older than v1.11.34');
if (state.featureMetrics?.premiumPlayerActionV18Frames !== 48 || state.featureMetrics?.premiumMonsterMotionV18Frames !== 32 || state.featureMetrics?.premiumBossCoreFxV18Frames !== 30 || state.featureMetrics?.premiumUiIconsV18Frames !== 16) errors.push('v1.11.34 feature metrics mismatch');
if (state.featureMetrics?.finalHandPaintedV18FullBodyAtlasesComplete !== false || state.featureMetrics?.physicalDeviceV11134Approved !== false) errors.push('v1.11.34 completion flags mismatch');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.34 upgrade: action-specific player overlays, elite/boss motion overlays, 30-frame core loops, and 16 production UI icons');
