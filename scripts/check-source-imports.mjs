import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';

const roots = ['src'];
const extensions = ['', '.ts', '.tsx', '.js', '.mjs', '.json'];
const errors = [];

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!['.ts', '.tsx', '.js', '.mjs'].includes(extname(entry.name))) continue;

    const source = await readFile(fullPath, 'utf8');
    const matches = source.matchAll(/(?:from\s+|import\s*\()(['"])(\.[^'"]+)\1/g);
    for (const match of matches) {
      const specifier = match[2];
      const base = resolve(dirname(fullPath), specifier);
      let found = false;
      for (const extension of extensions) {
        if (await exists(base + extension) || await exists(join(base, `index${extension}`))) {
          found = true;
          break;
        }
      }
      if (!found) errors.push(`누락된 상대 import: ${fullPath} -> ${specifier}`);
    }
  }
}

for (const root of roots) await walk(root);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS source imports');
}
