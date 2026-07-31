import { readFile, stat } from 'node:fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const atlas = JSON.parse(await readFile('public/assets/live/v10/atlases/player/player_premium_body_v10.json', 'utf8'));
const errors = [];

if (pkg.version < '1.11.20') errors.push(`version: ${pkg.version}`);

const requiredFiles = [
  'src/core/presentation/CharacterWardrobeController.ts',
  'src/core/presentation/CharacterWardrobeController.test.ts',
  'src/game/combat/WeaponMotionProfile.ts',
  'src/game/combat/WeaponMotionProfile.test.ts',
  'src/scenes/CharacterWardrobeScene.ts',
  'docs/CHARACTER_WARDROBE_v1.11.20.md',
  'docs/WEAPON_MOTION_PROFILES_v1.11.20.md',
  'docs/PATCH_NOTES_v1.11.20.md',
];
for (const path of requiredFiles) {
  try {
    if ((await stat(path)).size < 20) errors.push(`${path}: too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const contracts = {
  'src/app/brand.ts': ['version:', 'characterWardrobe'],
  'src/app/AppContext.ts': ['characterWardrobe: CharacterWardrobeController'],
  'src/app/GameApp.ts': ['new CharacterWardrobeController()', 'characterWardrobe,'],
  'src/core/assets/AssetCatalog.ts': ['WARDROBE_UI_BUNDLE', "id: 'character-wardrobe-v1'"],
  'src/core/presentation/CharacterWardrobeController.ts': ['saveSelectedSlot', 'loadSelectedSlot', 'cyclePose', 'CharacterShowcasePose'],
  'src/game/combat/WeaponMotionProfile.ts': ['applyWeaponMotionProfile', 'greatblade', 'riftlance', 'tuneComboAction'],
  'src/scenes/CharacterWardrobeScene.ts': ['캐릭터·코스튬 아틀리에', '장비 보관소', '최근 외형 빠른 적용', 'resolveWeaponBodyTextures'],
  'src/scenes/LobbyScene.ts': ['new CharacterWardrobeScene()', "label: '캐릭터'"],
  'src/scenes/BattleScene.ts': ['applyWeaponMotionProfile(', 'equipmentAppearance.weaponVisualFamily'],
};
for (const [path, markers] of Object.entries(contracts)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: marker missing ${marker}`);
}

for (const pose of ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'dodge']) {
  const frames = atlas.animations?.[`player.${pose}.s`];
  if (!Array.isArray(frames) || frames.length < 3) errors.push(`wardrobe preview animation missing: player.${pose}.s`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.20 upgrade: character wardrobe slots, animated pose preview, and weapon-specific motion profiles');
}
