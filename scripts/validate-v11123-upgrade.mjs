import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const required = [
  'src/game/presentation/CharacterEquipmentLayerView.ts',
  'src/core/performance/CharacterDisplayCalibrationStore.ts',
  'src/scenes/CharacterCalibrationScene.ts',
  'src/core/presentation/CharacterAppearanceCloudSync.ts',
  'docs/PATCH_NOTES_v1.11.23.md',
  'docs/CHARACTER_APPEARANCE_CLOUD_SAVE_DESIGN_v1.11.23.md',
  'docs/NEXT_UPDATE_v1.11.24.md',
];
for (const path of required) {
  try {
    const info = await stat(path);
    if (info.size < 40) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const sourceTokens = {
  'src/game/presentation/CharacterEquipmentLayerView.ts': [
    'class CharacterEquipmentLayerView',
    'private readonly cape',
    'private readonly armor',
    'private readonly rune',
    "this.pose.state === 'attacking'",
  ],
  'src/game/presentation/BattleActorView.ts': [
    'CharacterEquipmentLayerView',
    'this.equipmentLayers.back',
    'this.equipmentLayers.front',
    'this.equipmentLayers.update',
  ],
  'src/scenes/CharacterWardrobeScene.ts': [
    'CharacterEquipmentLayerView',
    'CharacterCalibrationScene',
    '실기기 보정',
    '슬롯 고정',
  ],
  'src/core/presentation/CharacterWardrobeController.ts': [
    "CharacterPresetSort = 'updated' | 'name' | 'favorite'",
    'presetQuery',
    'lockedSlots',
    'schemaVersion:',
    'visibleCharacterAppearancePresets',
    'record.schemaVersion !== 1 && record.schemaVersion !== 2',
  ],
  'src/scenes/AppearancePresetManagerScene.ts': [
    'characterPresetSortLabel',
    'visibleCharacterAppearancePresets',
    '외형 프리셋 검색',
  ],
  'src/core/performance/CharacterDisplayCalibrationStore.ts': [
    "schema: 'lumerift-character-display-capture-v1'",
    'record.approved !== true',
    'record.screenshotRefs',
    "captureStatus: 'capture-verified'",
  ],
  'src/core/presentation/CharacterAppearanceCloudSync.ts': [
    "syncMode: 'manual-opt-in'",
    'expectedUid',
    'characterAppearanceCloudPathSegments',
  ],
};
for (const [path, tokens] of Object.entries(sourceTokens)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const packageJson = JSON.parse(await read('package.json'));
if (!atLeast(packageJson.version, '1.11.23')) errors.push(`package version ${packageJson.version} < 1.11.23`);
if (packageJson.scripts?.['validate:upgrade:v11123'] !== 'node scripts/validate-v11123-upgrade.mjs') errors.push('v1.11.23 package validator missing');
if (!packageJson.scripts?.verify?.includes('npm run validate:upgrade:v11123')) errors.push('verify chain missing v1.11.23');

const state = JSON.parse(await read('HANDOFF_STATE.json'));
if (!atLeast(state.version, '1.11.23')) errors.push('HANDOFF_STATE version below v1.11.23');
if (state.featureMetrics?.independentEquipmentLayers !== 3) errors.push('independent equipment layer metric mismatch');
if ((state.featureMetrics?.appearancePresetArchiveVersion ?? 0) < 2) errors.push('appearance preset archive version mismatch');
if (state.featureMetrics?.physicalCharacterCaptureVerified !== false) errors.push('physical capture must remain globally unverified');
if (state.version === '1.11.23' && state.featureMetrics?.appearanceCloudSyncConnected !== false) errors.push('v1.11.23 cloud sync must remain disconnected');
if (state.assetMetrics?.v11123NewRuntimeImageFiles !== 0) errors.push('v1.11.23 must not claim new runtime images');

const calibration = await read('src/core/performance/CharacterDisplayCalibration.ts');
if (!calibration.includes("captureStatus: 'pending-physical-capture'")) errors.push('baseline physical capture pending status missing');
const store = await read('src/core/performance/CharacterDisplayCalibrationStore.ts');
if (!store.includes('record.approved !== true')) errors.push('approval evidence guard missing');
if (!store.includes('length < 2')) errors.push('minimum screenshot evidence guard missing');

const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${packageJson.version}'`)) errors.push('brand version mismatch');
const assetManifest = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
if (assetManifest.release !== packageJson.version) errors.push('asset manifest release mismatch');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.23 upgrade: equipment layers, preset index/locks, physical capture approval flow, and cloud envelope design');
}

function atLeast(actual, minimum) {
  const a = actual.split('.').map(Number);
  const b = minimum.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const left = a[i] ?? 0; const right = b[i] ?? 0;
    if (left !== right) return left > right;
  }
  return true;
}
