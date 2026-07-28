import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const state = await readJson('HANDOFF_STATE.json');
const release = await readJson('RELEASE_MANIFEST.json');
const assetManifest = await readJson('public/assets/ASSET_MANIFEST.json');
const brandSource = await readFile('src/app/brand.ts', 'utf8');
const errors = [];

const versions = {
  package: pkg.version,
  handoffState: state.version,
  releaseManifest: release.version,
  assetManifest: assetManifest.release,
};
const unique = new Set(Object.values(versions));
if (unique.size !== 1) {
  errors.push(`릴리스 버전 불일치: ${Object.entries(versions).map(([key, value]) => `${key}=${value}`).join(' / ')}`);
}

const expected = release.version;
if (!brandSource.includes(`version: '${expected}'`)) {
  errors.push(`src/app/brand.ts 버전이 ${expected}와 일치하지 않습니다.`);
}
if (pkg.scripts?.preverify !== 'node scripts/cleanup-relocated-assets.mjs') {
  errors.push('package.json preverify 자동 자산 정리 연결이 누락되었습니다.');
}
if (pkg.scripts?.['validate:mobile:v111'] !== 'node scripts/validate-v111-release.mjs') {
  errors.push('package.json v1.10.1 전용 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:release')) {
  errors.push('verify 초반 릴리스 버전 검사가 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:mobile:v111')) {
  errors.push('verify에서 v1.10.1 전용 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v111'] !== 'node scripts/validate-v1110-upgrade.mjs') {
  errors.push('package.json v1.11.0 전투·그래픽 강화 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v111')) {
  errors.push('verify에서 v1.11.0 전투·그래픽 강화 검사가 누락되었습니다.');
}

if (pkg.scripts?.['validate:upgrade:v1111'] !== 'node scripts/validate-v1111-upgrade.mjs') {
  errors.push('package.json v1.11.1 전투 모션·기기 보정 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1111')) {
  errors.push('verify에서 v1.11.1 전투 모션·기기 보정 검사가 누락되었습니다.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS release version contract: v${expected}, preverify and cumulative release validators connected`);
}
