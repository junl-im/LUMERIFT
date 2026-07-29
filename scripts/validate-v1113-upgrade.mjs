import { readFile, stat } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const assetManifest = await readJson('public/assets/ASSET_MANIFEST.json');
const atlas = await readJson('public/assets/live/v7/atlases/player/player_owned_painted_v7.json');
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

if (!atLeast(pkg.version, '1.11.3')) errors.push(`package version must preserve 1.11.3+ contracts: ${pkg.version}`);
if (!atLeast(assetManifest.release, '1.11.3')) errors.push(`asset manifest release must preserve 1.11.3+ contracts: ${assetManifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1113'] !== 'node scripts/validate-v1113-upgrade.mjs') errors.push('v1.11.3 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1113')) errors.push('verify does not include v1.11.3 validator');

const paintedBundle = assetManifest.bundles?.['player-owned-painted'];
if (!paintedBundle) errors.push('player-owned-painted bundle missing');
const paintedFiles = new Set(paintedBundle?.files ?? []);
for (const path of [
  'live/v7/atlases/player/player_owned_painted_v7.json',
  'live/v7/atlases/player/player_owned_painted_v7.webp',
]) if (!paintedFiles.has(path)) errors.push(`player-owned-painted bundle missing: ${path}`);
for (const eagerId of ['core-ui', 'battle-chapter-1']) {
  const eager = new Set(assetManifest.bundles?.[eagerId]?.files ?? []);
  for (const path of paintedFiles) if (eager.has(path)) errors.push(`${eagerId} must not eagerly include painted candidate: ${path}`);
}

if (atlas.meta?.version !== '1.11.3') errors.push(`painted atlas version mismatch: ${atlas.meta?.version}`);
if (atlas.meta?.runtimeDefaultEnabled !== false) errors.push('painted atlas must remain opt-in');
if (atlas.meta?.artPass !== 'owned-painted-candidate-v1') errors.push(`painted atlas art pass mismatch: ${atlas.meta?.artPass}`);
if (Object.keys(atlas.frames ?? {}).length !== 128) errors.push(`painted frame count must be 128: ${Object.keys(atlas.frames ?? {}).length}`);
if (Object.keys(atlas.animations ?? {}).length !== 80) errors.push(`painted animation count must be 80: ${Object.keys(atlas.animations ?? {}).length}`);

const requirements = {
  'src/core/performance/DeviceQaReport.ts': [
    "schema: 'lumerift-device-qa-v3'",
    'analyzeDeviceQaSession',
    'analysis?: DeviceQaSessionAnalysis',
  ],
  'src/core/performance/DeviceQaSessionAnalyzer.ts': [
    "export type DeviceQaStabilityGrade = 'excellent' | 'stable' | 'constrained' | 'unstable' | 'insufficient'",
    'recommendedFps: 30 | 60',
    'recommendedGraphics',
    'batteryDrainPer20Minutes',
    '표본 부족',
  ],
  'src/core/accessibility/AccessibilityController.ts': [
    'haptics: boolean',
    'combatAnnouncements: boolean',
    'toggleHaptics',
    'toggleCombatAnnouncements',
  ],
  'src/core/accessibility/HapticFeedbackController.ts': [
    "export type HapticCue",
    "bossCritical",
    'MIN_INTERVAL_MS',
    'public pulse',
  ],
  'src/core/accessibility/LiveRegionAnnouncer.ts': [
    "export type AnnouncementPriority = 'polite' | 'assertive'",
    'aria-live',
    'dedupeMs',
  ],
  'src/core/audio/AudioManager.ts': [
    'export interface AudioLayer',
    'playLayered',
    'playbackRate',
    'delayMs',
  ],
  'src/game/presentation/CombatAudioDirector.ts': [
    'export class CombatAudioDirector',
    'resolveCombatAudioLayers',
    "'overdrive'",
    "cue.kind === 'dodge'",
  ],
  'src/core/presentation/PlayerArtVariantController.ts': [
    "export type PlayerArtVariant = 'detail' | 'owned-preview' | 'owned-painted'",
    "'전용 도색 후보'",
  ],
  'src/core/assets/AssetCatalog.ts': [
    'ownedPaintedPlayerAtlas',
    'OWNED_PLAYER_PAINTED_BUNDLE',
    "id: 'player-owned-painted'",
  ],
  'src/app/AppContext.ts': [
    'haptics: HapticFeedbackController',
    'liveAnnouncer: LiveRegionAnnouncer',
  ],
  'src/app/GameApp.ts': [
    'new HapticFeedbackController()',
    'new LiveRegionAnnouncer()',
  ],
  'src/scenes/SettingsScene.ts': [
    '진동 피드백',
    '전투 낭독',
    'analyzeDeviceQaSession',
  ],
  'src/scenes/BattleScene.ts': [
    'OWNED_PLAYER_PAINTED_BUNDLE',
    "playerArtVariant === 'owned-painted'",
    'new CombatAudioDirector',
    "pulse('perfectDodge'",
    "pulse('bossCritical'",
    'announceAssistive',
  ],
};
for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.3 marker missing: ${marker}`);
  if (source.includes('.polygon(')) errors.push(`${path}: PixiJS 8 incompatible Graphics.polygon call reintroduced`);
}

for (const path of [
  'public/assets/live/v7/atlases/player/player_owned_painted_v7.webp',
  'art_source/lumerift_original/v1.11.3/player/player_owned_painted_v1_master.png',
  'art_source/lumerift_original/v1.11.3/player/player_owned_painted_v1_spec.json',
  'docs/previews/v1.11.3_owned_player_painted_contact.webp',
  'docs/PLAYER_PAINTED_CANDIDATE_v1.11.3.md',
  'docs/DEVICE_QA_ANALYSIS_v1.11.3.md',
  'docs/COMBAT_ACCESSIBILITY_FEEDBACK_v1.11.3.md',
  'docs/COMBAT_AUDIO_LAYERS_v1.11.3.md',
  'docs/MOBILE_COMBAT_E2E_v1.11.3.md',
  'docs/PATCH_NOTES_v1.11.3.md',
]) {
  try {
    const info = await stat(path);
    if (info.size < (path.endsWith('.json') ? 256 : 512)) errors.push(`${path}: v1.11.3 artifact too small`);
  } catch {
    errors.push(`${path}: v1.11.3 artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.3 upgrade: QA analysis v3, opt-in painted player, haptics, live announcements and layered combat audio contracts');
}
