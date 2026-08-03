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

if (pkg.scripts?.['validate:upgrade:v1112'] !== 'node scripts/validate-v1112-upgrade.mjs') {
  errors.push('package.json v1.11.2 전용 플레이어 Atlas·QA 세션 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1112')) {
  errors.push('verify에서 v1.11.2 전용 플레이어 Atlas·QA 세션 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v1113'] !== 'node scripts/validate-v1113-upgrade.mjs') {
  errors.push('package.json v1.11.3 QA 분석·도색 후보·전투 접근성 검증 연결이 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1114'] !== 'node scripts/validate-v1114-upgrade.mjs') {
  errors.push('package.json v1.11.4 방향 보정·UI 정리·캐릭터 polish 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1113')) {
  errors.push('verify에서 v1.11.3 QA 분석·도색 후보·전투 접근성 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1115'] !== 'node scripts/validate-v1115-upgrade.mjs') {
  errors.push('package.json v1.11.5 HUD·타격감 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1115')) {
  errors.push('verify에서 v1.11.5 HUD·타격감 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1116'] !== 'node scripts/validate-v1116-upgrade.mjs') {
  errors.push('package.json v1.11.6 8방향 이동 그래픽 강화 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1116')) {
  errors.push('verify에서 v1.11.6 8방향 이동 그래픽 강화 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1117'] !== 'node scripts/validate-v1117-upgrade.mjs') {
  errors.push('package.json v1.11.7 자동 타겟·자동 전투·인터페이스 리뉴얼 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1117')) {
  errors.push('verify에서 v1.11.7 자동 타겟·자동 전투·인터페이스 리뉴얼 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1118'] !== 'node scripts/validate-v1118-upgrade.mjs') {
  errors.push('package.json v1.11.8 대규모 인터페이스·자동 세부 설정 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1118')) {
  errors.push('verify에서 v1.11.8 대규모 인터페이스·자동 세부 설정 검사가 누락되었습니다.');
}
if (pkg.scripts?.['validate:upgrade:v1119'] !== 'node scripts/validate-v1119-upgrade.mjs') {
  errors.push('package.json v1.11.9 자동 진단·Safe Area·방향 공격 포즈 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1119')) {
  errors.push('verify에서 v1.11.9 자동 진단·Safe Area·방향 공격 포즈 검사가 누락되었습니다.');
}

if (pkg.scripts?.['validate:upgrade:v11110'] !== 'node scripts/validate-v11110-upgrade.mjs') {
  errors.push('package.json v1.11.10 인터페이스·에셋 리뉴얼 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11110')) {
  errors.push('verify에서 v1.11.10 인터페이스·에셋 리뉴얼 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11111'] !== 'node scripts/validate-v11111-upgrade.mjs') {
  errors.push('package.json v1.11.11 자동 세션 로그·보스 회피·복합 스킬 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11111')) {
  errors.push('verify에서 v1.11.11 자동 세션 로그·보스 회피·복합 스킬 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11112'] !== 'node scripts/validate-v11112-upgrade.mjs') {
  errors.push('package.json v1.11.12 UI·UX·에셋 업그레이드 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11112')) {
  errors.push('verify에서 v1.11.12 UI·UX·에셋 업그레이드 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11113'] !== 'node scripts/validate-v11113-upgrade.mjs') {
  errors.push('package.json v1.11.13 상황 기반 UI·에셋 품질 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11113')) {
  errors.push('verify에서 v1.11.13 상황 기반 UI·에셋 품질 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11114'] !== 'node scripts/validate-v11114-upgrade.mjs') {
  errors.push('package.json v1.11.14 자동 전략 프리셋·보스 위협 HUD 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11114')) {
  errors.push('verify에서 v1.11.14 자동 전략 프리셋·보스 위협 HUD 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11115'] !== 'node scripts/validate-v11115-upgrade.mjs') {
  errors.push('package.json v1.11.15 보스 회피 데이터·프리셋 저장소 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11115')) {
  errors.push('verify에서 v1.11.15 보스 회피 데이터·프리셋 저장소 검사가 누락되었습니다.');
}


