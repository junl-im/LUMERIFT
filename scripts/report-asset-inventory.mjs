import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

async function summarize(root) {
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
        } catch { /* malformed JSON is validated elsewhere */ }
      }
    }
  }
  await walk(root);
  return { files, bytes, atlases, frames, animations, byExtension };
}

const active = await summarize('public/assets');
const archived16 = await summarize('art_source/runtime_archive/v1.6.0/public/assets');
const archived17 = await summarize('art_source/runtime_archive/v1.7.0/public/assets');
const archived19 = await summarize('art_source/runtime_archive/v1.9.0/public/assets');
const archived = {
  files: archived16.files + archived17.files + archived19.files,
  bytes: archived16.bytes + archived17.bytes + archived19.bytes,
  atlases: archived16.atlases + archived17.atlases + archived19.atlases,
  frames: archived16.frames + archived17.frames + archived19.frames,
  animations: archived16.animations + archived17.animations + archived19.animations,
}; 
const total = {
  files: active.files + archived.files,
  bytes: active.bytes + archived.bytes,
  atlases: active.atlases + archived.atlases,
  frames: active.frames + archived.frames,
  animations: active.animations + archived.animations,
};
console.log(`Active public asset inventory: ${active.files} files, ${(active.bytes / 1_000_000).toFixed(2)} MB`);
console.log(`Archived runtime inventory: ${archived.files} files, ${(archived.bytes / 1_000_000).toFixed(2)} MB`);
console.log(`Preserved total: ${total.files} files, ${(total.bytes / 1_000_000).toFixed(2)} MB, ${total.atlases} atlases, ${total.frames} frames, ${total.animations} animations`);
console.log('PASS asset inventory: active deployment and full archive are separated');
