import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const atLeast = (actual, expected) => {
  const a = String(actual).split('.').map(Number);
  const e = String(expected).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) > (e[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (e[i] ?? 0)) return false;
  }
  return true;
};
const required = [
  'src/core/presentation/CharacterAppearanceConflictResolver.ts',
  'src/services/cloud/CharacterAppearanceRecoveryStore.ts',
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts',
  'src/scenes/CharacterAppearanceConflictScene.ts',
  'src/scenes/CharacterAppearanceRecoveryScene.ts',
  'docs/PATCH_NOTES_v1.11.25.md',
  'docs/CHARACTER_APPEARANCE_CONFLICT_RESOLUTION_v1.11.25.md',
  'docs/CHARACTER_APPEARANCE_RECOVERY_v1.11.25.md',
];
for (const path of required) {
  try {
    const info = await stat(path);
    if (info.size < 80) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}
const sourceTokens = {
  'src/core/presentation/CharacterAppearanceConflictResolver.ts': [
    'previewCharacterAppearanceConflict', 'mergeCharacterAppearanceArchives', "'newer'", "lockedSlots: 'union'", "presets: 'merge'", 'if (local.lockedSlots[slot])',
  ],
  'src/services/cloud/CharacterAppearanceRecoveryStore.ts': [
    'CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT = 5', "'pre-conflict-merge'", "'pre-recovery-restore'", 'record.ownerUid !== uid',
  ],
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts': ["'pre-conflict-merge'"],
  'src/services/cloud/CharacterAppearanceCloudService.ts': ['recoveryPoints(uid', 'createRecoveryPoint(', "'pre-cloud-upload'"],
  'src/core/presentation/CharacterWardrobeController.ts': ['replacePresetArchive', 'recentPresets: [...archive.presets]'],
  'src/scenes/CharacterAppearanceConflictScene.ts': ['선택 내용 병합·Cloud 저장', 'CharacterAppearanceCloudScene'],
  'src/scenes/CharacterAppearanceRecoveryScene.ts': ['현재 상태 수동 백업', '선택 지점 복구', "'pre-recovery-restore'"],
};
for (const [path, tokens] of Object.entries(sourceTokens)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}
const packageJson = JSON.parse(await read('package.json'));
if (!atLeast(packageJson.version, '1.11.25')) errors.push(`package version ${packageJson.version} < 1.11.25`);
if (packageJson.scripts?.['validate:upgrade:v11125'] !== 'node scripts/validate-v11125-upgrade.mjs') errors.push('v1.11.25 package validator missing');
if (!packageJson.scripts?.verify?.includes('npm run validate:upgrade:v11125')) errors.push('verify chain missing v1.11.25');
const state = JSON.parse(await read('HANDOFF_STATE.json'));
if (!atLeast(state.version, '1.11.25')) errors.push('HANDOFF_STATE version below v1.11.25');
if (state.featureMetrics?.appearanceConflictSelectableCategories !== 6) errors.push('selectable conflict category metric mismatch');
if ((state.featureMetrics?.appearanceRecoveryMaxPoints ?? 0) < 5) errors.push('appearance recovery point metric mismatch');
if (state.featureMetrics?.appearanceRecoveryUidGuard !== true) errors.push('appearance recovery UID guard missing');
if (state.featureMetrics?.appearanceConflictPreMergeRecovery !== true) errors.push('pre-merge recovery guard missing');
if (state.featureMetrics?.physicalCharacterCaptureVerified !== false) errors.push('physical capture must remain globally unverified');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${packageJson.version}'`)) errors.push('brand version mismatch');
if (!brand.includes('characterAppearanceRecovery')) errors.push('appearance recovery storage key missing');
const assetManifest = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
if (assetManifest.release !== packageJson.version) errors.push('asset manifest release mismatch');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.25 contract retained: granular appearance conflict merge, protected slots, and UID-isolated recovery points');
}
