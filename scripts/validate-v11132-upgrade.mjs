import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const json = async (path) => JSON.parse(await read(path));
const required = [
  'src/game/presentation/PremiumPartAtlasV16.ts',
  'src/game/presentation/PremiumPartAtlasV16.test.ts',
  'src/ui/PremiumUiIconArtV16.ts',
  'src/ui/PremiumUiIconArtV16.test.ts',
  'public/assets/live/v16/atlases/player/player_parts_v16.json',
  'public/assets/live/v16/atlases/player/player_parts_v16.webp',
  'public/assets/live/v16/atlases/monsters/monster_parts_v16.json',
  'public/assets/live/v16/atlases/monsters/monster_parts_v16.webp',
  'public/assets/live/v16/atlases/effects/boss_core_fx_v16.json',
  'public/assets/live/v16/atlases/effects/boss_core_fx_v16.webp',
  'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.json',
  'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.webp',
  'public/assets/live/v16/production/PLAYER_PARTS_V16.json',
  'public/assets/live/v16/production/MONSTER_PARTS_V16.json',
  'public/assets/live/v16/production/BOSS_CORE_FX_V16.json',
  'public/assets/live/v16/production/PREMIUM_UI_ICONS_V16.json',
  'docs/PATCH_NOTES_v1.11.32.md',
  'docs/PREMIUM_PARTS_ATLAS_v1.11.32.md',
  'docs/BOSS_CORE_FX_v1.11.32.md',
  'docs/PREMIUM_UI_ICONS_v1.11.32.md',
  'docs/NEXT_UPDATE_v1.11.33.md',
];
for (const path of required) {
  try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); }
  catch { errors.push(`${path}: missing`); }
}

const checks = {
  'src/game/presentation/PremiumPartAtlasV16.ts': ["'lumerift-premium-part-atlas-v16'", 'playerWeaponPartTexture', 'monsterPartTextures', 'bossCoreFxTexture'],
  'src/game/presentation/PremiumCharacterDetailLayerView.ts': ['partsSheet?: Spritesheet', 'updatePaintedParts', 'PREMIUM_PLAYER_PART_KEYS'],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': ['coreFxSheet?: Spritesheet', 'updatePaintedParts', 'monsterPartTextures'],
  'src/scenes/BattleScene.ts': ['premiumPlayerPartsSheet', 'premiumMonsterPartsSheet', 'bossCoreFxSheet', 'premiumUiV16Sheet', 'bossThreatPatternSprite'],
  'src/scenes/CharacterWardrobeScene.ts': ['premiumPlayerPartsAtlas', 'premiumPartSheet'],
  'src/scenes/InventoryScene.ts': ['premiumUiV16Sheet', 'premiumGradeTextureKey'],
  'src/ui/PremiumUiIconArtV16.ts': ["'lumerift-premium-ui-icon-v16'", 'premiumBossPatternTextureKey', 'gradeLegendary'],
  'src/core/assets/AssetCatalog.ts': ['premiumPlayerPartsAtlas', 'premiumMonsterPartsAtlas', 'bossCoreFxAtlas', 'premiumUiIconsV16Atlas', 'PREMIUM_RUNTIME_V16_CONTRACT_BUNDLE'],
};
for (const [path, tokens] of Object.entries(checks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const atlasSpecs = [
  ['player', 'public/assets/live/v16/atlases/player/player_parts_v16.json', 'public/assets/live/v16/atlases/player/player_parts_v16.webp', 16, 16, 120320, 512, 512],
  ['monster', 'public/assets/live/v16/atlases/monsters/monster_parts_v16.json', 'public/assets/live/v16/atlases/monsters/monster_parts_v16.webp', 16, 16, 151360, 512, 512],
  ['core', 'public/assets/live/v16/atlases/effects/boss_core_fx_v16.json', 'public/assets/live/v16/atlases/effects/boss_core_fx_v16.webp', 12, 5, 87228, 512, 384],
  ['ui', 'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.json', 'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.webp', 16, 16, 173434, 512, 512],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes, width, height] of atlasSpecs) {
  const atlas = await json(atlasPath);
  const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames) errors.push(`${label} frame count mismatch`);
  if (Object.keys(atlas.animations ?? {}).length !== animations) errors.push(`${label} animation count mismatch`);
  if (atlas.meta?.version !== '1.11.32' || atlas.meta?.size?.w !== width || atlas.meta?.size?.h !== height) errors.push(`${label} metadata mismatch`);
  if (image.size !== bytes) errors.push(`${label} image bytes ${image.size} != ${bytes}`);
}

