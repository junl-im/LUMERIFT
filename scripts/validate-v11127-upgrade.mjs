import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const required = [
  'src/core/presentation/CharacterAppearanceArchiveDiff.ts',
  'src/services/cloud/CharacterAppearanceAuditStore.ts',
  'src/services/cloud/CharacterAppearanceCloudService.ts',
  'src/scenes/CharacterAppearanceRecoveryCompareScene.ts',
  'src/scenes/CharacterAppearanceRecoveryScene.ts',
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts',
  'docs/PATCH_NOTES_v1.11.27.md',
  'docs/CHARACTER_APPEARANCE_RECOVERY_DIFF_AUDIT_v1.11.27.md',
  'docs/NEXT_UPDATE_v1.11.28.md',
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
  'src/core/presentation/CharacterAppearanceArchiveDiff.ts': [
    "'lumerift-character-appearance-diff-v1'", 'compareCharacterAppearanceArchives', 'presetDifferences', 'totalDifferences',
  ],
  'src/services/cloud/CharacterAppearanceAuditStore.ts': [
    "'lumerift-character-appearance-audit-archive-v1'", 'CHARACTER_APPEARANCE_AUDIT_LIMIT = 100', 'recovery-diff-exported', 'ownerUid',
  ],
  'src/services/cloud/CharacterAppearanceCloudService.ts': [
    'auditRecords(uid', 'recordAudit(uid', 'exportAuditArchive(uid', "'cloud-upload-queued'", "'cloud-uploaded'",
  ],
  'src/scenes/CharacterAppearanceRecoveryCompareScene.ts': [
    'POINT A', 'POINT B', '차이·감사 기록 내보내기', 'CharacterAppearanceSnapshotCard',
  ],
  'src/scenes/CharacterAppearanceRecoveryScene.ts': [
    '선택 지점 차이 비교', '외형 감사 기록 내보내기', "'recovery-restored'",
  ],
  'src/services/cloud/CharacterAppearanceMergeCoordinator.ts': [
    "'conflict-merge-applied'", 'recoveryPointIds', 'mergedRevision',
  ],
};
for (const [path, tokens] of Object.entries(sourceTokens)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}
const pkg = JSON.parse(await read('package.json'));
const state = JSON.parse(await read('HANDOFF_STATE.json'));
const release = JSON.parse(await read('RELEASE_MANIFEST.json'));
const assets = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
const versionAtLeast = (value, minimum) => {
  const current = String(value).split('.').map(Number);
  const floor = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(current.length, floor.length); index += 1) {
    const left = current[index] ?? 0;
    const right = floor[index] ?? 0;
    if (left !== right) return left > right;
  }
  return true;
};
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!versionAtLeast(version, '1.11.27')) errors.push(`${label} version ${version} is below 1.11.27`);
}
if (pkg.scripts?.['validate:upgrade:v11127'] !== 'node scripts/validate-v11127-upgrade.mjs') errors.push('v1.11.27 package validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11127')) errors.push('verify chain missing v1.11.27');
if (state.featureMetrics?.appearanceRecoveryDiffSchema !== 'lumerift-character-appearance-diff-v1') errors.push('recovery diff schema metric mismatch');
if (state.featureMetrics?.appearanceAuditSchema !== 'lumerift-character-appearance-audit-archive-v1') errors.push('appearance audit schema metric mismatch');
if (state.featureMetrics?.appearanceAuditLimit !== 100) errors.push('appearance audit limit mismatch');
if (state.featureMetrics?.appearanceRecoveryComparisonCards !== 2) errors.push('recovery comparison card metric mismatch');
if (state.featureMetrics?.appearanceAuditUidGuard !== true) errors.push('appearance audit UID guard missing');
if (state.featureMetrics?.physicalCharacterCaptureVerified !== false) errors.push('physical capture must remain globally unverified');
if (state.assetMetrics?.v11127NewRuntimeImageFiles !== 0) errors.push('v1.11.27 must not claim new runtime images');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${pkg.version}'`)) errors.push('brand version mismatch');
if (!brand.includes('characterAppearanceAudit')) errors.push('appearance audit storage key missing');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.27 upgrade: recovery point visual diff, UID-scoped audit history, and selected audit export');
}
