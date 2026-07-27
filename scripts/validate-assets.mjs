import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOTS = ['public', 'src'];
const FORBIDDEN = new Set(['.svg', '.svgz']);
const IMAGE_EXTENSIONS = new Set(['.png', '.webp']);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const AUDIO_EXTENSIONS = new Set(['.ogg', '.opus']);
const errors = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    const displayPath = relative(process.cwd(), fullPath);

    if (FORBIDDEN.has(extension)) {
      errors.push(`SVG 금지 위반: ${displayPath}`);
    }

    if (['.ts', '.tsx', '.js', '.mjs', '.html'].includes(extension)) {
      const source = await readFile(fullPath, 'utf8');
      if (/<svg[\s>]/i.test(source) || /createElementNS\s*\([^)]*svg/i.test(source)) {
        errors.push(`런타임 SVG 생성 금지 위반: ${displayPath}`);
      }
    }

    if (['.jpg', '.jpeg', '.gif', '.bmp', '.tiff'].includes(extension)) {
      errors.push(`게임 이미지 포맷 위반: ${displayPath} (PNG/WebP만 허용)`);
    }

    if (IMAGE_EXTENSIONS.has(extension)) {
      const file = await stat(fullPath);
      if (file.size > MAX_IMAGE_BYTES) {
        errors.push(`단일 이미지 4MB 초과: ${displayPath} (${file.size} bytes)`);
      }
      const signature = await readFile(fullPath);
      if (extension === '.png') {
        const expected = '89504e470d0a1a0a';
        if (signature.subarray(0, 8).toString('hex') !== expected) errors.push(`PNG 시그니처 오류: ${displayPath}`);
      }
      if (extension === '.webp') {
        const riff = signature.subarray(0, 4).toString('ascii');
        const webp = signature.subarray(8, 12).toString('ascii');
        if (riff !== 'RIFF' || webp !== 'WEBP') errors.push(`WebP 시그니처 오류: ${displayPath}`);
      }
    }

    if (AUDIO_EXTENSIONS.has(extension)) {
      const signature = await readFile(fullPath);
      if (signature.subarray(0, 4).toString('ascii') !== 'OggS') errors.push(`Ogg/Opus 시그니처 오류: ${displayPath}`);
    }
  }
}

for (const root of ROOTS) {
  await walk(root);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS asset policy: SVG 없음, PNG/WebP 규칙 통과');
}
