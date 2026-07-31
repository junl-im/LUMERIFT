import { readFile, stat } from 'node:fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const atlas = JSON.parse(await readFile('public/assets/live/v10/atlases/player/player_premium_body_v10.json', 'utf8'));
const calibration = await readFile('src/core/performance/CharacterDisplayCalibration.ts', 'utf8');
const errors = [];

const versionParts = pkg.version.split('.').map(Number);
const minimumParts = [1, 11, 21];
if (versionParts.some((value, index) => value < minimumParts[index] && versionParts.slice(0, index).every((part, partIndex) => part === minimumParts[partIndex]))) errors.push(`version: ${pkg.version}`);

const requiredFiles = [
  'src/core/presentation/CharacterWardrobeController.ts',
  'src/core/presentation/CharacterWardrobeController.test.ts',
  'src/core/performance/CharacterDisplayCalibration.ts',
  'src/core/performance/CharacterDisplayCalibration.test.ts',
  'src/game/combat/WeaponMotionProfile.ts',
  'src/game/presentation/WeaponBodyAttackFrames.ts',
  'src/game/presentation/WeaponBodyAttackFrames.test.ts',
  'src/scenes/CharacterWardrobeScene.ts',
  'docs/CHARACTER_STUDIO_v1.11.21.md',
  'docs/WEAPON_BODY_ATTACK_FRAMES_v1.11.21.md',
  'docs/MOBILE_CHARACTER_CAPTURE_CALIBRATION_v1.11.21.md',
  'docs/PATCH_NOTES_v1.11.21.md',
  'docs/NEXT_UPDATE_v1.11.22.md',
];
for (const path of requiredFiles) {
  try {
    if ((await stat(path)).size < 40) errors.push(`${path}: too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const contracts = {
  'src/app/brand.ts': ['version:', 'characterWardrobe'],
  'src/core/presentation/CharacterWardrobeController.ts': [
    'rotateDirection', 'cycleComparisonSlot', 'cycleCostumeSet', 'cycleDyeChannel',
    'recentPresets', 'applyRecentPreset', 'MAX_RECENT_PRESETS = 5',
  ],
  'src/scenes/CharacterWardrobeScene.ts': [
    'BEFORE · 현재 외형', 'AFTER · 교체 외형',
    'resolveWeaponBodyTextures', 'resolveCharacterDisplayCalibration',
  ],
  'src/game/presentation/CharacterEquipmentVisualProfile.ts': [
    'equipmentOverrides', 'scout-steel', 'warden-rift', 'harbinger-heir', 'dyeChannels',
  ],
  'src/game/presentation/WeaponBodyAttackFrames.ts': [
    'resolveWeaponBodyFrameRecipe', 'greatblade', 'riftlance', 'frameOrder',
  ],
  'src/game/combat/WeaponMotionProfile.ts': [
    'anticipationRatio', 'contactRatio', 'recoveryRatio', 'resolveWeaponAttackTiming',
  ],
  'src/game/presentation/PlayerMotionDirector.ts': ['weaponFamily', 'resolveWeaponAttackTiming'],
  'src/game/presentation/BattleActorView.ts': ['resolveWeaponBodyTextures', 'displayCalibration'],
  'src/scenes/BattleScene.ts': ['costumeSet: wardrobe.costumeSet', 'displayCalibration: resolveCharacterDisplayCalibration()'],
  'src/scenes/LobbyScene.ts': ['costumeSet: wardrobe.costumeSet', 'dyeChannels: wardrobe.dyeChannels'],
};
for (const [path, markers] of Object.entries(contracts)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: marker missing ${marker}`);
}


const wardrobeScene = await readFile('src/scenes/CharacterWardrobeScene.ts', 'utf8');
if (!wardrobeScene.includes('최근 외형 빠른 적용') && !wardrobeScene.includes('AppearancePresetManagerScene')) {
  errors.push('src/scenes/CharacterWardrobeScene.ts: recent appearance quick-apply flow missing');
}

for (const pose of ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'dodge']) {
  for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    const frames = atlas.animations?.[`player.${pose}.${direction}`];
    if (!Array.isArray(frames) || frames.length < 3) errors.push(`8-direction animation missing: player.${pose}.${direction}`);
  }
}

for (const platform of ['android-chrome', 'ios-safari', 'generic-mobile', 'desktop']) {
  if (!calibration.includes(`'${platform}'`)) errors.push(`calibration platform missing: ${platform}`);
}
if (!calibration.includes("captureStatus: 'pending-physical-capture'")) errors.push('pending capture status missing');
if (calibration.includes("captureStatus: 'capture-verified'")) errors.push('physical capture verification must not be claimed in profile data');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.21 upgrade: 8-direction studio comparison, weapon body recipes, detailed dye presets, and capture-pending mobile calibration');
}
