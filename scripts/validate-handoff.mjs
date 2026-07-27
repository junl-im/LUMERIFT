import { readFile, stat } from 'node:fs/promises';

const requiredFiles = [
  'AGENTS.md',
  'PROJECT_HANDOFF.md',
  'HANDOFF_STATE.json',
  'docs/HANDOFF_MASTER.md',
  'docs/HANDOFF_LOG.md',
  'docs/MASTER_BIBLE.md',
  'docs/CHANGELOG.md',
  'docs/ROADMAP.md',
  'RELEASE_MANIFEST.json',
  'README.md',
];
const errors = [];
for (const path of requiredFiles) {
  try {
    const info = await stat(path);
    if (info.size < 20) errors.push(`${path}: 파일이 비어 있거나 너무 짧습니다.`);
  } catch {
    errors.push(`${path}: 필수 인수인계 파일 누락`);
  }
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const state = JSON.parse(await readFile('HANDOFF_STATE.json', 'utf8'));
const release = JSON.parse(await readFile('RELEASE_MANIFEST.json', 'utf8'));
const assetManifest = JSON.parse(await readFile('public/assets/ASSET_MANIFEST.json', 'utf8'));
const readme = await readFile('README.md', 'utf8');
const handoff = await readFile('docs/HANDOFF_MASTER.md', 'utf8');
const agents = await readFile('AGENTS.md', 'utf8');

const versions = [pkg.version, state.version, release.version, assetManifest.release];
if (new Set(versions).size !== 1) errors.push(`버전 불일치: ${versions.join(' / ')}`);
const version = pkg.version;
if (!readme.includes(`v${version}`)) errors.push(`README에 v${version} 표기가 없습니다.`);
if (!handoff.includes(`v${version}`)) errors.push(`HANDOFF_MASTER에 v${version} 표기가 없습니다.`);
if (!Array.isArray(state.completed) || state.completed.length < 5) errors.push('HANDOFF_STATE.completed가 충분하지 않습니다.');
if (!Array.isArray(state.nextPlanned) || state.nextPlanned.length < 1) errors.push('HANDOFF_STATE.nextPlanned가 비어 있습니다.');
if (!Array.isArray(state.immutableRules) || state.immutableRules.length < 5) errors.push('HANDOFF_STATE.immutableRules가 충분하지 않습니다.');
for (const phrase of ['결과', '전체 통합 ZIP', '덮어쓰기용 패치 ZIP', '다음 업데이트']) {
  if (!agents.includes(phrase)) errors.push(`AGENTS 릴리스 보고 규칙 누락: ${phrase}`);
}
if (state.releaseArtifacts?.fullArchive !== release.fullArchive) errors.push('전체 ZIP 이름이 HANDOFF_STATE와 RELEASE_MANIFEST에서 다릅니다.');
if (state.releaseArtifacts?.patchArchive !== release.patchArchive) errors.push('패치 ZIP 이름이 HANDOFF_STATE와 RELEASE_MANIFEST에서 다릅니다.');


for (const phrase of ['전체 통합 ZIP에는 코드·문서·런타임 자산·모바일 제작용 원본', '경량 실행본', '초기 다운로드 15MB']) {
  if (!agents.includes(phrase)) errors.push(`AGENTS 전체 보존 규칙 누락: ${phrase}`);
}
if (state.assetMetrics?.sourceArchiveIncludedInFull !== true) errors.push('HANDOFF_STATE에 전체 원본 보존 상태가 true가 아닙니다.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS handoff policy: v${version}, ${requiredFiles.length} required files, ${state.completed.length} completed records`);
}
