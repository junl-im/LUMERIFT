import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const roots = ['public/assets', 'src'];
const groups = new Map();
let total = 0;
let sourceBytes = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await walk(path); continue; }
    const info = await stat(path);
    const display = relative(process.cwd(), path).replaceAll('\\', '/');
    total += info.size;
    if (display.startsWith('src/')) sourceBytes += info.size;
    const extension = extname(entry.name).toLowerCase() || '(none)';
    groups.set(extension, (groups.get(extension) ?? 0) + info.size);
  }
}
for (const root of roots) await walk(root);
const manifest = JSON.parse(await readFile('public/assets/ASSET_MANIFEST.json', 'utf8'));
const initialFiles = new Set(manifest.bundles['core-ui'].files);
let initialAssets = 0;
for (const file of initialFiles) initialAssets += (await stat(join('public/assets', file))).size;
const initial = sourceBytes + initialAssets;
const limit = 15_000_000;
console.log(`Asset/code source total: ${(total / 1_000_000).toFixed(2)} MB`);
console.log(`Estimated initial payload inputs: ${(initial / 1_000_000).toFixed(2)} MB / 15 MB`);
for (const [extension, bytes] of [...groups.entries()].sort((a,b) => b[1]-a[1])) {
  console.log(`${extension.padEnd(8)} ${(bytes / 1_000_000).toFixed(2)} MB`);
}
if (initial > limit) {
  console.error('초기 다운로드 예산 15 MB를 초과했습니다.');
  process.exitCode = 1;
} else {
  console.log('PASS initial payload source budget');
}
