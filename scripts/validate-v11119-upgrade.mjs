import { readFile, stat } from 'node:fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const assetManifest = JSON.parse(await readFile('public/assets/ASSET_MANIFEST.json', 'utf8'));
const errors = [];

if (pkg.version < '1.11.19') errors.push(`version: ${pkg.version}`);

const requiredFiles = [
  'public/assets/live/v10/atlases/player/player_premium_body_v10.webp',
  'public/assets/live/v10/atlases/player/player_premium_body_v10.json',
  'art_source/lumerift_original/v1.11.19/character/player_premium_body_v10_master.png',
  'art_source/lumerift_original/v1.11.19/character/player_premium_body_v10_spec.json',
  'tools/build_premium_character_v119.py',
  'src/core/presentation/CharacterDyeController.ts',
  'docs/PREMIUM_DIRECTIONAL_BODY_v1.11.19.md',
  'docs/CHARACTER_DYE_AND_WEAPON_VISUALS_v1.11.19.md',
  'docs/PATCH_NOTES_v1.11.19.md',
];
for (const path of requiredFiles) {
  try {
    if ((await stat(path)).size < 20) errors.push(`${path}: too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const atlas = JSON.parse(await readFile('public/assets/live/v10/atlases/player/player_premium_body_v10.json', 'utf8'));
if (atlas.meta?.version !== '1.11.19') errors.push(`player v10 atlas version mismatch: ${atlas.meta?.version}`);
if (Object.keys(atlas.frames ?? {}).length !== 648) errors.push(`player v10 frame count: ${Object.keys(atlas.frames ?? {}).length} / 648`);
if (Object.keys(atlas.animations ?? {}).length !== 80) errors.push(`player v10 animation count: ${Object.keys(atlas.animations ?? {}).length} / 80`);
for (const state of ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'hit', 'death', 'dodge']) {
  for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    const key = `player.${state}.${direction}`;
    const frames = atlas.animations?.[key];
    if (!Array.isArray(frames) || frames.length < 3) errors.push(`player v10 animation missing: ${key}`);
  }
}

const contracts = {
  'src/app/brand.ts': ['characterDyePreset'],
  'src/app/AppContext.ts': ['characterDye: CharacterDyeController'],
  'src/app/GameApp.ts': ['new CharacterDyeController()', 'characterDye,'],
  'src/core/assets/AssetCatalog.ts': ['player_premium_body_v10.json', 'legacyPlayerAtlas', '프리미엄 8방향 플레이어 본체 v10'],
  'src/core/presentation/CharacterDyeController.ts': ['heir-gold', 'rift-azure', 'abyss-violet', 'moon-silver'],
  'src/game/presentation/CharacterEquipmentVisualProfile.ts': ['weaponVisualFamily', 'setHarmony', 'bodyTint', 'resolveWeaponVisualFamily'],
  'src/game/presentation/BattleActorView.ts': ['weaponSilhouette', 'drawWeaponSilhouette', 'equipmentAppearance.bodyTint'],
  'src/scenes/BattleScene.ts': ['context.characterDye.current', 'spriteBaseScale: this.usingOwnedPlayerPreview || this.usingOwnedPaintedCandidate ? 1.36 : 2.02'],
  'src/scenes/LobbyScene.ts': ['characterDyeLabel', 'weaponVisualFamilyLabel', '세트 조화'],
  'src/scenes/SettingsScene.ts': ['염색 · ${characterDyeLabel(context.characterDye.current)}', 'context.characterDye.cycle()'],
};
for (const [path, markers] of Object.entries(contracts)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: marker missing ${marker}`);
}

const battleFiles = assetManifest.bundles?.['battle-chapter-1']?.files ?? [];
const fallbackFiles = assetManifest.bundles?.['legacy-player-fallback']?.files ?? [];
if (!battleFiles.includes('live/v10/atlases/player/player_premium_body_v10.json')) errors.push('battle manifest missing player v10 JSON');
if (!battleFiles.includes('live/v10/atlases/player/player_premium_body_v10.webp')) errors.push('battle manifest missing player v10 WebP');
if (!fallbackFiles.includes('live/v4/atlases/player/player_live_v4.json')) errors.push('legacy fallback manifest missing v4 JSON');
if (!fallbackFiles.includes('live/v4/atlases/player/player_live_v4.webp')) errors.push('legacy fallback manifest missing v4 WebP');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.19 upgrade: premium 8-direction body atlas, weapon silhouettes, dye presets, and legacy fallback contracts');
}
