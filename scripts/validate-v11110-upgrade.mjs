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

if (!atLeast(pkg.version, '1.11.10')) errors.push(`package version must preserve 1.11.10+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.10')) errors.push(`asset manifest release must preserve 1.11.10+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v11110'] !== 'node scripts/validate-v11110-upgrade.mjs') errors.push('v1.11.10 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11110')) errors.push('verify does not include v1.11.10 validator');

const requirements = {
  'src/ui/InterfaceChrome.ts': [
    'export function createFeatureMarquee(',
    'export function createComicTag(',
    'const speedLines = new Graphics()',
  ],
  'src/ui/SceneChrome.ts': [
    "const updateTag = createComicTag('LIVE RENEWAL', 0xf0ca78);",
    "const headlineMarquee = createFeatureMarquee('WEBTOON CLEAN'",
  ],
  'src/ui/UiTheme.ts': [
    'const storyRibbon = new Graphics()',
    'const bevelLine = new Graphics()',
  ],
  'src/scenes/LobbyScene.ts': [
    '리뉴얼 브리핑',
    "createFeatureMarquee('전술·아트·자동화 업그레이드'",
    "createComicTag('STYLE UP!'",
  ],
  'src/scenes/AssetGalleryScene.ts': [
    "createFeatureMarquee('아트 룩·에셋 라인업'",
    "createComicTag('production-line'",
  ],
  'README.md': [
    '# LUMERIFT: 균열의 계승자 v1.11.10',
    'docs/INTERFACE_RENEWAL_v1.11.10.md',
    'docs/ASSET_RENEWAL_v1.11.10.md',
    'docs/PATCH_NOTES_v1.11.10.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.10 marker missing: ${marker}`);
}

for (const doc of [
  'docs/INTERFACE_RENEWAL_v1.11.10.md',
  'docs/ASSET_RENEWAL_v1.11.10.md',
  'docs/PATCH_NOTES_v1.11.10.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.10 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.10 upgrade: webtoon-clean interface chrome, renewal briefing, and asset gallery production-line guidance');
}
