import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const atlasPath = 'public/assets/live/v11/atlases/player/player_weapon_attack_body_v11.json';
const imagePath = 'public/assets/live/v11/atlases/player/player_weapon_attack_body_v11.webp';
const masterPath = 'art_source/lumerift_original/v1.11.22/character/player_weapon_attack_body_v11_master.png';
const specPath = 'art_source/lumerift_original/v1.11.22/character/player_weapon_attack_body_v11_spec.json';

for (const path of [atlasPath, imagePath, masterPath, specPath, 'src/scenes/AppearancePresetManagerScene.ts', 'src/ui/TextPromptOverlay.ts']) {
  try {
    const info = await stat(path);
    if (info.size < 20) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const atlas = JSON.parse(await read(atlasPath));
const frameCount = Object.keys(atlas.frames ?? {}).length;
const animationCount = Object.keys(atlas.animations ?? {}).length;
if (frameCount !== 432) errors.push(`weapon attack frame count ${frameCount} != 432`);
if (animationCount !== 72) errors.push(`weapon attack animation count ${animationCount} != 72`);
for (const family of ['blade', 'greatblade', 'riftlance']) {
  for (const pose of ['attack1', 'attack2', 'attack3']) {
    for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
      const key = `weapon_body.${family}.${pose}.${direction}`;
      if ((atlas.animations?.[key]?.length ?? 0) !== 6) errors.push(`${key}: expected 6 frames`);
    }
  }
}
if (atlas.meta?.productionStatus !== 'production-candidate-generated-derivative') errors.push('attack atlas production status missing');

const sources = {
  'src/core/assets/AssetCatalog.ts': ['weaponAttackBodyAtlas', 'player_weapon_attack_body_v11.json', 'weapon-attack-body-v11'],
  'src/game/presentation/WeaponBodyAttackFrames.ts': ['dedicatedAttackSheet', 'weapon_body.${family}.${pose}.${direction}', '전용 Atlas'],
  'src/game/presentation/BattleActorView.ts': ['weaponAttackBodySheet', 'this.weaponAttackBodySheet'],
  'src/scenes/BattleScene.ts': ['ASSET_PATHS.weaponAttackBodyAtlas', 'weaponAttackBodySheet:'],
  'src/scenes/CharacterWardrobeScene.ts': ['characterAppearanceFocusLabel', 'characterPreviewZoomMultiplier', 'AppearancePresetManagerScene'],
  'src/core/presentation/CharacterWardrobeController.ts': ['toggleRecentFavorite', 'renameRecentPreset', 'exportPresetArchive', 'importPresetArchive', 'character-appearance-presets'],
  'src/scenes/AppearancePresetManagerScene.ts': ['JSON 내보내기', 'JSON 가져오기', '즐겨찾기', '이름 변경'],
};
for (const [path, tokens] of Object.entries(sources)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const calibration = await read('src/core/performance/CharacterDisplayCalibration.ts');
if (!calibration.includes("captureStatus: 'pending-physical-capture'")) errors.push('physical capture pending status missing');
if (calibration.includes("captureStatus: 'capture-verified'")) errors.push('physical capture verification must not be claimed in profile data');

const pkg = JSON.parse(await read('package.json'));
if (!versionAtLeast(pkg.version, '1.11.22')) errors.push(`package version ${pkg.version} is older than 1.11.22`);
if (pkg.scripts?.['validate:upgrade:v11122'] !== 'node scripts/validate-v11122-upgrade.mjs') errors.push('v1.11.22 package validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11122')) errors.push('verify chain missing v1.11.22');

const manifest = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
const battleFiles = manifest.bundles?.['battle-chapter-1']?.files ?? [];
for (const path of ['live/v11/atlases/player/player_weapon_attack_body_v11.json', 'live/v11/atlases/player/player_weapon_attack_body_v11.webp']) {
  if (!battleFiles.includes(path)) errors.push(`battle manifest missing ${path}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.22 upgrade: 432-frame weapon attack atlas, part focus zoom, and appearance preset vault');
}

function versionAtLeast(actual, minimum) {
  const left = actual.split('.').map(Number);
  const right = minimum.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((left[index] ?? 0) > (right[index] ?? 0)) return true;
    if ((left[index] ?? 0) < (right[index] ?? 0)) return false;
  }
  return true;
}
