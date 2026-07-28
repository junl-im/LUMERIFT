import { createHash } from 'node:crypto';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const errors = [];
const publicRoot = 'public/assets';
const planFiles = (await readdir('asset_registry'))
  .filter((name) => /^RELOCATION_PLAN_v\d+\.\d+\.\d+\.json$/.test(name))
  .sort();
const plans = await Promise.all(planFiles.map(async (name) => JSON.parse(await readFile(`asset_registry/${name}`, 'utf8'))));
const moves = plans.flatMap((plan) => plan.moves ?? []);
const registry = JSON.parse(await readFile('asset_registry/ASSET_REGISTRY.json', 'utf8'));
const manifest = JSON.parse(await readFile(`${publicRoot}/ASSET_MANIFEST.json`, 'utf8'));
const allowed = new Set([
  'ASSET_MANIFEST.json',
  'LIVE_ART_V120_SUMMARY.json',
  'LIVE_ART_V170_SUMMARY.json',
  'OPERATIONS_V130_SUMMARY.json',
  'UI_SYSTEM_V190_SUMMARY.json',
]);
for (const bundle of Object.values(manifest.bundles ?? {})) for (const file of bundle.files ?? []) allowed.add(file);

async function walk(directory, callback) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path, callback);
    else await callback(path);
  }
}

let publicBytes = 0;
let publicFiles = 0;
await walk(publicRoot, async (path) => {
  const rel = relative(publicRoot, path).replaceAll('\\', '/');

  // .gitkeep only preserves an empty repository directory. It is not a runtime
  // asset and must not affect the manifest budget or cleanup policy.
  if (rel === '.gitkeep' || rel.endsWith('/.gitkeep')) return;

  const info = await stat(path);
  publicBytes += info.size;
  publicFiles += 1;
  if (!allowed.has(rel) && !rel.startsWith('live/v1/licenses/')) {
    errors.push(`public에 보관 전용 자산 잔존: ${rel}`);
  }
});
if (publicBytes > 8_000_000) errors.push(`public/assets 배포 예산 초과: ${(publicBytes / 1_000_000).toFixed(2)} MB / 8 MB`);
if (registry.release !== manifest.release) errors.push(`asset registry release mismatch: ${registry.release} / ${manifest.release}`);
if ((registry.summary?.['runtime-public']?.bytes ?? 0) !== publicBytes) errors.push('asset registry public bytes mismatch');

const sourceText = [];
await walk('src', async (path) => {
  if (path.endsWith('.ts')) sourceText.push(await readFile(path, 'utf8'));
});
const source = sourceText.join('\n');
for (const item of moves) {
  try {
    const data = await readFile(item.to);
    const digest = createHash('sha256').update(data).digest('hex');
    if (digest !== item.sha256) errors.push(`보관 자산 해시 불일치: ${item.to}`);
  } catch {
    errors.push(`보관 자산 누락: ${item.to}`);
  }
  try {
    await access(item.from);
    errors.push(`이동 전 public 경로가 남아 있음: ${item.from}`);
  } catch {
    // expected
  }
  const runtimePath = item.from.replace(/^public\//, '');
  if (source.includes(runtimePath)) errors.push(`소스가 보관 자산을 참조함: ${runtimePath}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  if (errors.some((message) => message.startsWith('이동 전 public 경로가 남아 있음:'))) {
    console.error('\nFIX: run APPLY_ASSET_CLEANUP_FIX.bat or node scripts/cleanup-relocated-assets.mjs, then commit the deleted files.');
  }
  process.exitCode = 1;
} else {
  console.log(`PASS asset cleanup: public ${publicFiles} files ${(publicBytes / 1_000_000).toFixed(2)} MB, archived ${moves.length} files across ${plans.length} plans`);
}
