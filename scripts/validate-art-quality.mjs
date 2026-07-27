import { access, readFile } from 'node:fs/promises';

const errors = [];
const requiredArchivePaths = [
  'art_source',
  'public/assets/atlases/quality',
  'public/assets/maps/quality',
  'public/assets/loading/quality',
  'public/assets/QUALITYPACK_V090_SUMMARY.json',
  'public/assets/MEGAPACK_V080_SUMMARY.json',
];
for (const path of requiredArchivePaths) {
  try { await access(path); } catch { errors.push(`전체 통합본 보관 자산 누락: ${path}`); }
}

const catalog = await readFile('src/core/assets/AssetCatalog.ts', 'utf8');
for (const marker of ['quality-', 'mega_items_v1', 'effects_mega_v1', 'maps/quality', 'loading/quality']) {
  if (catalog.includes(marker)) errors.push(`기본 AssetCatalog이 레거시 보관 자산을 참조합니다: ${marker}`);
}
const agents = await readFile('AGENTS.md', 'utf8');
for (const phrase of ['전체 통합 ZIP에는 코드·문서·런타임 자산·고해상도 원본', '경량 실행본', '초기 다운로드 15MB']) {
  if (!agents.includes(phrase)) errors.push(`AGENTS 전체본 규칙 누락: ${phrase}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS full art archive policy: 원본·레거시 보존, 기본 런타임 참조 분리');
}
