import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const actions = await readJson('src/data/actions.json');
const assetManifest = await readJson('public/assets/ASSET_MANIFEST.json');
const battle = await readFile('src/scenes/BattleScene.ts', 'utf8');
const momentum = await readFile('src/game/combat/CombatMomentumController.ts', 'utf8');
const renderBudget = await readFile('src/core/performance/CombatRenderBudget.ts', 'utf8');
const player = await readFile('src/game/actors/player/PlayerCombatController.ts', 'utf8');
const vfx = await readFile('src/game/presentation/BattleVfxSystem.ts', 'utf8');
const uiSkin = await readFile('src/ui/UiSkin.ts', 'utf8');
const actionButton = await readFile('src/ui/CombatActionButton.ts', 'utf8');
const errors = [];

const versionParts = pkg.version.split('.').map(Number);
if (versionParts.some((part) => !Number.isInteger(part)) || versionParts[0] < 1 || (versionParts[0] === 1 && versionParts[1] < 11)) errors.push(`package version must preserve v1.11.0+ contracts: ${pkg.version}`);
const assetVersionParts = assetManifest.release.split('.').map(Number);
if (assetVersionParts.some((part) => !Number.isInteger(part)) || assetVersionParts[0] < 1 || (assetVersionParts[0] === 1 && assetVersionParts[1] < 11)) errors.push(`asset manifest must preserve v1.11.0+ contracts: ${assetManifest.release}`);
if (pkg.scripts?.['validate:upgrade:v111'] !== 'node scripts/validate-v1110-upgrade.mjs') {
  errors.push('v1.11.0 upgrade validator script is not connected');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v111')) {
  errors.push('verify does not include v1.11.0 upgrade validator');
}

for (const [index, action] of actions.actions.entries()) {
  for (const key of ['impactTier', 'driveGain', 'driveCost', 'comboWindow']) {
    if (!(key in action)) errors.push(`actions[${index}] missing ${key}`);
  }
}
if (!actions.actions.some((action) => action.impactTier === 'ultimate' && action.driveCost >= 50)) {
  errors.push('ultimate Drive skill contract is missing');
}

const markers = [
  [momentum, 'class CombatMomentumController'],
  [momentum, 'registerPerfectDodge'],
  [momentum, "return 'SS'"],
  [renderBudget, 'class CombatRenderBudget'],
  [renderBudget, 'arcSegments'],
  [battle, 'RIFT EMPOWERED'],
  [battle, 'PERFECT DODGE'],
  [battle, 'this.renderBudget.update'],
  [battle, 'this.momentum.registerHit'],
  [battle, 'this.driveFill.clear()'],
  [player, 'reduceCooldowns'],
  [player, 'canStartSkillAction'],
  [vfx, 'setRuntimeProfile'],
  [uiSkin, 'addPanelDepth'],
  [actionButton, 'setCharge'],
];
for (const [source, marker] of markers) if (!source.includes(marker)) errors.push(`v1.11.0 marker missing: ${marker}`);
if (battle.includes('.polygon(') || uiSkin.includes('.polygon(')) errors.push('PixiJS 8 incompatible Graphics.polygon call reintroduced');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.0 upgrade: Rift Drive, D-SS style chain, perfect dodge, adaptive render budget and layered UI contracts');
}
