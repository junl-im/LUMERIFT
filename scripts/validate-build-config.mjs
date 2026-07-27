import { readFile } from 'node:fs/promises';

const source = await readFile('vite.config.ts', 'utf8');
const errors = [];

if (/manualChunks\s*:\s*\{/.test(source)) {
  errors.push('Vite 8에서는 manualChunks 객체 별칭 형식을 사용하지 않습니다. 함수 형식을 사용하세요.');
}
if (!/manualChunks\s*\([^)]*\)/.test(source)) {
  errors.push('manualChunks 함수 설정을 찾지 못했습니다.');
}
if (!source.includes("return 'pixi'")) errors.push('PixiJS 분리 청크 규칙이 없습니다.');
if (!source.includes("return 'firebase'")) errors.push('Firebase 분리 청크 규칙이 없습니다.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS Vite 8 build config: function-form manualChunks');
}
