import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
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

if (!atLeast(pkg.version, '1.11.12')) errors.push(`package version must preserve 1.11.12+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.12')) errors.push(`asset manifest release must preserve 1.11.12+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v11112'] !== 'node scripts/validate-v11112-upgrade.mjs') errors.push('v1.11.12 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11112')) errors.push('verify does not include v1.11.12 validator');

const requirements = {
  'src/scenes/LobbyScene.ts': [
    'UX UPGRADE',
    '커맨드 허브 · UX 업그레이드',
    '커맨드 브리핑',
    'asset audit ready',
  ],
  'src/scenes/AssetGalleryScene.ts': [
    'PRODUCTION · ARCHIVE · MOBILE MASTER',
    'mobile master audit ready',
    '실사용 배경/초상 감수',
    '감수 포인트 · 화면 비율 유지',
  ],
  'src/scenes/ResultScene.ts': [
    'TACTICAL SUMMARY · AUTO ASSIST REPORT',
    'MISSION REWARD · LOOT OVERVIEW',
    '다음 추천 행동 ·',
    'performanceLabel()',
    'nextRecommendation()',
  ],
  'src/ui/SceneChrome.ts': [
    'UX UPGRADE',
    'TACTICAL COMIC UI',
    'v1.11.12 인터페이스 라인',
  ],
  'README.md': [
    '## v1.11.12 핵심 업데이트',
    'docs/UI_UX_RENEWAL_v1.11.12.md',
    'docs/ASSET_AUDIT_v1.11.12.md',
    'docs/PATCH_NOTES_v1.11.12.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.12 marker missing: ${marker}`);
}

for (const doc of [
  'docs/UI_UX_RENEWAL_v1.11.12.md',
  'docs/ASSET_AUDIT_v1.11.12.md',
  'docs/PATCH_NOTES_v1.11.12.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.12 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.12 upgrade: command hub UI polish, asset audit UX, and tactical result recommendations');
}
