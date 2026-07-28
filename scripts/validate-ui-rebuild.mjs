import { readFile, stat } from 'node:fs/promises';

const requirements = {
  'src/ui/UiSkin.ts': [
    "ASSET_PATHS.uiAtlas",
    'getSceneBackgroundTexture',
    "textureName = 'panel'",
  ],
  'src/scenes/LobbyScene.ts': [
    'createHeroPresentation',
    'createMissionCard',
    'createPrimaryAction',
    'createNavigation',
  ],
  'src/scenes/BattleScene.ts': [
    '.roundRect(32, 60, 210 * hpRatio, 14, 7)',
    '.roundRect(124, 147, 362 * hpRatio, 9, 5)',
    'createHud()',
  ],
  'src/scenes/InventoryScene.ts': [
    'const PAGE_SIZE = 12',
    'const GRID_COLUMNS = 3',
    'createGrid(',
    'const selected =',
  ],
  'src/scenes/StageSelectScene.ts': [
    'createStageNode(',
    "'stage_node_boss'",
    "'stage_node_locked'",
    'createRoute(',
  ],
  'src/scenes/ResultScene.ts': [
    "getUiTexture('medal')",
    'createRank()',
    'createRewards(context)',
    'MISSION REWARD',
  ],
};

const expectedFiles = [
  'public/assets/live/v2/atlases/ui/ui_obsidian_v2.json',
  'public/assets/live/v2/atlases/ui/ui_obsidian_v2.webp',
  'public/assets/live/v4/atlases/player/player_live_v4.json',
  'public/assets/live/v4/atlases/player/player_live_v4.webp',
  'public/assets/live/v4/atlases/monsters/monsters_live_v4.json',
  'public/assets/live/v4/atlases/monsters/monsters_live_v4.webp',
  'public/assets/live/v4/backgrounds/lobby_forest_v4.webp',
  'public/assets/live/v4/backgrounds/forest_approach_v4.webp',
  'public/assets/live/v4/portraits/hero_v4.webp',
  'public/assets/live/v4/portraits/boss_phase_1_v4.webp',
  'docs/previews/v1.2.0_lobby_preview.webp',
  'docs/previews/v1.2.0_battle_preview.webp',
  'docs/previews/v1.2.0_inventory_preview.webp',
  'docs/previews/v1.2.0_stage_preview.webp',
  'docs/previews/v1.2.0_result_preview.webp',
];

const errors = [];
for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${path}: UI marker missing: ${marker}`);
  }
}
for (const path of expectedFiles) {
  try {
    const info = await stat(path);
    if (info.size < 256) errors.push(`${path}: visual artifact too small`);
  } catch {
    errors.push(`${path}: visual artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.2 visual reset: lobby, battle, inventory, stage and result contracts');
}
