import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const required = [
  'src/repositories/CharacterAppearanceCloudRepository.ts',
  'src/services/cloud/CharacterAppearanceCloudService.ts',
  'src/scenes/CharacterAppearanceCloudScene.ts',
  'docs/PATCH_NOTES_v1.11.24.md',
  'docs/CHARACTER_APPEARANCE_CLOUD_SAVE_v1.11.24.md',
  'docs/CHARACTER_EQUIPMENT_MASKS_v1.11.24.md',
  'docs/WEAPON_BODY_CORRECTION_v1.11.24.md',
  'docs/NEXT_UPDATE_v1.11.25.md',
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
  'src/core/presentation/CharacterAppearanceCloudSync.ts': [
    "schema: 'lumerift-character-appearance-cloud-v2'",
    'characterAppearanceArchiveRevision',
    'compareCharacterAppearanceRevisions',
    "'diverged'",
    "'first-sync-conflict'",
  ],
  'src/repositories/CharacterAppearanceCloudRepository.ts': [
    'FirestoreCharacterAppearanceCloudRepository',
    'getDoc',
    'setDoc',
    'serverTimestamp',
  ],
  'src/services/cloud/CharacterAppearanceCloudService.ts': [
    "'opt-in-required'",
    "'conflict'",
    "'queued'",
    'pendingEnvelope',
    'applyRemoteAndConsolidate',
  ],
  'src/core/presentation/CharacterWardrobeController.ts': [
    'schemaVersion: 3',
    'slotOrder',
    'moveSelectedSlot',
    'record.schemaVersion !== 1 && record.schemaVersion !== 2 && record.schemaVersion !== 3',
  ],
  'src/game/presentation/CharacterEquipmentVisualProfile.ts': [
    'CharacterArmorLayerMask',
    'CharacterCapeLayerMask',
    'CharacterRuneLayerMask',
    'resolveEquipmentLayerMaskProfile',
  ],
  'src/game/presentation/WeaponBodyAttackFrames.ts': [
    'resolveWeaponBodyFrameCorrection',
    "'blade-hand-tune'",
    "'greatblade-weight-tune'",
    "'riftlance-thrust-tune'",
  ],
  'firestore.rules': [
    "settingId == 'characterAppearance'",
    "'lumerift-character-appearance-cloud-v2'",
    'request.resource.data.archive.schemaVersion == 3',
    'request.resource.data.serverUpdatedAt == request.time',
  ],
};
for (const [path, tokens] of Object.entries(sourceTokens)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const packageJson = JSON.parse(await read('package.json'));
if (!atLeast(packageJson.version, '1.11.24')) errors.push(`package version ${packageJson.version} < 1.11.24`);
if (packageJson.scripts?.['validate:upgrade:v11124'] !== 'node scripts/validate-v11124-upgrade.mjs') errors.push('v1.11.24 package validator missing');
if (!packageJson.scripts?.verify?.includes('npm run validate:upgrade:v11124')) errors.push('verify chain missing v1.11.24');

const state = JSON.parse(await read('HANDOFF_STATE.json'));
if (!atLeast(state.version, '1.11.24')) errors.push('HANDOFF_STATE version below v1.11.24');
if (state.featureMetrics?.appearancePresetArchiveVersion !== 3) errors.push('appearance archive v3 metric mismatch');
if (state.featureMetrics?.appearanceCloudEnvelopeSchema !== 'lumerift-character-appearance-cloud-v2') errors.push('appearance cloud envelope mismatch');
if (state.featureMetrics?.appearanceCloudSyncConnected !== true) errors.push('appearance cloud sync must be connected');
if (state.featureMetrics?.appearanceCloudConflictResolution !== true) errors.push('appearance cloud conflict guard missing');
if (state.featureMetrics?.appearanceCloudRetryQueue !== true) errors.push('appearance cloud retry queue missing');
if (state.featureMetrics?.physicalCharacterCaptureVerified !== false) errors.push('physical capture must remain globally unverified');
if (state.assetMetrics?.v11124NewRuntimeImageFiles !== 0) errors.push('v1.11.24 must not claim new runtime images');

const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${packageJson.version}'`)) errors.push('brand version mismatch');
const assetManifest = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
if (assetManifest.release !== packageJson.version) errors.push('asset manifest release mismatch');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.24 upgrade: opt-in Firestore appearance sync, conflict recovery, Archive v3 slot order, item masks, and weapon frame alignment');
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
