import { access, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const errors = [];
let sourceFiles = 0;
let sourceBytes = 0;

async function walk(directory, onFile) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path, onFile);
    else await onFile(path);
  }
}

try {
  await access('art_source');
  await walk('art_source', async (path) => {
    sourceFiles += 1;
    sourceBytes += (await stat(path)).size;
  });
} catch {
  errors.push('전체 통합본 필수 디렉터리 누락: art_source');
}

if (sourceFiles < 79) errors.push(`art_source 파일 수 부족: ${sourceFiles} / 79`);
if (sourceBytes < 450_000_000) errors.push(`art_source 용량 부족: ${(sourceBytes / 1_000_000).toFixed(2)} MB / 450 MB`);

const archivedPaths = [
  'public/assets/MEGAPACK_V080_SUMMARY.json',
  'public/assets/QUALITYPACK_V090_SUMMARY.json',
  'public/assets/atlases/items/mega_items_v1.webp',
  'public/assets/atlases/quality/effects/vfx_quality_01.webp',
  'public/assets/maps/quality/chapter1/verdant_rift_battle_01.webp',
];
for (const path of archivedPaths) {
  try { await access(path); } catch { errors.push(`보관 자산 누락: ${path}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS full archive content: ${sourceFiles} source files, ${(sourceBytes / 1_000_000).toFixed(2)} MB`);
}
