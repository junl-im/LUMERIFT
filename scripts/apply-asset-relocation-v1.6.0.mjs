import { createHash } from 'node:crypto';
import { access, mkdir, readFile, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

const plan = JSON.parse(await readFile('asset_registry/RELOCATION_PLAN_v1.6.0.json', 'utf8'));
const exists = async (path) => access(path).then(() => true).catch(() => false);
const hash = async (path) => createHash('sha256').update(await readFile(path)).digest('hex');
let moved = 0;
let already = 0;
let removed = 0;
const errors = [];

for (const item of plan.moves) {
  const sourceExists = await exists(item.from);
  const targetExists = await exists(item.to);
  if (targetExists) {
    if (await hash(item.to) !== item.sha256) {
      errors.push(`보관 파일 해시 불일치: ${item.to}`);
      continue;
    }
    if (sourceExists) {
      if (await hash(item.from) !== item.sha256) {
        errors.push(`원본 파일 해시 불일치: ${item.from}`);
        continue;
      }
      await rm(item.from);
      removed += 1;
    }
    already += 1;
    continue;
  }
  if (!sourceExists) {
    errors.push(`이동할 자산 누락: ${item.from}`);
    continue;
  }
  if (await hash(item.from) !== item.sha256) {
    errors.push(`이동 전 해시 불일치: ${item.from}`);
    continue;
  }
  await mkdir(dirname(item.to), { recursive: true });
  await rename(item.from, item.to);
  moved += 1;
}

for (const item of plan.removed ?? []) {
  if (await exists(item.path)) {
    await rm(item.path);
    removed += 1;
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS asset relocation: moved ${moved}, already archived ${already}, removed ${removed}`);
}