const player = await json('public/assets/live/v16/production/PLAYER_PARTS_V16.json');
const monster = await json('public/assets/live/v16/production/MONSTER_PARTS_V16.json');
const core = await json('public/assets/live/v16/production/BOSS_CORE_FX_V16.json');
const ui = await json('public/assets/live/v16/production/PREMIUM_UI_ICONS_V16.json');
if (player.schema !== 'lumerift-premium-player-parts-v16' || player.frames !== 16 || player.finalFullBodyHandPaintedAtlasComplete !== false) errors.push('player contract mismatch');
if (monster.schema !== 'lumerift-premium-monster-parts-v16' || monster.frames !== 16 || monster.finalFullBodyHandPaintedAtlasComplete !== false) errors.push('monster contract mismatch');
if (core.schema !== 'lumerift-boss-core-fx-v16' || core.frames !== 12 || core.states?.length !== 5 || core.attackFootprintChanged !== false) errors.push('boss core FX contract mismatch');
if (ui.schema !== 'lumerift-premium-ui-icons-v16' || ui.frames !== 16 || ui.gameplayDataChanged !== false) errors.push('premium UI icon contract mismatch');

const pkg = await json('package.json');
const state = await json('HANDOFF_STATE.json');
const release = await json('RELEASE_MANIFEST.json');
const assets = await json('public/assets/ASSET_MANIFEST.json');
const atLeast = (value, minimum) => {
  const a = String(value).split('.').map(Number); const b = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) { if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0); }
  return true;
};
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!atLeast(version, '1.11.32')) errors.push(`${label} version ${version} is older than 1.11.32`);
}
if (assets.bundles?.['premium-player-parts-v16']?.bytes !== 129005) errors.push('player bundle bytes mismatch');
if (assets.bundles?.['premium-monster-parts-v16']?.bytes !== 160049) errors.push('monster bundle bytes mismatch');
if (assets.bundles?.['boss-core-fx-v16']?.bytes !== 93217) errors.push('boss core bundle bytes mismatch');
if (assets.bundles?.['premium-ui-icons-v16']?.bytes !== 181631) errors.push('UI bundle bytes mismatch');
if (assets.bundles?.['premium-runtime-contract-v16']?.bytes !== 3357) errors.push('v16 contract bundle bytes mismatch');
if ((assets.deployment?.publicAssetFiles ?? 0) < 82 || (assets.activeRuntimeBytes ?? 0) < 11893243) errors.push('v1.11.32 public asset metrics regressed');
if (state.featureMetrics?.premiumPlayerPartFrames !== 16 || state.featureMetrics?.premiumBossCoreFxFrames !== 12 || state.featureMetrics?.premiumUiIconsV16Frames !== 16) errors.push('v1.11.32 feature metrics mismatch');
if (state.featureMetrics?.finalHandPaintedV16FullBodyAtlasesComplete !== false || state.featureMetrics?.physicalDeviceV11132Approved !== false) errors.push('v1.11.32 completion/approval flags mismatch');
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11132') || !pkg.scripts?.verify?.includes('validate:production:v11132')) errors.push('verify chain missing v1.11.32');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${pkg.version}'`)) errors.push('brand version mismatch');

if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.32 upgrade: raster player/monster parts, boss core FX, premium UI icons, and safe fallbacks');
