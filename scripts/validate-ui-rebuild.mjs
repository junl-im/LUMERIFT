import { readFile, stat } from 'node:fs/promises';

const requirements = {
  'src/core/assets/AssetCatalog.ts': [
    'assets/live/v22/atlases/ui/ui_reborn_v22.json',
    'assets/live/v5/atlases/ui/ui_icons_v5.json',
    'assets/live/v22/backgrounds/title_reborn_v22.webp',
  ],
  'src/ui/UiSkin.ts': [
    'getUiIconTexture',
    'getTitleBackgroundTexture',
    'ASSET_PATHS.uiIcons',
  ],
  'src/ui/UiButton.ts': [
    'readonly icon?: string',
    'readonly subtitle?: string',
    'buttonTextureName',
  ],
  'src/ui/SceneChrome.ts': [
    'createGlowDivider',
    'BRAND.title',
    "'panel_strong'",
  ],
  'src/scenes/LoginScene.ts': [
    'getTitleBackgroundTexture',
    'createInterfaceBackdrop',
    'ACCOUNT GATE',
    'openProviderMenu()',
    "'계정 연동'",
  ],
  'src/scenes/LobbyScene.ts': [
    'createAttendanceCard()',
    'createEventBanner()',
    'createQuestPanel(',
    'createMenuGrid(',
    'createBottomNavigation(',
  ],
  'src/scenes/BattleScene.ts': [
    "const controlDock = createRasterPanel(8, 786, 524, 166, 'panel_glass')",
    '.roundRect(32, 60, 210 * hpRatio, 14, 7)',
    '.roundRect(124, 147, 362 * hpRatio, 9, 5)',
  ],
  'src/scenes/InventoryScene.ts': [
    'const PAGE_SIZE = 12',
    'const GRID_COLUMNS = 3',
    'createGrid(',
  ],
  'src/scenes/StageSelectScene.ts': [
    'createStageNode(',
    "'stage_node_boss'",
    "'stage_node_locked'",
  ],
  'src/scenes/ResultScene.ts': [
    "getUiTexture('medal')",
    'createRank()',
    'createRewards(context)',
  ],
};

const expectedFiles = [
  'public/assets/live/v5/atlases/ui/ui_luminous_v5.json',
  'public/assets/live/v5/atlases/ui/ui_luminous_v5.webp',
  'public/assets/live/v5/atlases/ui/ui_icons_v5.json',
  'public/assets/live/v5/atlases/ui/ui_icons_v5.webp',
  'public/assets/live/v5/backgrounds/title_screen_v5.webp',
  'art_source/owned/v1.9.0/ui/ui_luminous_v5_master.png',
  'art_source/owned/v1.9.0/ui/ui_icons_v5_master.png',
  'art_source/owned/v1.9.0/ui/title_screen_v5_master.png',
  'docs/previews/v1.9.0_title_concept.webp',
  'docs/previews/v1.9.0_lobby_concept.webp',
  'docs/previews/v1.9.0_battle_concept.webp',
  'docs/previews/v1.9.0_inventory_concept.webp',
  'docs/previews/v1.9.0_account_concept.webp',
  'docs/UI_SYSTEM_v1.9.0.md',
  'docs/VISUAL_AUDIT_v1.9.0.md',
];

const errors = [];
for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${path}: UI marker missing: ${marker}`);
  }
}

const lobbySource = await readFile('src/scenes/LobbyScene.ts', 'utf8');
const hasLegacyBattleAction = lobbySource.includes("label: '전투 시작'");
const hasContextualBattleAction = lobbySource.includes('resolveLobbyNextAction') && lobbySource.includes('createPrimaryAction(context, nextAction)');
if (!hasLegacyBattleAction && !hasContextualBattleAction) {
  errors.push('src/scenes/LobbyScene.ts: primary battle or contextual action contract missing');
}

for (const path of expectedFiles) {
  try {
    const info = await stat(path);
    if (info.size < 128) errors.push(`${path}: visual artifact too small`);
  } catch {
    errors.push(`${path}: visual artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.9 UI system: title, lobby, shared skin, battle controls and all scene chrome contracts');
}
