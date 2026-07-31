import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const registry = await readJson('asset_registry/ASSET_REGISTRY.json');
const bossRules = await readJson('src/data/boss-dodge-rules.json');
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

if (!atLeast(pkg.version, '1.11.15')) errors.push(`package version must preserve 1.11.15+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.15')) errors.push(`asset manifest release must preserve 1.11.15+ contracts: ${manifest.release}`);
if (!atLeast(registry.release, '1.11.15')) errors.push(`asset registry release must preserve 1.11.15+ contracts: ${registry.release}`);
if (pkg.scripts?.['validate:upgrade:v11115'] !== 'node scripts/validate-v11115-upgrade.mjs') errors.push('v1.11.15 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11115')) errors.push('verify does not include v1.11.15 validator');

if (typeof bossRules.version !== 'number' || bossRules.version < 1) errors.push(`boss dodge data version must preserve v1+ contracts: ${bossRules.version}`);
if (!Array.isArray(bossRules.patterns) || bossRules.patterns.length < 3) errors.push('boss dodge JSON must preserve at least 3 pattern rules');
for (const id of ['boss_cleave', 'boss_nova', 'boss_rupture']) {
  if (!bossRules.patterns?.some((rule) => rule.patternId === id)) errors.push(`boss dodge JSON pattern missing: ${id}`);
}

const requirements = {
  'src/game/combat/BossDodgeRules.ts': [
    "import bossDodgeRuleData from '../../data/boss-dodge-rules.json'",
    'export const BOSS_DODGE_RULE_VERSION',
    'export function bossDodgeRuleCatalog()',
    'normalizeRuleDocument',
  ],
  'src/core/input/AutoBattlePresetSlots.ts': [
    "const STORAGE_KEY = 'lumerift.autoBattlePresetSlots.v1'",
    'export type AutoBattlePresetSlotId = 1 | 2 | 3',
    'public save(',
    'public load()',
    'public clear()',
  ],
  'src/core/input/CombatAssistController.ts': [
    'public get presetSlots(): AutoBattlePresetSlotState',
    'saveSelectedCustomPreset()',
    'loadSelectedCustomPreset()',
    'clearSelectedCustomPreset()',
  ],
  'src/scenes/AutoPresetLabScene.ts': [
    'export class AutoPresetLabScene',
    'STRATEGY MATRIX',
    'USER PRESET VAULT',
    'saveSelectedCustomPreset()',
    'loadSelectedCustomPreset()',
  ],
  'src/scenes/SettingsScene.ts': [
    'autoBattlePresetSlotLabel(context.combatAssist.presetSlots)',
    'new AutoPresetLabScene()',
  ],
  'src/game/presentation/AutoPresetPerformance.ts': [
    'export function resolveAutoPresetPerformance',
    'export function autoPresetPerformanceCompactLabel',
    "recommendedPreset: 'balanced'",
  ],
  'src/scenes/ResultScene.ts': [
    'resolveAutoPresetPerformance({',
    'autoPresetPerformanceCompactLabel(performance)',
    '프리셋 적합도',
  ],
  'scripts/validate-game-data.mjs': [
    "src/data/boss-dodge-rules.json",
    '보스 회피 규칙 누락',
    'boss dodge rules',
  ],
  'README.md': [
    '## v1.11.15 핵심 업데이트',
    'docs/BOSS_DODGE_DATA_v1.11.15.md',
    'docs/AUTO_PRESET_VAULT_v1.11.15.md',
    'docs/AUTO_PRESET_PERFORMANCE_v1.11.15.md',
    'docs/PATCH_NOTES_v1.11.15.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.15 marker missing: ${marker}`);
}

for (const doc of [
  'docs/BOSS_DODGE_DATA_v1.11.15.md',
  'docs/AUTO_PRESET_VAULT_v1.11.15.md',
  'docs/AUTO_PRESET_PERFORMANCE_v1.11.15.md',
  'docs/PATCH_NOTES_v1.11.15.md',
  'docs/NEXT_UPDATE_v1.11.16.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.15 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.15 upgrade: JSON boss dodge catalog, three-slot preset vault, preset lab, and session performance advisor');
}
