import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');

function atLeast(version, minimum) {
  const parse = (value) => String(value).split('.').map((part) => Number(part));
  const left = parse(version);
  const right = parse(minimum);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}
const required = [
  'src/core/presentation/CharacterAppearanceConflictResolver.ts',
  'src/game/presentation/CharacterAppearanceSnapshotCard.ts',
  'src/services/cloud/CharacterAppearanceUndoStore.ts',
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts',
  'src/services/cloud/CharacterAppearanceRecoveryStore.ts',
  'src/scenes/CharacterAppearanceConflictPreviewScene.ts',
  'src/scenes/CharacterAppearanceCloudScene.ts',
  'src/scenes/CharacterAppearanceRecoveryScene.ts',
  'docs/PATCH_NOTES_v1.11.26.md',
  'docs/CHARACTER_APPEARANCE_VISUAL_MERGE_PREVIEW_v1.11.26.md',
  'docs/CHARACTER_APPEARANCE_MERGE_UNDO_v1.11.26.md',
  'docs/CHARACTER_APPEARANCE_RECOVERY_V2_v1.11.26.md',
  'docs/NEXT_UPDATE_v1.11.27.md',
];
for (const path of required) {
  try {
    const info = await stat(path);
    if (info.size < 100) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}
const sourceTokens = {
  'src/core/presentation/CharacterAppearanceConflictResolver.ts': ['simulateCharacterAppearanceMerge', 'effectiveSource', 'protectedByLocalLock', 'resultSummary'],
  'src/game/presentation/CharacterAppearanceSnapshotCard.ts': ['CharacterAppearanceSnapshotCard', 'CharacterEquipmentLayerView', 'resolveWeaponBodyTextures'],
  'src/services/cloud/CharacterAppearanceUndoStore.ts': ["'lumerift-character-appearance-merge-undo-v1'", '30 * 60 * 1000', 'consume(uid', 'expiresAt <= now'],
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts': ['createMergeUndo', "'pre-conflict-merge'", 'applyRemoteAndConsolidate'],
  'src/services/cloud/CharacterAppearanceRecoveryStore.ts': [
    "'lumerift-character-appearance-recovery-archive-v2'", 'CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT = 5',
    'CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT = 3', 'rename(uid', 'togglePin(uid', 'search(uid',
  ],
  'src/scenes/CharacterAppearanceConflictPreviewScene.ts': ['LOCAL', 'CLOUD', 'RESULT', '이 결과로 병합 적용'],
  'src/scenes/CharacterAppearanceCloudScene.ts': ['방금 병합 즉시 실행 취소', "'pre-merge-undo'", 'consumeMergeUndo'],
  'src/scenes/CharacterAppearanceRecoveryScene.ts': ['RECENT', 'PIN', '이름 변경', '검색'],
};
for (const [path, tokens] of Object.entries(sourceTokens)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}
const pkg = JSON.parse(await read('package.json'));
const state = JSON.parse(await read('HANDOFF_STATE.json'));
const release = JSON.parse(await read('RELEASE_MANIFEST.json'));
const assets = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!atLeast(version, '1.11.26')) errors.push(`${label} version ${version} < 1.11.26`);
}
if (pkg.scripts?.['validate:upgrade:v11126'] !== 'node scripts/validate-v11126-upgrade.mjs') errors.push('v1.11.26 package validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11126')) errors.push('verify chain missing v1.11.26');
if (state.featureMetrics?.appearanceConflictVisualPreviewCards !== 3) errors.push('visual preview card metric mismatch');
if (state.featureMetrics?.appearanceMergeSimulation !== true) errors.push('merge simulation metric missing');
if (state.featureMetrics?.appearanceMergeUndoMinutes !== 30) errors.push('undo TTL metric mismatch');
if (state.featureMetrics?.appearanceMergeUndoSingleUse !== true) errors.push('single-use undo metric missing');
if (state.featureMetrics?.appearanceRecoveryRecentLimit !== 5) errors.push('recovery recent limit mismatch');
if (state.featureMetrics?.appearanceRecoveryPinLimit !== 3) errors.push('recovery pin limit mismatch');
if (state.featureMetrics?.appearanceRecoveryJsonArchive !== 'lumerift-character-appearance-recovery-archive-v2') errors.push('recovery archive v2 metric mismatch');
if (state.featureMetrics?.physicalCharacterCaptureVerified !== false) errors.push('physical capture must remain globally unverified');
if (state.assetMetrics?.v11126NewRuntimeImageFiles !== 0) errors.push('v1.11.26 must not claim new runtime images');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${pkg.version}'`)) errors.push('brand version mismatch');
if (!brand.includes('characterAppearanceMergeUndo')) errors.push('merge undo storage key missing');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.26 upgrade: visual merge simulation, 30-minute single-use undo, and recovery v2 management');
}
