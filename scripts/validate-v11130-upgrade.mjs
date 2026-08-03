import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const required = [
  'src/game/presentation/PremiumCharacterRuntimeV14.ts',
  'src/game/presentation/PremiumCharacterDetailLayerView.ts',
  'src/game/presentation/PremiumMonsterVariantProfile.ts',
  'src/game/presentation/PremiumMonsterDetailLayerView.ts',
  'src/game/presentation/PremiumRuneVfxLanguage.ts',
  'src/ui/PremiumFrameV3.ts',
  'public/assets/live/v14/production/CHARACTER_RUNTIME_V14.json',
  'public/assets/live/v14/production/MONSTER_RUNTIME_V14.json',
  'public/assets/live/v14/production/RUNE_VFX_V14.json',
  'public/assets/live/v14/production/UI_FRAME_V14.json',
  'docs/PREMIUM_CHARACTER_RUNTIME_SECOND_PASS_v1.11.30.md',
  'docs/PREMIUM_MONSTER_VARIANTS_v1.11.30.md',
  'docs/PREMIUM_VFX_UI_FRAME_v1.11.30.md',
  'docs/PATCH_NOTES_v1.11.30.md',
  'docs/NEXT_UPDATE_v1.11.31.md',
];
for (const path of required) {
  try { if ((await stat(path)).size < 100) errors.push(`${path}: too small`); }
  catch { errors.push(`${path}: missing`); }
}

const checks = {
  'src/game/presentation/PremiumCharacterRuntimeV14.ts': ["'lumerift-premium-character-runtime-v2'", 'premiumWeaponSilhouetteProfile', '정밀 연격', '중량 절단', '직선 관통'],
  'src/game/presentation/PremiumCharacterDetailLayerView.ts': ['hairBack', 'hairFront', 'capeFabric', 'armorPlate', 'faceRim', 'weaponImpact'],
  'src/game/presentation/PremiumMonsterVariantProfile.ts': ["'lumerift-premium-monster-runtime-v2'", "'void-warden'", "'lumen-mender'", "'abyssal-harbinger'"],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': ['phaseShards', 'tailArc', 'this.profile', 'phaseStrength'],
  'src/game/presentation/PremiumRuneVfxLanguage.ts': ['premiumRuneSparkField', 'drawPremiumRuneSparkField', 'count: 12'],
  'src/ui/PremiumFrameV3.ts': ["'lumerift-premium-ui-frame-v3.1'", 'sideY', 'railWidth', "role === 'boss'"],
  'src/scenes/CharacterWardrobeScene.ts': ['PremiumCharacterDetailLayerView', 'premium?.update', 'directionFacingY'],
  'src/game/presentation/BattleActorView.ts': ['premiumDetailLayers.update', 'comboStep: controller.comboStep', 'PremiumMonsterDetailLayerView'],
  'src/game/presentation/BattleVfxSystem.ts': ['drawPremiumRuneSparkField', 'this.quality.effectDensity > 0.62'],
};
for (const [path, tokens] of Object.entries(checks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const json = async (path) => JSON.parse(await read(path));
const character = await json('public/assets/live/v14/production/CHARACTER_RUNTIME_V14.json');
const monsters = await json('public/assets/live/v14/production/MONSTER_RUNTIME_V14.json');
const vfx = await json('public/assets/live/v14/production/RUNE_VFX_V14.json');
const ui = await json('public/assets/live/v14/production/UI_FRAME_V14.json');
if (character.schema !== 'lumerift-premium-character-runtime-v2') errors.push('character schema mismatch');
if (Object.keys(character.weaponFamilies ?? {}).length !== 3 || character.runtimeLayers?.length !== 10) errors.push('character runtime contract mismatch');
if (monsters.schema !== 'lumerift-premium-monster-runtime-v2' || monsters.variants?.length !== 4 || !monsters.phaseResponsive) errors.push('monster runtime contract mismatch');
if (vfx.impactTiers?.light?.sparks !== 5 || vfx.impactTiers?.heavy?.sparks !== 8 || vfx.impactTiers?.ultimate?.sparks !== 12) errors.push('rune spark contract mismatch');
if (ui.schema !== 'lumerift-premium-ui-frame-v3.1' || ui.roles?.length !== 4 || ui.initialBundleAddedBytes !== 0) errors.push('UI frame v3.1 mismatch');

const pkg = await json('package.json');
const state = await json('HANDOFF_STATE.json');
const release = await json('RELEASE_MANIFEST.json');
const assets = await json('public/assets/ASSET_MANIFEST.json');
const versionAtLeast = (value, minimum) => { const a = value.split('.').map(Number); const b = minimum.split('.').map(Number); return a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] >= b[2]))); };
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!versionAtLeast(version, '1.11.30')) errors.push(`${label} version ${version} < 1.11.30`);
}
if (!assets.bundles?.['premium-runtime-contract-v14']) errors.push('v14 contract bundle missing');
if (assets.bundles?.['premium-runtime-contract-v14']?.bytes !== 3476) errors.push('v14 contract bytes mismatch');
if (state.featureMetrics?.premiumCharacterRuntimeSchema !== 'lumerift-premium-character-runtime-v2') errors.push('character metric mismatch');
if (state.featureMetrics?.premiumMonsterRuntimeSchema !== 'lumerift-premium-monster-runtime-v2') errors.push('monster metric mismatch');
if (state.featureMetrics?.premiumUiFrameRuntimeSchema !== 'lumerift-premium-ui-frame-v3.1') errors.push('UI metric mismatch');
if (state.featureMetrics?.finalHandPaintedV14AtlasesComplete !== false) errors.push('final hand-painted v14 Atlas must remain incomplete');
if (state.assetMetrics?.v11130NewRuntimeImageFiles !== 0 || state.assetMetrics?.v11130InitialBundleAddedBytes !== 0) errors.push('v1.11.30 image/bundle claim mismatch');
if (!pkg.scripts?.verify?.includes('validate:upgrade:v11130') || !pkg.scripts?.verify?.includes('validate:production:v11130')) errors.push('verify chain missing v1.11.30');
const brand = await read('src/app/brand.ts');
if (!brand.includes(`version: '${pkg.version}'`)) errors.push('brand version mismatch');

if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.30 upgrade: character layers, weapon silhouettes, elite/boss variants, rune sparks, and UI Frame v3.1');
