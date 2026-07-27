import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const INITIAL_LIMIT = 15 * 1024 * 1024;
let deployTotal = 0;
let initialTotal = 0;
const files = [];

const initialPrefixes = [
  'index.html',
  'manifest.webmanifest',
  'assets/atlases/ui/',
  'assets/audio/ui/',
];

function isInitial(path) {
  if (initialPrefixes.some((prefix) => path === prefix || path.startsWith(prefix))) return true;
  // Vite-compiled JS/CSS chunks are emitted directly under dist/assets.
  return /^assets\/[^/]+\.(js|css|woff2?)$/i.test(path);
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    const info = await stat(fullPath);
    const path = relative(DIST, fullPath).replaceAll('\\', '/');
    deployTotal += info.size;
    if (isInitial(path)) initialTotal += info.size;
    files.push({ path, size: info.size, initial: isInitial(path) });
  }
}

await walk(DIST);
files.sort((a, b) => b.size - a.size);

console.log(`dist deploy total: ${(deployTotal / 1024 / 1024).toFixed(2)} MiB`);
console.log(`estimated initial download: ${(initialTotal / 1024 / 1024).toFixed(2)} MiB / 15.00 MiB`);
for (const file of files.filter((entry) => entry.initial).slice(0, 10)) {
  console.log(`${(file.size / 1024).toFixed(1).padStart(8)} KiB  ${file.path}`);
}

if (initialTotal > INITIAL_LIMIT) {
  console.error('FAIL: 초기 다운로드 15MB 예산 초과');
  process.exitCode = 1;
} else {
  console.log('PASS initial bundle budget; lazy assets are excluded from initial-download accounting');
}
