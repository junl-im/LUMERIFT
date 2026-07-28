import { open, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOT = 'art_source';
const OWNED_ROOTS = [join(ROOT, 'v0.9.0'), join(ROOT, 'owned')];
const errors = [];
let fileCount = 0;
let totalBytes = 0;
let ownedBytes = 0;

async function walk(directory, onFile) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path, onFile);
    else await onFile(path);
  }
}

async function pngSize(path) {
  const handle = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(24);
    await handle.read(buffer, 0, 24, 0);
    if (buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error('PNG signature mismatch');
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  } finally {
    await handle.close();
  }
}

function capFor(path) {
  const normalized = path.replaceAll('\\', '/');
  if (normalized.includes('/keyart/')) return [1080, 1920];
  if (normalized.includes('/portraits/heroes/')) return [768, 1152];
  if (normalized.includes('/portraits/bosses/')) return [768, 768];
  if (normalized.includes('/portraits/npc/')) return [576, 768];
  if (normalized.includes('/contact_sheets/items_')) return [1536, 1536];
  if (normalized.includes('/contact_sheets/skills_')) return [1536, 960];
  if (normalized.includes('/ui/')) return [1920, 1440];
  return undefined;
}

await walk(ROOT, async (path) => {
  const info = await stat(path);
  fileCount += 1;
  totalBytes += info.size;
  const isOwned = OWNED_ROOTS.some((root) => path.startsWith(root));
  if (isOwned) ownedBytes += info.size;
  if (isOwned && extname(path).toLowerCase() === '.png') {
    const size = await pngSize(path);
    const cap = capFor(path);
    if (cap && (size.width > cap[0] || size.height > cap[1])) {
      errors.push(`${relative('.', path)}: ${size.width}x${size.height}, cap ${cap[0]}x${cap[1]}`);
    }
    if (info.size > 5_000_000) errors.push(`${relative('.', path)}: source PNG exceeds 5 MB`);
  }
});

if (fileCount < 79) errors.push(`art_source file count too low: ${fileCount} / 79`);
if (totalBytes > 120_000_000) errors.push(`art_source too large: ${(totalBytes / 1_000_000).toFixed(2)} MB / 120 MB`);
if (ownedBytes > 90_000_000) errors.push(`owned production source too large: ${(ownedBytes / 1_000_000).toFixed(2)} MB / 90 MB`);
if (ownedBytes < 40_000_000) errors.push(`owned production source unexpectedly small: ${(ownedBytes / 1_000_000).toFixed(2)} MB / 40 MB`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS mobile source art: ${fileCount} files, ${(totalBytes / 1_000_000).toFixed(2)} MB total, ${(ownedBytes / 1_000_000).toFixed(2)} MB owned`);
}
