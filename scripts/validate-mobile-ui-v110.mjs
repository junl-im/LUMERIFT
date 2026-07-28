import { readFile, stat } from 'node:fs/promises';

const errors = [];
const requirements = {
  'src/core/layout/MobileViewportController.ts': [
    '--lumerift-viewport-offset-top',
    '--lumerift-viewport-offset-left',
    "root.dataset.platform",
    "root.dataset.pointer",
    "root.dataset.reducedMotion",
    "keyboardOffset > 80",
    "requestAnimationFrame",
  ],
  'src/styles.css': [
    '-webkit-text-size-adjust: 100%',
    'position: fixed',
    '--lumerift-viewport-offset-top',
    '.coupon-prompt-overlay',
    'min-height: 48px',
    'env(safe-area-inset-bottom)',
  ],
  'src/ui/UiMotion.ts': [
    'minTouchSize?: number',
    'new Rectangle',
    "'pointercancel'",
    "'(prefers-reduced-motion: reduce)'",
  ],
  'src/ui/CouponPromptOverlay.ts': [
    'promptCouponCode',
    "input.maxLength = 32",
    "input.focus({ preventScroll: true })",
    "replace(/[^A-Z0-9_-]/g, '')",
  ],
  'src/app/GameApp.ts': [
    'resolveCanvasResolution()',
    'deviceMemory',
    'hardwareConcurrency',
    'dataset.canvasResolution',
  ],
  'src/scenes/StageSelectScene.ts': [
    'selectedGlow',
    "createIconSprite('stage'",
    "icon: 'play'",
    'bindPressFeedback(root',
  ],
  'src/scenes/QuestScene.ts': [
    'rewardReadyPanels',
    "icon: 'quest'",
    "createIconSprite('gold'",
    "? 'check' : undefined",
  ],
  'src/scenes/ResultScene.ts': [
    'medalGroup',
    "createIconSprite('inventory'",
    "icon: 'recovery'",
    "icon: 'equipment'",
  ],
  'src/scenes/OperationsScene.ts': [
    'promptCouponCode',
    'sectionBadge(section',
    'bindPressFeedback(tab',
    'height: 44',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${path}: v1.10 marker missing: ${marker}`);
  }
}

const operations = await readFile('src/scenes/OperationsScene.ts', 'utf8');
if (operations.includes('window.prompt(')) errors.push('OperationsScene: native window.prompt must not be used for coupon entry');

for (const path of [
  'docs/MOBILE_QA_v1.10.0.md',
  'docs/UI_SYSTEM_v1.10.0.md',
  'docs/VISUAL_AUDIT_v1.10.0.md',
  'docs/PATCH_NOTES_v1.10.0.md',
  'docs/previews/v1.10.0_mobile_qa_contact.webp',
]) {
  try {
    const info = await stat(path);
    if (info.size < 256) errors.push(`${path}: artifact too small`);
  } catch {
    errors.push(`${path}: v1.10 artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.10 mobile UI: viewport, touch, font scaling, coupon keyboard flow and four-screen polish contracts');
}
