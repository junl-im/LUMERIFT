import { readFile, stat } from 'node:fs/promises';
const errors = [];
const read = (path) => readFile(path, 'utf8');
const json = async (path) => JSON.parse(await read(path));
const required = [
  'src/game/presentation/PremiumPartPlacementV17.ts',
  'src/game/presentation/PremiumPartPlacementV17.test.ts',
  'src/game/presentation/PremiumMonsterBodyAtlasV17.ts',
  'src/game/presentation/PremiumMonsterBodyAtlasV17.test.ts',
  'src/game/presentation/BossCoreFxV17.ts',
  'src/game/presentation/BossCoreFxV17.test.ts',
  'src/ui/PremiumUiIconArtV17.ts',
  'src/ui/PremiumUiIconArtV17.test.ts',
  'public/assets/live/v17/atlases/player/player_direction_parts_v17.json',
  'public/assets/live/v17/atlases/player/player_direction_parts_v17.webp',
  'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.json',
  'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.webp',
  'public/assets/live/v17/atlases/effects/boss_core_fx_v17.json',
  'public/assets/live/v17/atlases/effects/boss_core_fx_v17.webp',
  'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.json',
  'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.webp',
  'public/assets/live/v17/production/PLAYER_DIRECTION_PARTS_V17.json',
  'public/assets/live/v17/production/MONSTER_BODY_PARTS_V17.json',
  'public/assets/live/v17/production/BOSS_CORE_FX_V17.json',
  'public/assets/live/v17/production/PREMIUM_UI_ICONS_V17.json',
  'docs/PATCH_NOTES_v1.11.33.md',
  'docs/PLAYER_DIRECTION_PARTS_v1.11.33.md',
  'docs/MONSTER_BODY_PARTS_v1.11.33.md',
  'docs/BOSS_CORE_FX_v1.11.33.md',
  'docs/PREMIUM_UI_ICONS_v1.11.33.md',
  'docs/NEXT_UPDATE_v1.11.34.md',
];
for (const path of required) {
  try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); }
  catch { errors.push(`${path}: missing`); }
}
const checks = {
  'src/game/presentation/PremiumPartPlacementV17.ts': ["'lumerift-premium-part-placement-v17'", 'DIRECTION_PLACEMENTS', 'resolvePremiumAttackPlacement', 'playerDirectionalPartTexture'],
  'src/game/presentation/PremiumCharacterDetailLayerView.ts': ['directionSheet?: Spritesheet', 'resolvePremiumDirectionPlacement', 'resolvePremiumAttackPlacement'],
  'src/game/presentation/PremiumMonsterBodyAtlasV17.ts': ["'lumerift-premium-monster-body-v17'", 'monsterBodyTexturesV17', 'premiumMonsterBodyFamily'],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': ['bodyPartsV17Sheet?: Spritesheet', 'coreFxV17Sheet?: Spritesheet', 'monsterBodyTexturesV17'],
  'src/game/presentation/BossCoreFxV17.ts': ["'lumerift-boss-core-fx-v17'", "state === 'stable' ? 'shielded'", 'bossCoreFxTextureV17'],
  'src/ui/PremiumUiIconArtV17.ts': ["'lumerift-premium-ui-icon-v17'", 'timeline', 'merge'],
  'src/scenes/BattleScene.ts': ['premiumPlayerDirectionV17Sheet', 'premiumMonsterBodyV17Sheet', 'bossCoreFxV17Sheet', 'premiumUiV17Sheet'],
  'src/scenes/CharacterWardrobeScene.ts': ['premiumPlayerDirectionV17Atlas', 'directionPartSheet'],
  'src/scenes/InventoryScene.ts': ['premiumUiV17Sheet', 'premiumUiIconsV17Atlas'],
  'src/core/assets/AssetCatalog.ts': ['premiumPlayerDirectionV17Atlas', 'premiumMonsterBodyV17Atlas', 'bossCoreFxV17Atlas', 'premiumUiIconsV17Atlas', 'PREMIUM_RUNTIME_V17_CONTRACT_BUNDLE'],
};
for (const [path, tokens] of Object.entries(checks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}
const specs = [
  ['player-direction', 'public/assets/live/v17/atlases/player/player_direction_parts_v17.json', 'public/assets/live/v17/atlases/player/player_direction_parts_v17.webp', 32, 32, 131758, 1024, 512],
  ['monster-body', 'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.json', 'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.webp', 24, 24, 209430, 768, 512],
  ['boss-core', 'public/assets/live/v17/atlases/effects/boss_core_fx_v17.json', 'public/assets/live/v17/atlases/effects/boss_core_fx_v17.webp', 24, 5, 366868, 768, 512],
  ['ui', 'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.json', 'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.webp', 24, 24, 244692, 768, 512],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes, width, height] of specs) {
  const atlas = await json(atlasPath); const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames) errors.push(`${label} frame count mismatch`);
  if (Object.keys(atlas.animations ?? {}).length !== animations) errors.push(`${label} animation count mismatch`);
  if (atlas.meta?.version !== '1.11.33' || atlas.meta?.size?.w !== width || atlas.meta?.size?.h !== height) errors.push(`${label} metadata mismatch`);
  if (image.size !== bytes) errors.push(`${label} image bytes ${image.size} != ${bytes}`);
}
const player = await json('public/assets/live/v17/production/PLAYER_DIRECTION_PARTS_V17.json');
const monster = await json('public/assets/live/v17/production/MONSTER_BODY_PARTS_V17.json');
const core = await json('public/assets/live/v17/production/BOSS_CORE_FX_V17.json');
const ui = await json('public/assets/live/v17/production/PREMIUM_UI_ICONS_V17.json');
if (player.schema !== 'lumerift-premium-player-direction-parts-v17' || player.frames !== 32 || !player.directionAwareOcclusion || player.finalFullBodyHandPaintedAtlasComplete) errors.push('player v17 contract mismatch');
if (monster.schema !== 'lumerift-premium-monster-body-parts-v17' || monster.frames !== 24 || monster.families?.length !== 4 || monster.finalFullBodyHandPaintedAtlasComplete) errors.push('monster v17 contract mismatch');
if (core.schema !== 'lumerift-boss-core-fx-v17' || core.frames !== 24 || core.animations !== 5 || core.attackFootprintChanged) errors.push('boss core v17 contract mismatch');
if (ui.schema !== 'lumerift-premium-ui-icons-v17' || ui.frames !== 24 || ui.gameplayDataChanged) errors.push('UI v17 contract mismatch');
const pkg = await json('package.json'); const state = await json('HANDOFF_STATE.json'); const release = await json('RELEASE_MANIFEST.json'); const assets = await json('public/assets/ASSET_MANIFEST.json');
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) if (!/^1\.11\.(?:3[3-9]|[4-9]\d)$/.test(version)) errors.push(`${label} version ${version} is older than 1.11.33`);
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11133') || !pkg.scripts?.verify?.includes('validate:production:v11133')) errors.push('verify chain missing v1.11.33');
const brand = await read('src/app/brand.ts'); if (!/version: '1\.11\.(?:3[3-9]|[4-9]\d)'/.test(brand)) errors.push('brand version is older than 1.11.33');
if (state.featureMetrics?.premiumPlayerDirectionV17Frames !== 32 || state.featureMetrics?.premiumMonsterBodyV17Frames !== 24 || state.featureMetrics?.premiumBossCoreFxV17Frames !== 24 || state.featureMetrics?.premiumUiIconsV17Frames !== 24) errors.push('v1.11.33 feature metrics mismatch');
if (state.featureMetrics?.finalHandPaintedV17FullBodyAtlasesComplete !== false || state.featureMetrics?.physicalDeviceV11133Approved !== false) errors.push('v1.11.33 completion flags mismatch');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.33 upgrade: 8-direction pivots, expanded elite/boss bodies, denser boss core FX, and 24 premium UI icons');
