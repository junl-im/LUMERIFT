import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const LIMIT = 15 * 1024 * 1024;
let total = 0;
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    const info = await stat(fullPath);
    total += info.size;
    files.push({ path: relative(DIST, fullPath), size: info.size });
  }
}

await walk(DIST);
files.sort((a, b) => b.size - a.size);

console.log(`dist total: ${(total / 1024 / 1024).toFixed(2)} MB / 15.00 MB`);
for (const file of files.slice(0, 10)) {
  console.log(`${(file.size / 1024).toFixed(1).padStart(8)} KB  ${file.path}`);
}

if (total > LIMIT) {
  console.error('FAIL: 초기 배포 번들 15MB 예산 초과');
  process.exitCode = 1;
} else {
  console.log('PASS bundle budget');
}
