import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const required = [
  'src/game/presentation/PremiumArtDirection.ts',
  'src/game/presentation/PremiumArtDirection.test.ts',
  'public/assets/live/v12/art-direction/ART_DIRECTION_V12.json',
  'public/assets/live/v12/art-direction/character_quality_upgrade_v12.webp',
  'public/assets/live/v12/art-direction/monster_quality_upgrade_v12.webp',
  'art_source/lumerift_original/v1.11.28/art-direction/ART_DIRECTION_MASTER.json',
  'art_source/lumerift_original/v1.11.28/art-direction/character_quality_upgrade_master_v12.webp',
  'art_source/lumerift_original/v1.11.28/art-direction/monster_quality_upgrade_master_v12.webp',
  'docs/PREMIUM_ART_DIRECTION_v1.11.28.md',
  'docs/PATCH_NOTES_v1.11.28.md',
  'docs/NEXT_UPDATE_v1.11.29.md',
];
for (const path of required) {
  try {
    const info = await stat(path);
    if (info.size < 100) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const artContract = JSON.parse(await read('public/assets/live/v12/art-direction/ART_DIRECTION_V12.json'));
if (artContract.schema !== 'lumerift-premium-art-direction-reference-v1') errors.push('art reference schema mismatch');
if (artContract.runtimeMode !== 'lazy-reference-only' || artContract.initialBundle !== false) errors.push('art references must remain lazy-only');
if (artContract.references?.length !== 2) errors.push('approved art reference count must be 2');
for (const reference of artContract.references ?? []) {
  const path = `public/assets/live/v12/art-direction/${reference.file}`;
  const bytes = await readFile(path);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length !== reference.bytes) errors.push(`${path}: byte mismatch`);
  if (hash !== reference.sha256) errors.push(`${path}: sha256 mismatch`);
  if (reference.width !== 941 || reference.height !== 1672) errors.push(`${path}: dimension contract mismatch`);
  if (bytes.length > 800_000) errors.push(`${path}: lazy reference exceeds 0.8 MB`);
}

const source = await read('src/game/presentation/PremiumArtDirection.ts');
for (const token of [
  "'lumerift-premium-art-direction-v2'",
  "'character' | 'monster' | 'ui' | 'skill-vfx' | 'equipment'",
  'mobileReadability >= 80',
  'PREMIUM_ART_DIRECTION_PROFILES',
]) if (!source.includes(token)) errors.push(`PremiumArtDirection.ts: missing ${token}`);

const catalog = await read('src/core/assets/AssetCatalog.ts');
for (const token of ['premiumCharacterArtReference', 'premiumMonsterArtReference', "id: 'premium-art-direction-v12'", 'PREMIUM_ART_DIRECTION_REFERENCE_BUNDLE']) {
  if (!catalog.includes(token)) errors.push(`AssetCatalog.ts: missing ${token}`);
}
const gallery = await read('src/scenes/AssetGalleryScene.ts');
if (!gallery.includes('LUMERIFT 차기 전체 아트 기준선')) errors.push('AssetGalleryScene approved baseline summary missing');

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
  if (!versionAtLeast(version, '1.11.28')) errors.push(`${label} version ${version} is below 1.11.28`);
}
if (pkg.scripts?.['validate:upgrade:v11128'] !== 'node scripts/validate-v11128-upgrade.mjs') errors.push('v1.11.28 package validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11128')) errors.push('verify chain missing v1.11.28');
if (!assets.bundles?.['premium-art-direction-v12']) errors.push('asset manifest premium art bundle missing');
if (assets.bundles?.['premium-art-direction-v12']?.bytes !== 669_860) errors.push('premium art bundle byte total mismatch');
if (state.featureMetrics?.premiumArtDirectionSchema !== 'lumerift-premium-art-direction-v2') errors.push('premium art schema metric mismatch');
if (state.featureMetrics?.approvedArtReferenceCount !== 2) errors.push('approved art reference metric mismatch');
if (state.featureMetrics?.premiumArtReferenceInitialBundle !== false) errors.push('premium art references must not enter initial bundle');
if (state.assetMetrics?.v11128NewRuntimeImageFiles !== 2) errors.push('v1.11.28 runtime reference image count mismatch');
if (state.assetMetrics?.v11128NewRuntimeImageBytes !== 668606) errors.push('v1.11.28 runtime reference image bytes mismatch');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${pkg.version}'`)) errors.push('brand version mismatch');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.28 upgrade: approved character/monster art baselines, lazy reference gallery, and premium art quality gates');
}