if (pkg.scripts?.['validate:upgrade:v11116'] !== 'node scripts/validate-v11116-upgrade.mjs') {
  errors.push('package.json v1.11.16 자동 전투 기록·보스 HUD 데이터·8방향 무기 궤적 검증 연결이 누락되었습니다.');
}
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11116')) {
  errors.push('verify에서 v1.11.16 자동 전투 기록·보스 HUD 데이터·8방향 무기 궤적 검사가 누락되었습니다.');
}

if (pkg.scripts?.['validate:upgrade:v11117'] !== 'node scripts/validate-v11117-upgrade.mjs') errors.push('v1.11.17 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11117')) errors.push('verify missing v1.11.17');

if (pkg.scripts?.['validate:upgrade:v11118'] !== 'node scripts/validate-v11118-upgrade.mjs') errors.push('v1.11.18 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11118')) errors.push('verify missing v1.11.18');

if (pkg.scripts?.['validate:upgrade:v11119'] !== 'node scripts/validate-v11119-upgrade.mjs') errors.push('v1.11.19 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11119')) errors.push('verify missing v1.11.19');

if (pkg.scripts?.['validate:upgrade:v11120'] !== 'node scripts/validate-v11120-upgrade.mjs') errors.push('v1.11.20 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11120')) errors.push('verify missing v1.11.20');

if (pkg.scripts?.['validate:upgrade:v11121'] !== 'node scripts/validate-v11121-upgrade.mjs') errors.push('v1.11.21 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11121')) errors.push('verify missing v1.11.21');

if (pkg.scripts?.['validate:upgrade:v11122'] !== 'node scripts/validate-v11122-upgrade.mjs') errors.push('v1.11.22 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11122')) errors.push('verify missing v1.11.22');

if (pkg.scripts?.['validate:upgrade:v11123'] !== 'node scripts/validate-v11123-upgrade.mjs') errors.push('v1.11.23 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11123')) errors.push('verify missing v1.11.23');

if (pkg.scripts?.['validate:upgrade:v11124'] !== 'node scripts/validate-v11124-upgrade.mjs') errors.push('v1.11.24 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11124')) errors.push('verify missing v1.11.24');

if (pkg.scripts?.['validate:upgrade:v11125'] !== 'node scripts/validate-v11125-upgrade.mjs') errors.push('v1.11.25 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11125')) errors.push('verify missing v1.11.25');

if (pkg.scripts?.['validate:upgrade:v11126'] !== 'node scripts/validate-v11126-upgrade.mjs') errors.push('v1.11.26 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11126')) errors.push('verify missing v1.11.26');

if (pkg.scripts?.['validate:upgrade:v11127'] !== 'node scripts/validate-v11127-upgrade.mjs') errors.push('v1.11.27 validator missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11127')) errors.push('verify missing v1.11.27');


if (pkg.scripts?.['validate:upgrade:v11131'] !== 'node scripts/validate-v11131-upgrade.mjs') errors.push('v1.11.31 validator missing');
if (pkg.scripts?.['validate:production:v11131'] !== 'node scripts/verify-v11131-production.mjs') errors.push('v1.11.31 production verifier missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11131') || !pkg.scripts?.verify?.includes('npm run validate:production:v11131')) errors.push('verify missing v1.11.31');

if (pkg.scripts?.['validate:upgrade:v11132'] !== 'node scripts/validate-v11132-upgrade.mjs') errors.push('v1.11.32 validator missing');
if (pkg.scripts?.['validate:production:v11132'] !== 'node scripts/verify-v11132-production.mjs') errors.push('v1.11.32 production verifier missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11132') || !pkg.scripts?.verify?.includes('npm run validate:production:v11132')) errors.push('verify missing v1.11.32');

if (pkg.scripts?.['validate:upgrade:v11135'] !== 'node scripts/validate-v11135-upgrade.mjs') errors.push('v1.11.35 validator missing');
if (pkg.scripts?.['validate:production:v11135'] !== 'node scripts/verify-v11135-production.mjs') errors.push('v1.11.35 production verifier missing');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11135') || !pkg.scripts?.verify?.includes('npm run validate:production:v11135')) errors.push('verify missing v1.11.35');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS release version contract: v${expected}, preverify and cumulative release validators connected`);
}
