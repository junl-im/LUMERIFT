import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'public/assets';
const manifest = JSON.parse(await readFile(join(root, 'ASSET_MANIFEST.json'), 'utf8'));
const errors = [];
let files = 0;
let bytes = 0;

for (const [bundleId, bundle] of Object.entries(manifest.bundles ?? {})) {
  let bundleBytes = 0;
  if (!Array.isArray(bundle.files) || bundle.files.length === 0) {
    errors.push(`${bundleId}: 파일 목록 누락`);
    continue;
  }
  for (const relativePath of bundle.files) {
    try {
      const info = await stat(join(root, relativePath));
      bundleBytes += info.size;
      bytes += info.size;
      files += 1;
    } catch {
      errors.push(`${bundleId}: 파일 누락 ${relativePath}`);
    }
  }
  if (bundleBytes !== bundle.bytes) {
    errors.push(`${bundleId}: manifest bytes ${bundle.bytes} != actual ${bundleBytes}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS asset manifest: ${Object.keys(manifest.bundles).length} bundles, ${files} files, ${bytes} bytes`);
}
