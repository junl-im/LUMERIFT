import { readFile, stat } from 'node:fs/promises';

const errors = [];
const requirements = {
  'src/core/accessibility/AccessibilityController.ts': [
    "export type VisionMode = 'standard' | 'colorAssist' | 'highContrast'",
    'largeHud',
    'reduceFlash',
    'root.dataset.visionMode',
    'CombatAccessibilityPalette',
  ],
  'src/core/performance/PerformanceMonitor.ts': [
    'onePercentLow',
    'longFrameRatio',
    'severeFrameRatio',
    "trend: 'improving' | 'stable' | 'degrading'",
  ],
  'src/core/performance/AdaptivePerformanceController.ts': [
    "export type AdaptivePerformanceLevel = 'full' | 'balanced' | 'safe'",
    'setAdaptiveLimit',
    'setAdaptiveCap',
    'resolutionScale',
    'estimatedPressure',
  ],
  'src/core/performance/DeviceQaReport.ts': [
    "schema: 'lumerift-device-qa-v1'",
    'estimatedPressure는 브라우저 프레임 추세 기반 추정값',
    'deviceMemory',
    'viewport',
  ],
  'src/scenes/SettingsScene.ts': [
    '기기 QA JSON 저장',
    '전투 HUD 접근성',
    'context.accessibility.cycleVisionMode()',
    'buildDeviceQaReport',
  ],
  'src/services/cloud/RecoveryArchive.ts': [
    "RECOVERY_ARCHIVE_SCHEMA = 'lumerift-recovery-archive-v1'",
    'seasonSnapshot',
    '현재 로그인 계정과 복구 JSON의 UID가 다릅니다.',
    'recoveryArchiveFilename',
  ],
  'src/scenes/RecoveryScene.ts': [
    'JSON 저장',
    'JSON 복원',
    "createRecoveryPoint(uid, 'pre-json-import')",
    'importRecoveryPoints',
  ],
  'src/scenes/BattleScene.ts': [
    "`♥ Lv.",
    "`${hpRatio <= 0.3 ? '▲' : '♥'} HP",
    "`◆ ${boss.controller.config.name}",
    'this.accessibility?.reduceFlash ? 0.28 : 1',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) {
    if (!source.includes(marker)) errors.push(`${path}: v1.10.1 marker missing: ${marker}`);
  }
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (packageJson.version !== '1.10.1') errors.push(`package.json version must be 1.10.1, got ${packageJson.version}`);
if (!packageJson.scripts?.['validate:mobile:v111']) errors.push('package.json validate:mobile:v111 script missing');

for (const path of [
  'art_source/lumerift_original/v1.10.1/player/player_silhouette_8dir_master.png',
  'art_source/lumerift_original/v1.10.1/player/player_silhouette_8dir_spec.json',
  'docs/previews/v1.10.1_player_silhouette_contact.webp',
  'docs/MOBILE_DEVICE_QA_v1.10.1.md',
  'docs/ACCESSIBILITY_v1.10.1.md',
  'docs/RECOVERY_ARCHIVE_v1.10.1.md',
  'docs/PLAYER_SILHOUETTE_v1.10.1.md',
  'docs/PATCH_NOTES_v1.10.1.md',
]) {
  try {
    const info = await stat(path);
    if (info.size < 256) errors.push(`${path}: artifact too small`);
  } catch {
    errors.push(`${path}: v1.10.1 artifact missing`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.10.1: adaptive device QA, accessibility HUD, recovery JSON and original 8-direction silhouette contracts');
}
