import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const errors = [];
const atLeast = (version, minimum) => {
  const left = version.split('.').map(Number);
  const right = minimum.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((left[index] ?? 0) > (right[index] ?? 0)) return true;
    if ((left[index] ?? 0) < (right[index] ?? 0)) return false;
  }
  return true;
};

if (!atLeast(pkg.version, '1.11.8')) errors.push(`package version must preserve 1.11.8+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.8')) errors.push(`asset manifest release must preserve 1.11.8+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1118'] !== 'node scripts/validate-v1118-upgrade.mjs') errors.push('v1.11.8 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1118')) errors.push('verify does not include v1.11.8 validator');

const requirements = {
  'src/core/input/CombatAssistController.ts': [
    "export type AutoTargetPriority = 'balanced' | 'nearest' | 'boss' | 'weak' | 'threat'",
    "export type BossAutoMode = 'full' | 'target-only' | 'off'",
    "export type CombatDevicePreset = 'responsive' | 'balanced' | 'stable'",
    'cycleTargetPriority()',
    'toggleAutoSkills()',
    'toggleAutoDodge()',
    'cycleBossAutoMode()',
    'cycleDevicePreset()',
  ],
  'src/game/combat/AutoTargetController.ts': [
    'export interface AutoTargetPolicy',
    'DEVICE_POLICY',
    "priority === 'nearest'",
    "priority === 'boss'",
    "priority === 'weak'",
    "priority === 'threat'",
  ],
  'src/game/combat/AutoBattleController.ts': [
    'readonly useSkills: boolean',
    'readonly useDodge: boolean',
    'readonly bossAutoMode: BossAutoMode',
    'readonly devicePreset: CombatDevicePreset',
    'DEVICE_TUNING',
    'cooldownSeconds',
  ],
  'src/scenes/BattleScene.ts': [
    'priority: assist.targetPriority',
    'combatDevicePresetLabel',
    'useSkills: settings.autoSkills',
    'useDodge: settings.autoDodge',
    'bossAutoMode: settings.bossAutoMode',
    'devicePreset: settings.devicePreset',
    'createCombatOverlayChrome()',
  ],
  'src/scenes/SettingsScene.ts': [
    '자동 전투 커맨드',
    '타겟 우선',
    '자동 스킬',
    '자동 회피',
    '실기기 보정',
    'ASSIST MATRIX',
  ],
  'src/ui/InterfaceChrome.ts': [
    'export function createCombatOverlayChrome()',
    'RIFT INTERFACE',
    'chapterCuts',
    'halftone',
  ],
  'src/ui/SceneChrome.ts': [
    'RIFT PANEL',
    'CHAPTER CORE',
  ],
  'src/ui/UiSkin.ts': [
    'railWidth',
  ],
  'src/ui/UiButton.ts': [
    'commandRail',
    'commandDot',
  ],
  'README.md': [
    'docs/MEGA_INTERFACE_RENEWAL_v1.11.8.md',
    'docs/COMBAT_ASSIST_TUNING_v1.11.8.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.8 marker missing: ${marker}`);
}

for (const doc of [
  'docs/MEGA_INTERFACE_RENEWAL_v1.11.8.md',
  'docs/COMBAT_ASSIST_TUNING_v1.11.8.md',
  'docs/PATCH_NOTES_v1.11.8.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.8 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.8 upgrade: mega interface renewal, detailed combat assist settings, and device-specific automation tuning');
}
