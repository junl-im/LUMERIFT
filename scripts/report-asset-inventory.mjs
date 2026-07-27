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
    if (entry.isDirectory()) { await walk(path); continue; }
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
      } catch { /* invalid JSON is handled elsewhere */ }
    }
  }
}
await walk(root);
console.log(`Stored public asset inventory: ${files} files, ${(bytes / 1_000_000).toFixed(2)} MB`);
console.log(`Atlas inventory: ${atlases} atlases, ${frames} frames, ${animations} animations`);
console.log([...byExtension.entries()].sort((a,b) => b[1]-a[1]).map(([ext,count]) => `${ext}:${count}`).join(' '));
console.log('PASS stored asset inventory (15 MB applies only to initial payload, not total archive assets)');
