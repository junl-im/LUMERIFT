import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const json = async (path) => JSON.parse(await read(path));
const required = [
  'src/ui/PremiumHudArt.ts',
  'src/ui/PremiumHudArt.test.ts',
  'src/game/presentation/BossCoreLifecycle.ts',
  'src/game/presentation/BossCoreLifecycle.test.ts',
  'src/core/files/CharacterCaptureEvidenceTransfer.ts',
  'public/assets/live/v15/atlases/ui/premium_hud_v15.json',
  'public/assets/live/v15/atlases/ui/premium_hud_v15.webp',
  'public/assets/live/v15/production/PREMIUM_HUD_V15.json',
  'public/assets/live/v15/production/BOSS_CORE_LIFECYCLE_V15.json',
  'public/assets/live/v15/production/CHARACTER_PART_ATLAS_HANDOFF_V15.json',
  'public/assets/live/v15/production/MONSTER_PART_ATLAS_HANDOFF_V15.json',
  'public/assets/live/v15/production/CAPTURE_EVIDENCE_V15.json',
  'docs/PATCH_NOTES_v1.11.31.md',
  'docs/PREMIUM_HUD_ART_v1.11.31.md',
  'docs/BOSS_CORE_LIFECYCLE_v1.11.31.md',
  'docs/CAPTURE_EVIDENCE_SHA256_v1.11.31.md',
  'docs/NEXT_UPDATE_v1.11.32.md',
];
for (const path of required) {
  try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); }
  catch { errors.push(`${path}: missing`); }
}

const checks = {
  'src/ui/PremiumHudArt.ts': ["'lumerift-premium-hud-art-v1'", 'premium.hud.attack', 'premium.hud.core'],
  'src/ui/CombatActionButton.ts': ['iconTexture?: Texture', 'new Sprite(options.iconTexture)'],
  'src/scenes/BattleScene.ts': ['premiumHudSheet', 'PREMIUM_HUD_TEXTURE_KEYS.core', 'resolveBossCorePresentation'],
  'src/scenes/InventoryScene.ts': ['PREMIUM_HUD_TEXTURE_KEYS.inventory', 'premiumHudTexture'],
  'src/game/presentation/BossCoreLifecycle.ts': ["'lumerift-boss-core-lifecycle-v1'", "'shielded'", "'fractured'", "'shattered'", "'regenerating'", "'overdrive'"],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': ['coreShield', 'coreCracks', 'coreFragments', 'resolveBossCorePresentation'],
  'src/core/performance/CharacterDisplayCalibrationStore.ts': ["'lumerift-character-display-capture-v2'", "algorithm: 'SHA-256'", 'screenshotsMatchFiles'],
  'src/core/files/CharacterCaptureEvidenceTransfer.ts': ["digest('SHA-256'", 'openCharacterCaptureEvidencePackage', 'widthPx'],
  'src/scenes/CharacterCalibrationScene.ts': ['openCharacterCaptureEvidencePackage', 'openCharacterCaptureFiles'],
};
for (const [path, tokens] of Object.entries(checks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const atlas = await json('public/assets/live/v15/atlases/ui/premium_hud_v15.json');
const atlasWebp = await stat('public/assets/live/v15/atlases/ui/premium_hud_v15.webp');
if (Object.keys(atlas.frames ?? {}).length !== 8 || Object.keys(atlas.animations ?? {}).length !== 8) errors.push('premium HUD atlas frame count mismatch');
if (atlas.meta?.size?.w !== 512 || atlas.meta?.size?.h !== 256 || atlas.meta?.version !== '1.11.31') errors.push('premium HUD atlas metadata mismatch');
if (atlasWebp.size !== 63086) errors.push(`premium HUD WebP bytes ${atlasWebp.size} != 63086`);

const hud = await json('public/assets/live/v15/production/PREMIUM_HUD_V15.json');
const core = await json('public/assets/live/v15/production/BOSS_CORE_LIFECYCLE_V15.json');
const capture = await json('public/assets/live/v15/production/CAPTURE_EVIDENCE_V15.json');
const character = await json('public/assets/live/v15/production/CHARACTER_PART_ATLAS_HANDOFF_V15.json');
const monster = await json('public/assets/live/v15/production/MONSTER_PART_ATLAS_HANDOFF_V15.json');
if (hud.schema !== 'lumerift-premium-hud-art-v1' || hud.frames !== 8 || hud.combatBodyReplacement !== false) errors.push('premium HUD contract mismatch');
if (core.schema !== 'lumerift-boss-core-lifecycle-v1' || core.states?.length !== 5 || core.attackFootprintChanged !== false) errors.push('boss core contract mismatch');
if (capture.schema !== 'lumerift-character-display-capture-v2' || capture.hashAlgorithm !== 'SHA-256' || capture.physicalCaptureApprovedByDefault !== false) errors.push('capture evidence contract mismatch');
if (character.finalHandPaintedAtlasComplete !== false || monster.finalHandPaintedAtlasComplete !== false) errors.push('final hand-painted atlas completion must remain false');

const pkg = await json('package.json');
const state = await json('HANDOFF_STATE.json');
const release = await json('RELEASE_MANIFEST.json');
const assets = await json('public/assets/ASSET_MANIFEST.json');
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!/^1\.11\.(?:3[1-9]|[4-9]\d)$/.test(version)) errors.push(`${label} version ${version} is older than 1.11.31`);
}
if (assets.bundles?.['premium-hud-v15']?.bytes !== 67291) errors.push('premium-hud-v15 bundle bytes mismatch');
if (assets.bundles?.['premium-runtime-contract-v15']?.bytes !== 2415) errors.push('v15 contract bundle bytes mismatch');
if (!assets.bundles?.['equipment-ui']?.files?.includes('live/v15/atlases/ui/premium_hud_v15.json')) errors.push('equipment UI bundle missing premium HUD');
if (!assets.bundles?.['battle-chapter-1']?.files?.includes('live/v15/atlases/ui/premium_hud_v15.webp')) errors.push('battle bundle missing premium HUD image');
if (state.featureMetrics?.premiumHudFrames !== 8 || state.featureMetrics?.bossCoreStates !== 5) errors.push('v1.11.31 feature metrics mismatch');
if (state.featureMetrics?.finalHandPaintedV15AtlasesComplete !== false || state.featureMetrics?.physicalDeviceV11131Approved !== false) errors.push('v1.11.31 approval flags mismatch');
if (state.assetMetrics?.v11131NewRuntimeImageFiles !== 1 || state.assetMetrics?.v11131NewRuntimeImageBytes !== 63086) errors.push('v1.11.31 runtime image metrics mismatch');
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11131') || !pkg.scripts?.verify?.includes('validate:production:v11131')) errors.push('verify chain missing v1.11.31');
const brand = await read('src/app/brand.ts');
if (!/version: '1\.11\.(?:3[1-9]|[4-9]\d)'/.test(brand)) errors.push('brand version is older than v1.11.31');

if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.31 upgrade: premium HUD art, boss core lifecycle, and SHA-256 capture evidence v2');
