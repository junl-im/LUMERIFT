import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const roots = ['public/assets', 'src'];
const groups = new Map();
let total = 0;
let initial = 0;
const initialPrefixes = [
  'public/assets/atlases/ui/',
  'public/assets/audio/ui/',
  'src/',
];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    const info = await stat(path);
    const display = relative(process.cwd(), path).replaceAll('\\', '/');
    total += info.size;
    if (initialPrefixes.some((prefix) => display.startsWith(prefix))) initial += info.size;
    const extension = extname(entry.name).toLowerCase() || '(none)';
    groups.set(extension, (groups.get(extension) ?? 0) + info.size);
  }
}

for (const root of roots) await walk(root);
const limit = 15 * 1024 * 1024;
console.log(`Asset/code source total: ${(total / 1024).toFixed(1)} KiB`);
console.log(`Estimated initial payload inputs: ${(initial / 1024).toFixed(1)} KiB / ${(limit / 1024 / 1024).toFixed(0)} MiB`);
for (const [extension, bytes] of [...groups.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${extension.padEnd(8)} ${(bytes / 1024).toFixed(1)} KiB`);
}
if (initial > limit) {
  console.error('초기 다운로드 예산 15MB를 초과했습니다.');
  process.exitCode = 1;
} else {
  console.log('PASS initial payload source budget');
}
