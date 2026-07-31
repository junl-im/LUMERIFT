import { readFile, stat } from 'node:fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const assetManifest = JSON.parse(await readFile('public/assets/ASSET_MANIFEST.json', 'utf8'));
const errors = [];

if (pkg.version < '1.11.18') errors.push(`version: ${pkg.version}`);

const requiredFiles = [
  'public/assets/live/v9/atlases/player/player_character_fx_v9.webp',
  'public/assets/live/v9/atlases/player/player_character_fx_v9.json',
  'public/assets/live/v9/atlases/equipment/equipment_material_v9.webp',
  'public/assets/live/v9/atlases/equipment/equipment_material_v9.json',
  'art_source/lumerift_original/v1.11.18/character/player_character_fx_v9_master.png',
  'art_source/lumerift_original/v1.11.18/character/equipment_material_v9_master.png',
  'docs/PREMIUM_CHARACTER_SYSTEM_v1.11.18.md',
  'docs/EQUIPMENT_VISUAL_SYNC_v1.11.18.md',
  'docs/PATCH_NOTES_v1.11.18.md',
];
for (const path of requiredFiles) {
  try {
    if ((await stat(path)).size < 20) errors.push(`${path}: too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const playerAtlas = JSON.parse(await readFile('public/assets/live/v9/atlases/player/player_character_fx_v9.json', 'utf8'));
const equipmentAtlas = JSON.parse(await readFile('public/assets/live/v9/atlases/equipment/equipment_material_v9.json', 'utf8'));
for (const state of ['idle', 'attack', 'skill', 'dodge']) {
  for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    const key = `character_fx.${state}.${direction}`;
    if (!playerAtlas.frames?.[key]) errors.push(`character FX frame missing: ${key}`);
  }
}
for (const slot of ['weapon', 'armor', 'accessory']) {
  for (const grade of ['common', 'rare', 'heroic']) {
    const key = `equipment_material.${slot}.${grade}`;
    if (!equipmentAtlas.frames?.[key]) errors.push(`equipment material frame missing: ${key}`);
  }
}

const contracts = {
  'src/core/assets/AssetCatalog.ts': ['characterFxAtlas', 'equipmentMaterialAtlas', 'premium-character-v9'],
  'src/game/presentation/BattleActorView.ts': ['characterFxBack', 'resolveCharacterStateMaterial', 'equipmentAppearance.weaponTrailColor'],
  'src/game/presentation/CharacterEquipmentVisualProfile.ts': ['resolveCharacterEquipmentAppearance', 'materialFrameKey'],
  'src/game/presentation/CharacterStateMaterialProfile.ts': ['resolveCharacterStateMaterial', 'resolveFxState'],
  'src/scenes/BattleScene.ts': ['characterFxSheet', 'resolveCharacterEquipmentAppearance'],
  'src/scenes/LobbyScene.ts': ['equipmentMaterialSheet', '외형 동기화'],
  'src/scenes/InventoryScene.ts': ['equipmentMaterialSheet', 'materialFrameKey'],
};
for (const [path, markers] of Object.entries(contracts)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: marker missing ${marker}`);
}

const battleFiles = assetManifest.bundles?.['battle-chapter-1']?.files ?? [];
const equipmentFiles = assetManifest.bundles?.['equipment-ui']?.files ?? [];
if (!battleFiles.includes('live/v9/atlases/player/player_character_fx_v9.json')) errors.push('battle manifest missing character FX JSON');
if (!battleFiles.includes('live/v9/atlases/player/player_character_fx_v9.webp')) errors.push('battle manifest missing character FX WebP');
if (!equipmentFiles.includes('live/v9/atlases/equipment/equipment_material_v9.json')) errors.push('equipment manifest missing material JSON');
if (!equipmentFiles.includes('live/v9/atlases/equipment/equipment_material_v9.webp')) errors.push('equipment manifest missing material WebP');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.18 upgrade: directional character FX, equipment material sync, and lobby/inventory preview contracts');
}
