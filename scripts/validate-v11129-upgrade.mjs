import { readFile, stat } from 'node:fs/promises';

const errors = [];
const read = (path) => readFile(path, 'utf8');
const versionAtLeast = (value, target) => {
  const left = String(value).split('.').map(Number);
  const right = String(target).split('.').map(Number);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    if (a !== b) return a > b;
  }
  return true;
};

const required = [
  'src/game/presentation/PremiumCharacterProductionSpec.ts',
  'src/game/presentation/PremiumCharacterDetailLayerView.ts',
  'src/game/presentation/PremiumMonsterProductionPlan.ts',
  'src/game/presentation/PremiumMonsterDetailLayerView.ts',
  'src/game/presentation/PremiumRuneVfxLanguage.ts',
  'src/ui/PremiumFrameV3.ts',
  'public/assets/live/v13/production/CHARACTER_BODY_V13.json',
  'public/assets/live/v13/production/MONSTER_ELITE_BOSS_V13.json',
  'public/assets/live/v13/production/RUNE_VFX_V13.json',
  'public/assets/live/v13/production/UI_FRAME_V13.json',
  'docs/PREMIUM_CHARACTER_RUNTIME_FIRST_PASS_v1.11.29.md',
  'docs/PREMIUM_MONSTER_PRODUCTION_PLAN_v1.11.29.md',
  'docs/PREMIUM_RUNE_UI_SYSTEM_v1.11.29.md',
  'docs/PATCH_NOTES_v1.11.29.md',
  'docs/NEXT_UPDATE_v1.11.30.md',
];
for (const path of required) {
  try {
    const info = await stat(path);
    if (info.size < 100) errors.push(`${path}: empty or too small`);
  } catch {
    errors.push(`${path}: missing`);
  }
}

const tokenChecks = {
  'src/game/presentation/PremiumCharacterProductionSpec.ts': [
    "'lumerift-premium-character-production-v1'",
    'PREMIUM_CHARACTER_DIRECTIONS',
    'PREMIUM_CHARACTER_LAYER_ORDER',
    'premiumCharacterProductionTotals',
  ],
  'src/game/presentation/PremiumCharacterDetailLayerView.ts': [
    'PremiumCharacterDetailLayerView',
    'weaponVisualFamily',
    'runeCore',
    'capeEdge',
  ],
  'src/game/presentation/PremiumMonsterProductionPlan.ts': [
    "'lumerift-premium-monster-production-v1'",
    "'elite_void_warden'",
    "'boss_abyssal_crown'",
    'premiumMonsterPlanTotals',
  ],
  'src/game/presentation/PremiumMonsterDetailLayerView.ts': [
    'PremiumMonsterDetailLayerView',
    'this.rank !== \'normal\'',
    'coreRadius',
    'phaseStrength',
  ],
  'src/game/presentation/PremiumRuneVfxLanguage.ts': [
    "'lumerift-premium-rune-vfx-v1'",
    'drawPremiumRuneGlyph',
    "tier === 'ultimate'",
  ],
  'src/ui/PremiumFrameV3.ts': [
    "'lumerift-premium-ui-frame-v3'",
    'createPremiumFrameAccents',
    "role === 'boss'",
  ],
  'src/game/presentation/BattleActorView.ts': [
    'PremiumCharacterDetailLayerView',
    'PremiumMonsterDetailLayerView',
    'premiumDetailLayers.update',
  ],
  'src/game/presentation/BattleVfxSystem.ts': [
    'drawPremiumRuneGlyph',
    'premiumRuneProfile',
  ],
  'src/ui/UiSkin.ts': ['createPremiumFrameAccents'],
  'src/ui/UiButton.ts': ['createPremiumFrameAccents'],
};
for (const [path, tokens] of Object.entries(tokenChecks)) {
  const content = await read(path);
  for (const token of tokens) if (!content.includes(token)) errors.push(`${path}: missing ${token}`);
}

