import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const RELEASE = '1.8.1';
const roots = [
  { path: 'public/assets', classification: 'runtime-public' },
  { path: 'art_source/runtime_archive/v1.6.0/public/assets', classification: 'runtime-archive' },
  { path: 'art_source/runtime_archive/v1.7.0/public/assets', classification: 'runtime-archive' },
  { path: 'art_source', classification: 'source-master' },
];
const entries = [];

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function walk(base, directory, classification) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(base, path, classification);
      continue;
    }
    const info = await stat(path);
    const normalized = path.replaceAll('\\', '/');
    const type = extname(entry.name).toLowerCase().replace('.', '') || 'none';
    let atlas = null;
    if (type === 'json') {
      try {
        const parsed = JSON.parse(await readFile(path, 'utf8'));
        if (parsed.frames && parsed.meta?.image) {
          atlas = {
            frames: Object.keys(parsed.frames).length,
            animations: Object.keys(parsed.animations ?? {}).length,
            image: parsed.meta.image,
          };
        }
      } catch {
        // Other validators handle malformed JSON.
      }
    }
    entries.push({
      path: normalized,
      relativePath: relative(base, path).replaceAll('\\', '/'),
      classification,
      type,
      bytes: info.size,
      sha256: await sha256(path),
      ...(atlas ? { atlas } : {}),
    });
  }
}

for (const root of roots) {
  try {
    await walk(root.path, root.path, root.classification);
  } catch {
    // Missing optional roots are caught by validation.
  }
}

const unique = new Map();
for (const entry of entries) {
  const previous = unique.get(entry.path);
  if (!previous || entry.classification === 'runtime-archive') unique.set(entry.path, entry);
}
const list = [...unique.values()].sort((a, b) => a.path.localeCompare(b.path));
const summary = {};
for (const entry of list) {
  const group = summary[entry.classification] ?? { files: 0, bytes: 0, atlases: 0, frames: 0, animations: 0 };
  group.files += 1;
  group.bytes += entry.bytes;
  if (entry.atlas) {
    group.atlases += 1;
    group.frames += entry.atlas.frames;
    group.animations += entry.atlas.animations;
  }
  summary[entry.classification] = group;
}

const registry = {
  schemaVersion: 2,
  release: RELEASE,
  generatedAt: new Date().toISOString(),
  classifications: {
    'runtime-public': 'GitHub Pages에 배포되는 현재 실사용·Lazy Loading 자산',
    'runtime-archive': '전체 통합본에 보존되지만 public 밖에 있어 배포되지 않는 레거시·제작 후보 자산',
    'source-master': '모바일 제작용 원본·라이선스·재가공 근거',
  },
  summary,
  entries: list,
};
await mkdir('asset_registry', { recursive: true });
await writeFile('asset_registry/ASSET_REGISTRY.json', `${JSON.stringify(registry, null, 2)}\n`);
console.log(`PASS asset registry generated: ${list.length} entries`);
