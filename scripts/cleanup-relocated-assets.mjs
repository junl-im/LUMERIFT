import { createHash } from 'node:crypto';
import { access, readFile, readdir, rm, rmdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const root = process.cwd();
const registryDir = resolve(root, 'asset_registry');
const publicRoot = resolve(root, 'public/assets');
const errors = [];
const deleted = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sha256(path) {
  const data = await readFile(path);
  return createHash('sha256').update(data).digest('hex');
}

async function pruneEmptyDirectories(start) {
  let current = dirname(start);
  while (current.startsWith(publicRoot) && current !== publicRoot) {
    const entries = await readdir(current);
    if (entries.length > 0) break;
    await rmdir(current);
    current = dirname(current);
  }
}

const planFiles = (await readdir(registryDir))
  .filter((name) => /^RELOCATION_PLAN_v\d+\.\d+\.\d+\.json$/.test(name))
  .sort();

for (const planFile of planFiles) {
  const plan = JSON.parse(await readFile(join(registryDir, planFile), 'utf8'));
  for (const move of plan.moves ?? []) {
    const from = resolve(root, move.from);
    const to = resolve(root, move.to);

    if (!from.startsWith(publicRoot)) {
      errors.push(`Refusing to delete outside public/assets: ${move.from}`);
      continue;
    }
    if (!(await exists(from))) continue;
    if (!(await exists(to))) {
      errors.push(`Archive target missing; source kept: ${move.from} -> ${move.to}`);
      continue;
    }

    const expected = String(move.sha256 ?? '').toLowerCase();
    const sourceDigest = await sha256(from);
    const archiveDigest = await sha256(to);

    if (!expected || sourceDigest !== expected || archiveDigest !== expected) {
      errors.push(`Hash mismatch; source kept: ${move.from}`);
      continue;
    }

    const info = await stat(from);
    await rm(from, { force: true });
    await pruneEmptyDirectories(from);
    deleted.push({ path: relative(root, from).replaceAll('\\', '/'), bytes: info.size });
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`Cleanup stopped with ${errors.length} safety error(s).`);
  process.exitCode = 1;
} else {
  const bytes = deleted.reduce((sum, item) => sum + item.bytes, 0);
  console.log(`PASS relocated asset cleanup: deleted ${deleted.length} stale file(s), ${(bytes / 1_000_000).toFixed(2)} MB`);
  if (deleted.length) {
    for (const item of deleted) console.log(`DELETE ${item.path}`);
  }
}