const character = JSON.parse(await read('public/assets/live/v13/production/CHARACTER_BODY_V13.json'));
const monsters = JSON.parse(await read('public/assets/live/v13/production/MONSTER_ELITE_BOSS_V13.json'));
const vfx = JSON.parse(await read('public/assets/live/v13/production/RUNE_VFX_V13.json'));
const ui = JSON.parse(await read('public/assets/live/v13/production/UI_FRAME_V13.json'));
const framesPerDirection = Object.values(character.actions ?? {}).reduce((sum, value) => sum + Number(value), 0);
const bodyFrames = framesPerDirection * (character.directions?.length ?? 0) * (character.weaponFamilies?.length ?? 0);
const plannedMonsterFrames = (monsters.entries ?? []).reduce((sum, entry) => sum + Number(entry.plannedFrames ?? 0), 0);
if (bodyFrames !== 1752) errors.push(`character planned frames ${bodyFrames} != 1752`);
if (character.layers?.length !== 6) errors.push('character layer count must be 6');
if (plannedMonsterFrames !== 936) errors.push(`monster planned frames ${plannedMonsterFrames} != 936`);
if ((monsters.entries ?? []).filter((entry) => entry.rank === 'elite').length !== 3) errors.push('elite plan count must be 3');
if ((monsters.entries ?? []).filter((entry) => entry.rank === 'boss').length !== 1) errors.push('boss plan count must be 1');
if (vfx.impactTiers?.light?.spokes !== 6 || vfx.impactTiers?.heavy?.spokes !== 8 || vfx.impactTiers?.ultimate?.spokes !== 12) errors.push('rune VFX impact tier contract mismatch');
if (ui.initialBundleAddedBytes !== 0 || ui.roles?.length !== 4) errors.push('premium UI frame contract mismatch');

const pkg = JSON.parse(await read('package.json'));
const state = JSON.parse(await read('HANDOFF_STATE.json'));
const release = JSON.parse(await read('RELEASE_MANIFEST.json'));
const assets = JSON.parse(await read('public/assets/ASSET_MANIFEST.json'));
for (const [label, version] of Object.entries({ package: pkg.version, state: state.version, release: release.version, assets: assets.release })) {
  if (!versionAtLeast(version, '1.11.29')) errors.push(`${label} version ${version} < 1.11.29`);
}
if (pkg.scripts?.['validate:upgrade:v11129'] !== 'node scripts/validate-v11129-upgrade.mjs') errors.push('v1.11.29 package validator missing');
if (pkg.scripts?.['validate:production:v11129'] !== 'node scripts/verify-v11129-production.mjs') errors.push('v1.11.29 production verifier missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11129')) errors.push('verify chain missing v1.11.29 upgrade');
if (!pkg.scripts?.verify?.includes('npm run validate:production:v11129')) errors.push('verify chain missing v1.11.29 production');
if (!assets.bundles?.['premium-production-contract-v13']) errors.push('premium production contract bundle missing');
if (assets.bundles?.['premium-production-contract-v13']?.bytes !== 2440) errors.push('premium production bundle bytes mismatch');
if (state.featureMetrics?.premiumCharacterProductionSchema !== 'lumerift-premium-character-production-v1') errors.push('character production schema metric mismatch');
if (state.featureMetrics?.premiumMonsterProductionSchema !== 'lumerift-premium-monster-production-v1') errors.push('monster production schema metric mismatch');
if (state.featureMetrics?.premiumRuneVfxSchema !== 'lumerift-premium-rune-vfx-v1') errors.push('rune VFX schema metric mismatch');
if (state.featureMetrics?.premiumUiFrameSchema !== 'lumerift-premium-ui-frame-v3') errors.push('premium UI frame schema metric mismatch');
if (state.featureMetrics?.premiumCharacterPlannedFrames !== 1752) errors.push('character planned frame metric mismatch');
if (state.featureMetrics?.premiumMonsterPlannedFrames !== 936) errors.push('monster planned frame metric mismatch');
if (state.featureMetrics?.finalHandPaintedV13AtlasesComplete !== false) errors.push('final hand-painted v13 Atlas must remain incomplete');
if (state.assetMetrics?.v11129NewRuntimeImageFiles !== 0) errors.push('v1.11.29 must not claim new runtime images');
if (state.assetMetrics?.v11129InitialBundleAddedBytes !== 0) errors.push('v1.11.29 initial asset bundle added bytes must be 0');
const brand = await read('src/app/brand.ts');
if (!/version: '1\.11\.(?:29|[3-9]\d)'/.test(brand)) errors.push('brand version below v1.11.29');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.29 upgrade: character-centered runtime detail layers, elite/boss cores, tiered rune VFX, and premium UI frame v3');
}
