import { readFile, stat } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const assetManifest = await readJson('public/assets/ASSET_MANIFEST.json');
const ownedAtlas = await readJson('public/assets/live/v6/atlases/player/player_owned_motion_v6.json');
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

if (!atLeast(pkg.version, '1.11.2')) errors.push(`package version must preserve 1.11.2+ contracts: ${pkg.version}`);
if (!atLeast(assetManifest.release, '1.11.2')) errors.push(`asset manifest release must preserve 1.11.2+ contracts: ${assetManifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1112'] !== 'node scripts/validate-v1112-upgrade.mjs') {
  errors.push('v1.11.2 validator script is not connected');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1112')) {
  errors.push('verify does not include v1.11.2 validator');
}

const previewBundle = assetManifest.bundles?.['player-owned-preview'];
if (!previewBundle) errors.push('player-owned-preview manifest bundle missing');
const previewFiles = new Set(previewBundle?.files ?? []);
for (const path of [
  'live/v6/atlases/player/player_owned_motion_v6.json',
  'live/v6/atlases/player/player_owned_motion_v6.webp',
]) {
  if (!previewFiles.has(path)) errors.push(`player-owned-preview bundle missing: ${path}`);
}
for (const baseBundleId of ['core-ui', 'battle-chapter-1']) {
  const baseFiles = new Set(assetManifest.bundles?.[baseBundleId]?.files ?? []);
  for (const path of previewFiles) {
    if (baseFiles.has(path)) errors.push(`${baseBundleId} must not eagerly include owned preview asset: ${path}`);
  }
}

if (ownedAtlas.meta?.version !== '1.11.2') errors.push(`owned atlas version mismatch: ${ownedAtlas.meta?.version}`);
if (ownedAtlas.meta?.runtimeDefaultEnabled !== false) errors.push('owned atlas must remain opt-in, not default');
const directions = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'];
const actions = ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'hit', 'death', 'dodge'];
for (const direction of directions) {
  for (const action of actions) {
    const key = `player.${action}.${direction}`;
    const sequence = ownedAtlas.animations?.[key];
    if (!Array.isArray(sequence) || sequence.length < 4) errors.push(`owned runtime animation missing: ${key}`);
  }
}
if (Object.keys(ownedAtlas.frames ?? {}).length !== 128) errors.push(`owned runtime frame count must be 128: ${Object.keys(ownedAtlas.frames ?? {}).length}`);
if (Object.keys(ownedAtlas.animations ?? {}).length !== 80) errors.push(`owned runtime animation count must be 80: ${Object.keys(ownedAtlas.animations ?? {}).length}`);

const requirements = {
  'src/core/presentation/PlayerArtVariantController.ts': [
    "export type PlayerArtVariant = 'detail' | 'owned-preview' | 'owned-painted'",
    'playerArtVariantLabel',
    'STORAGE_KEYS.playerArtVariant',
  ],
  'src/core/performance/DeviceQaSessionRecorder.ts': [
    "schema: 'lumerift-device-qa-session-v1'",
    'SAMPLE_INTERVAL_SECONDS = 3',
    'surfaceTemperatureC: null',
    'gpuMemoryMb: null',
    'adaptiveLevelChanges',
  ],
  'src/core/performance/DeviceQaReport.ts': [
    "schema: 'lumerift-device-qa-v3'",
    'readonly session?: DeviceQaSessionArchive',
    '표면 온도와 GPU 메모리는 물리 측정이 필요합니다',
  ],
  'src/core/assets/AssetCatalog.ts': [
    'ownedPlayerAtlas',
    'OWNED_PLAYER_PREVIEW_BUNDLE',
    "id: 'player-owned-preview'",
  ],
  'src/app/AppContext.ts': [
    'playerArtVariant: PlayerArtVariantController',
    'deviceQaSession: DeviceQaSessionRecorder',
  ],
  'src/app/GameApp.ts': [
    'new PlayerArtVariantController()',
    'new DeviceQaSessionRecorder()',
    'deviceQaSession.update',
  ],
  'src/scenes/SettingsScene.ts': [
    'playerArtVariantLabel',
    'QA 기록 시작',
    'QA 기록 종료',
    'context.deviceQaSession.snapshot()',
  ],
  'src/scenes/BattleScene.ts': [
    'OWNED_PLAYER_PREVIEW_BUNDLE',
    "playerArtVariant === 'owned-preview'",
    'mirrorWest: false',
    '고급 기본 원화로 복구합니다',
  ],
  'src/game/presentation/BattleActorView.ts': [
    'PlayerActorViewOptions',
    'this.mirrorWest &&',
    'spriteBaseScale',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.2 marker missing: ${marker}`);
  if (source.includes('.polygon(')) errors.push(`${path}: PixiJS 8 incompatible Graphics.polygon call reintroduced`);
}

for (const path of [
  'public/assets/live/v6/atlases/player/player_owned_motion_v6.webp',
  'art_source/lumerift_original/v1.11.2/player/player_owned_runtime_v1_spec.json',
  'docs/previews/v1.11.2_owned_player_runtime_contact.webp',
  'docs/PLAYER_ATLAS_PREVIEW_v1.11.2.md',
  'docs/DEVICE_QA_SESSION_v1.11.2.md',
  'docs/MOBILE_COMBAT_E2E_v1.11.2.md',
  'docs/PATCH_NOTES_v1.11.2.md',
]) {
  try {
    const info = await stat(path);
    if (info.size < (path.endsWith('.json') ? 256 : 512)) errors.push(`${path}: v1.11.2 artifact too small`);
  } catch {
    errors.push(`${path}: v1.11.2 artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.2 upgrade: opt-in owned 8-direction runtime atlas, lazy loading fallback and 3-second physical-device QA session contracts');
}
