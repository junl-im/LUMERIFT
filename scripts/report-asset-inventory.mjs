import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

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
const legacyFrames = 1174;
const legacyAnimations = 127;
const quality = JSON.parse(await readFile(join(root, 'QUALITYPACK_V090_SUMMARY.json'), 'utf8'));
const live = JSON.parse(await readFile(join(root, 'LIVE_ART_V100_SUMMARY.json'), 'utf8'));
const expectedFrames = legacyFrames + quality.counts.frames + live.counts.frames;
const expectedAnimations = legacyAnimations + quality.counts.animations + live.counts.animations;
const errors = [];
if (frames !== expectedFrames) errors.push(`Atlas 프레임 ${frames} != ${expectedFrames}`);
if (animations !== expectedAnimations) errors.push(`Atlas 애니메이션 ${animations} != ${expectedAnimations}`);
if (quality.counts.itemIcons !== 384) errors.push('v0.9 아이템 수량 오류');
if (quality.counts.environmentProps !== 240) errors.push('v0.9 환경 오브젝트 수량 오류');
if (quality.counts.battleBackgrounds !== 15) errors.push('v0.9 배경 수량 오류');

let sourceFiles = 0;
let sourceBytes = 0;
async function walkSources(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walkSources(path);
    else {
      sourceFiles += 1;
      sourceBytes += (await stat(path)).size;
    }
  }
}
await walkSources('art_source/v0.9.0');

console.log(`Runtime asset inventory: ${files} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
console.log(`Source master inventory: ${sourceFiles} files, ${(sourceBytes / 1024 / 1024).toFixed(2)} MiB`);
console.log(`Atlas inventory: ${atlases} atlases, ${frames} frames, ${animations} animations`);
console.log([...byExtension.entries()].sort((a,b) => b[1]-a[1]).map(([ext,count]) => `${ext}:${count}`).join(' '));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.0 live + legacy quality asset inventory');
}
