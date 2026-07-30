import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const registry = await readJson('asset_registry/ASSET_REGISTRY.json');
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

if (!atLeast(pkg.version, '1.11.13')) errors.push(`package version must preserve 1.11.13+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.13')) errors.push(`asset manifest release must preserve 1.11.13+ contracts: ${manifest.release}`);
if (!atLeast(registry.release, '1.11.13')) errors.push(`asset registry release must preserve 1.11.13+ contracts: ${registry.release}`);
if (pkg.scripts?.['validate:upgrade:v11113'] !== 'node scripts/validate-v11113-upgrade.mjs') errors.push('v1.11.13 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11113')) errors.push('verify does not include v1.11.13 validator');

const requirements = {
  'src/ui/UxFeedback.ts': [
    'export function createUxStatusRail',
    'export function createInlineFeedback',
    'UxFeedbackTone',
  ],
  'src/ui/UiButton.ts': [
    'readonly subtitleFontSize?: number',
    'const compactSubtitle',
    'options.subtitleLineHeight',
  ],
  'src/game/ui/LobbyNextAction.ts': [
    'export function resolveLobbyNextAction',
    "id: 'claim-quest'",
    "id: 'continue-story'",
    "id: 'review-assets'",
  ],
  'src/scenes/LobbyScene.ts': [
    'resolveLobbyNextAction({ claimableQuests, operationAlerts, clearedStages, totalStages: 10 })',
    'createUxStatusRail({',
    'openNextAction(context',
    '커맨드 브리핑 · asset audit ready',
  ],
  'src/scenes/SettingsScene.ts': [
    'createInlineFeedback(',
    '설정 변경은 즉시 저장되며',
  ],
  'src/game/presentation/ResultActionPlan.ts': [
    'export function resolveResultActionPlan',
    "performanceLabel: 'TACTICAL RESET'",
    "primaryLabel: '다음 스테이지 진행'",
  ],
  'src/scenes/ResultScene.ts': [
    'private actionPlan(): ResultActionPlan',
    'actionPlan.primaryLabel',
    'this.actionPlan().recommendation',
  ],
  'src/scenes/AssetGalleryScene.ts': [
    'QUALITY ${summary.score}/100',
    'MOBILE ROLE ${summary.mobileRole}',
    'score: 90',
    "mobileRole: 'UI BASELINE'",
  ],
  'README.md': [
    '## v1.11.13 핵심 업데이트',
    'docs/CONTEXTUAL_UX_FLOW_v1.11.13.md',
    'docs/ASSET_QUALITY_MATRIX_v1.11.13.md',
    'docs/PATCH_NOTES_v1.11.13.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.13 marker missing: ${marker}`);
}

for (const doc of [
  'docs/CONTEXTUAL_UX_FLOW_v1.11.13.md',
  'docs/ASSET_QUALITY_MATRIX_v1.11.13.md',
  'docs/PATCH_NOTES_v1.11.13.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.13 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.13 upgrade: contextual lobby flow, settings feedback, result action plan, asset quality matrix, and compact subtitles');
}
