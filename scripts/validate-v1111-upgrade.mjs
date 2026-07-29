import { readFile, stat } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const assetManifest = await readJson('public/assets/ASSET_MANIFEST.json');
const playerAtlas = await readJson('public/assets/live/v4/atlases/player/player_live_v4.json');
const errors = [];

const isAtLeast = (value, target) => {
  const current = String(value).split('.').map(Number);
  const minimum = target.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const left = current[index] ?? 0;
    const right = minimum[index] ?? 0;
    if (left !== right) return left > right;
  }
  return true;
};
if (!isAtLeast(pkg.version, '1.11.1')) errors.push(`package version must preserve v1.11.1+ contracts: ${pkg.version}`);
if (!isAtLeast(assetManifest.release, '1.11.1')) errors.push(`asset manifest release must preserve v1.11.1+ contracts: ${assetManifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1111'] !== 'node scripts/validate-v1111-upgrade.mjs') {
  errors.push('v1.11.1 upgrade validator script is not connected');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1111')) {
  errors.push('verify does not include v1.11.1 upgrade validator');
}

const requirements = {
  'src/core/performance/DeviceCalibration.ts': [
    "export type DeviceCalibrationTier = 'entry' | 'balanced' | 'performance'",
    'resolveDeviceCalibration',
    'combatRenderBias',
    'degradeToSafeWindows',
  ],
  'src/core/performance/AdaptivePerformanceController.ts': [
    'DeviceCalibrationProfile',
    'resolveDeviceCalibration',
    'calibration:',
    'thresholds.degradeToSafeWindows',
  ],
  'src/core/performance/CombatRenderBudget.ts': [
    'calibrationBias = 1',
    'const safeBias',
  ],
  'src/game/presentation/PlayerMotionDirector.ts': [
    'resolvePlayerMotion',
    "input.state === 'dodging'",
    'afterimageInterval',
    'driveGlow',
  ],
  'src/game/presentation/BossTelegraphLanguage.ts': [
    'resolveBossTelegraphStyle',
    "TelegraphUrgency = 'warning' | 'danger' | 'critical'",
    'whiteFlashAlpha',
    'tickCount',
  ],
  'src/core/input/TouchActionGate.ts': [
    'class TouchActionGate',
    'activePointerId',
    'minimumIntervalMs',
  ],
  'src/ui/CombatActionButton.ts': [
    'TouchActionGate',
    "this.on('pointercancel'",
    'this.actionGate.release',
  ],
  'src/game/presentation/BattleActorView.ts': [
    'PlayerPresentationFrame',
    'resolvePlayerMotion',
    'this.afterimages',
    'resolveBossTelegraphStyle',
    'this.telegraphText',
  ],
  'src/game/presentation/BattleVfxSystem.ts': [
    'BattleVfxSpawnOptions',
    'redrawAccent',
    'impactTier',
  ],
  'src/scenes/BattleScene.ts': [
    'adaptive.calibration.thresholds.combatRenderBias',
    'this.dangerText',
    'impactTier:',
  ],
  'src/core/performance/DeviceQaReport.ts': [
    'calibrationTier',
    'combatRenderBias',
  ],
  'src/scenes/SettingsScene.ts': [
    'CALIBRATION',
    'adaptive.calibration',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.1 marker missing: ${marker}`);
  if (source.includes('.polygon(')) errors.push(`${path}: PixiJS 8 incompatible Graphics.polygon call reintroduced`);
}

const atlasFrames = Object.keys(playerAtlas.frames ?? {});
const animationKeys = Object.keys(playerAtlas.animations ?? {});
const directions = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
const actions = ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'hit', 'death', 'dodge'];
for (const direction of directions) {
  for (const action of actions) {
    const key = `player.${action}.${direction}`;
    if (!animationKeys.includes(key)) errors.push(`player runtime atlas animation missing: ${key}`);
  }
}
if (atlasFrames.length < 68) errors.push(`player runtime atlas frame count too small: ${atlasFrames.length}`);

for (const path of [
  'art_source/lumerift_original/v1.11.1/player/player_motion_8dir_blockout_master.png',
  'art_source/lumerift_original/v1.11.1/player/player_motion_8dir_blockout_spec.json',
  'docs/previews/v1.11.1_combat_motion_contact.webp',
  'docs/COMBAT_MOTION_QA_v1.11.1.md',
  'docs/PATCH_NOTES_v1.11.1.md',
]) {
  try {
    const info = await stat(path);
    if (info.size < (path.endsWith('.json') ? 256 : 512)) errors.push(`${path}: artifact too small`);
  } catch {
    errors.push(`${path}: v1.11.1 artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS v1.11.1 upgrade: 3 calibration tiers, ${directions.length}-direction runtime motion, boss telegraph language, layered VFX and single-pointer combat input`);
}
