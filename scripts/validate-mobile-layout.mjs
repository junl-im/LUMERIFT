import { readFile, stat } from 'node:fs/promises';

const errors = [];
const index = await readFile('index.html', 'utf8');
const styles = await readFile('src/styles.css', 'utf8');
const gameApp = await readFile('src/app/GameApp.ts', 'utf8');
const controller = await readFile('src/core/layout/MobileViewportController.ts', 'utf8');

for (const marker of ['viewport-fit=cover', 'maximum-scale=1', 'user-scalable=no']) {
  if (!index.includes(marker)) errors.push(`index viewport marker missing: ${marker}`);
}
for (const marker of ['env(safe-area-inset-top)', '100dvh', '--lumerift-viewport-height', '--lumerift-keyboard-offset']) {
  if (!styles.includes(marker)) errors.push(`safe-area CSS marker missing: ${marker}`);
}
for (const marker of ['visualViewport', 'orientationchange', 'keyboardOffset']) {
  if (!controller.includes(marker)) errors.push(`viewport controller marker missing: ${marker}`);
}
if (!gameApp.includes('this.mobileViewport.start()')) errors.push('GameApp viewport controller start missing');
if (!gameApp.includes('this.mobileViewport.destroy()')) errors.push('GameApp viewport controller cleanup missing');
try {
  const preview = await stat('docs/previews/v1.3.0_operations_preview.webp');
  if (preview.size < 10_000) errors.push('operations mobile preview too small');
} catch {
  errors.push('operations mobile preview missing');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS mobile layout v1.3: safe area, dynamic viewport, keyboard offset and portrait preview');
}
