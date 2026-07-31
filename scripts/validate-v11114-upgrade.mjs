import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const registry = await readJson('asset_registry/ASSET_REGISTRY.json');
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

if (!atLeast(pkg.version, '1.11.14')) errors.push(`package version must preserve 1.11.14+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.14')) errors.push(`asset manifest release must preserve 1.11.14+ contracts: ${manifest.release}`);
if (!atLeast(registry.release, '1.11.14')) errors.push(`asset registry release must preserve 1.11.14+ contracts: ${registry.release}`);
if (pkg.scripts?.['validate:upgrade:v11114'] !== 'node scripts/validate-v11114-upgrade.mjs') errors.push('v1.11.14 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11114')) errors.push('verify does not include v1.11.14 validator');

const requirements = {
  'src/core/input/CombatAssistController.ts': [
    "export type AutoBattleStrategyPreset = 'aggressive' | 'balanced' | 'conservative' | 'custom'",
    "const STORAGE_KEY = 'lumerift.combatAssist.v4'",
    'cycleStrategyPreset()',
    'applyStrategyPreset(',
    'autoBattleStrategyPresetDescription',
    'autoBattleStrategyTuning',
  ],
  'src/game/combat/AutoBattleController.ts': [
    'readonly strategyPreset?: AutoBattleStrategyPreset',
    "autoBattleStrategyTuning(input.strategyPreset ?? 'balanced')",
    "reason: input.strategyPreset === 'conservative' ? 'preset-conservative-save'",
  ],
  'src/game/combat/AutoCombatSessionLog.ts': [
    'readonly strategyPreset: AutoBattleStrategyPreset',
    'setStrategyPreset(',
    'strategyPreset: this.strategyPreset',
  ],
  'src/game/presentation/BossThreatHud.ts': [
    'export function resolveBossThreatHud',
    'AUTO EVADE READY',
    'criticalOnlyHold',
    'safeMoveLabel',
  ],
  'src/core/layout/BattleHudSafeArea.ts': [
    'const fingerClearance = compact ? 8 : 14',
    'fingerClearance * 0.2',
  ],
  'src/scenes/BattleScene.ts': [
    'resolveBossThreatHud({',
    'strategyPreset: settings.strategyPreset',
    'this.bossThreatPanel.visible = true',
    'autoBattleStrategyPresetLabel(settings.strategyPreset)',
  ],
  'src/scenes/SettingsScene.ts': [
    'ASSIST MATRIX 4',
    '전투 프리셋 · ${autoBattleStrategyPresetLabel(settings.strategyPreset)}',
    'context.combatAssist.cycleStrategyPreset()',
  ],
  'src/scenes/ResultScene.ts': [
    'PRESET ${autoBattleStrategyPresetLabel(summary.strategyPreset)}',
  ],
  'README.md': [
    '## v1.11.14 핵심 업데이트',
    'docs/AUTO_BATTLE_STRATEGY_PRESETS_v1.11.14.md',
    'docs/BOSS_THREAT_HUD_v1.11.14.md',
    'docs/FINGER_CLEARANCE_CONTROLS_v1.11.14.md',
    'docs/PATCH_NOTES_v1.11.14.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.14 marker missing: ${marker}`);
}

for (const doc of [
  'docs/AUTO_BATTLE_STRATEGY_PRESETS_v1.11.14.md',
  'docs/BOSS_THREAT_HUD_v1.11.14.md',
  'docs/FINGER_CLEARANCE_CONTROLS_v1.11.14.md',
  'docs/PATCH_NOTES_v1.11.14.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.14 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.14 upgrade: auto strategy presets, boss threat HUD, finger-clearance controls, and result preset reporting');
}
