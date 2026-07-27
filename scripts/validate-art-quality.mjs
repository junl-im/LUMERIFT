import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const summaryPath = 'public/assets/QUALITYPACK_V090_SUMMARY.json';
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const errors = [];
const expected = {
  atlases: 26,
  frames: 1300,
  animations: 32,
  heroes: 8,
  bossPortraits: 12,
  npcPortraits: 16,
  itemIcons: 384,
  skillIcons: 160,
  environmentProps: 240,
  vfxSets: 32,
  vfxFrames: 384,
  uiFrames: 96,
  keyarts: 10,
  battleBackgrounds: 15,
  masterSourceFiles: 58,
};

if (summary.version !== '0.9.0') errors.push(`품질팩 버전 오류: ${summary.version}`);
if (summary.qualityStage !== 'production-candidate-procedural') {
  errors.push(`품질 단계 오류: ${summary.qualityStage}`);
}
for (const [key, value] of Object.entries(expected)) {
  if (summary.counts?.[key] !== value) errors.push(`${key}: ${summary.counts?.[key]} != ${value}`);
}
if ((summary.bytes?.runtime ?? 0) < 10 * 1024 * 1024) errors.push('런타임 품질팩이 10MiB 미만입니다.');
if ((summary.bytes?.sourceMasters ?? 0) < 300 * 1024 * 1024) errors.push('원본 PNG 보관 자산이 300MiB 미만입니다.');
if ((summary.bytes?.combined ?? 0) < 350 * 1024 * 1024) errors.push('통합 품질 자산이 350MiB 미만입니다.');

const sourceManifest = JSON.parse(await readFile('art_source/v0.9.0/SOURCE_MANIFEST.json', 'utf8'));
if (sourceManifest.qualityStage !== summary.qualityStage) errors.push('원본·런타임 품질 단계가 다릅니다.');
if (!Array.isArray(sourceManifest.sourceFiles) || sourceManifest.sourceFiles.length !== expected.masterSourceFiles) {
  errors.push(`SOURCE_MANIFEST 파일 수 오류: ${sourceManifest.sourceFiles?.length}`);
}

let atlasFiles = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!entry.name.endsWith('.json')) continue;
    const atlas = JSON.parse(await readFile(path, 'utf8'));
    if (!atlas.frames || !atlas.meta?.image) continue;
    atlasFiles += 1;
    if (atlas.meta.qualityStage !== summary.qualityStage) errors.push(`${path}: qualityStage 누락 또는 불일치`);
  }
}
await walk('public/assets/atlases/quality');
if (atlasFiles !== expected.atlases) errors.push(`품질 Atlas 수 오류: ${atlasFiles} != ${expected.atlases}`);

for (const entry of [...summary.keyarts, ...summary.maps]) {
  const relative = entry.runtime ?? entry.path;
  try {
    const info = await stat(join('public/assets', relative));
    if (info.size < 30 * 1024) errors.push(`${relative}: 고품질 이미지 후보치고 지나치게 작습니다.`);
  } catch {
    errors.push(`${relative}: 파일 누락`);
  }
}

const agents = await readFile('AGENTS.md', 'utf8');
for (const phrase of ['production-candidate-procedural', 'final-approved', '최종급으로 보고하지 않는다']) {
  if (!agents.includes(phrase)) errors.push(`AGENTS 품질 진실성 규칙 누락: ${phrase}`);
}
const readme = await readFile('README.md', 'utf8');
if (!readme.includes('최종 상용 원화가 아니다')) errors.push('README에 품질 한계 고지가 없습니다.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS art quality: ${atlasFiles} atlases, ${summary.counts.frames} frames, runtime ${(summary.bytes.runtime / 1024 / 1024).toFixed(2)}MiB, masters ${(summary.bytes.sourceMasters / 1024 / 1024).toFixed(2)}MiB`);
}
