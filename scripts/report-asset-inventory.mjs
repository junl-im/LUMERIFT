import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = 'public/assets';
let files = 0;
let bytes = 0;
let atlases = 0;
let frames = 0;
let animations = 0;
const byExtension = new Map();

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    files += 1;
    const info = await stat(path);
    bytes += info.size;
    const extension = extname(entry.name).toLowerCase() || '(none)';
    byExtension.set(extension, (byExtension.get(extension) ?? 0) + 1);
    if (extension === '.json') {
      try {
        const data = JSON.parse(await readFile(path, 'utf8'));
        if (data.frames && data.meta?.image) {
          atlases += 1;
          frames += Object.keys(data.frames).length;
          animations += Object.keys(data.animations ?? {}).length;
        }
      } catch {
        // Other validators report invalid JSON.
      }
    }
  }
}

await walk(root);
const summary = JSON.parse(await readFile(join(root, 'MEGAPACK_V080_SUMMARY.json'), 'utf8'));
const expectedFrames = 1174;
const expectedAnimations = 127;
const errors = [];
if (frames !== expectedFrames) errors.push(`Atlas 프레임 ${frames} != ${expectedFrames}`);
if (animations !== expectedAnimations) errors.push(`Atlas 애니메이션 ${animations} != ${expectedAnimations}`);
if (summary.counts.megaItems !== 160) errors.push('메가 아이템 수량 오류');
if (summary.counts.environmentProps !== 120) errors.push('환경 오브젝트 수량 오류');
if (summary.counts.mapBackgrounds !== 15) errors.push('맵 배경 수량 오류');

console.log(`Asset inventory: ${files} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
console.log(`Atlas inventory: ${atlases} atlases, ${frames} frames, ${animations} animations`);
console.log([...byExtension.entries()].sort((a,b) => b[1]-a[1]).map(([ext,count]) => `${ext}:${count}`).join(' '));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v0.8 mega asset inventory');
}
