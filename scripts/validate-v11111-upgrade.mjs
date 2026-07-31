import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const errors = [];
const atLeast = (version, minimum) => {
  const left = version.split('.').map(Number);
  const right = minimum.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if ((left[index] ?? 0) > (right[index] ?? 0)) return true;
    if ((left[index] ?? 0) < (right[index] ?? 0)) return false;
  }
  return true;
};

if (!atLeast(pkg.version, '1.11.11')) errors.push(`package version must preserve 1.11.11+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.11')) errors.push(`asset manifest release must preserve 1.11.11+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v11111'] !== 'node scripts/validate-v11111-upgrade.mjs') errors.push('v1.11.11 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11111')) errors.push('verify does not include v1.11.11 validator');

const requirements = {
  'src/game/combat/AutoCombatSessionLog.ts': [
    'export interface AutoCombatSessionSummary',
    'export class AutoCombatSessionLog',
    'recordManualIntervention',
    'bossPatternDodges',
  ],
  'src/game/combat/BossDodgeRules.ts': [
    "import bossDodgeRuleData from '../../data/boss-dodge-rules.json'",
    'BOSS_DODGE_RULE_VERSION',
    'bossDodgeRuleCatalog',
    'resolveBossDodgeDirection',
  ],
  'src/data/boss-dodge-rules.json': [
    'boss_cleave',
    'boss_nova',
    'boss_rupture',
  ],
  'src/game/combat/AutoBattleController.ts': [
    'readonly targetHpRatio?: number',
    'readonly driveRatio?: number',
    'readonly targetPatternId?: string',
    'target-finisher-save',
    'resolveBossDodgeRule',
  ],
  'src/scenes/BattleScene.ts': [
    'private readonly autoCombatLog = new AutoCombatSessionLog()',
    'this.autoCombatLog.recordTarget(',
    'this.autoCombatLog.recordAction(',
    'const autoAssist = this.autoCombatLog.snapshot()',
    'autoAssist,',
  ],
  'src/scenes/ResultScene.ts': [
    'readonly autoAssist?: AutoCombatSessionSummary',
    'AUTO ASSIST REPORT',
    'createAutoAssistReport()',
  ],
  'src/core/layout/MobileViewportController.ts': [
    'readonly platform?: MobilePlatform',
    'platform: this.detectPlatform()',
  ],
  'src/core/layout/BattleHudSafeArea.ts': [
    "readonly profile: 'ios' | 'android' | 'desktop'",
    "profile === 'ios' ? 14",
    "profile === 'android' ? 7",
  ],
  'src/core/input/JoystickCalibrationController.ts': [
    "const ORDER: readonly JoystickCalibrationMode[] = ['screen', 'invert-x', 'invert-y', 'reverse']",
    "this.value = isJoystickCalibrationMode(stored) ? stored : 'screen'",
    'export function applyJoystickCalibration(',
  ],
  'src/core/input/JoystickCalibrationController.test.ts': [
    "expect(controller.current).toBe('screen')",
    "expect(STORAGE_KEYS.joystickCalibration).toContain('.v2')",
  ],
  'src/app/brand.ts': [
    'joystickCalibration.v2',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.11 marker missing: ${marker}`);
}

for (const doc of [
  'docs/AUTO_COMBAT_SESSION_REPORT_v1.11.11.md',
  'docs/BOSS_DODGE_RULES_v1.11.11.md',
  'docs/COMPOSITE_AUTO_SKILL_v1.11.11.md',
  'docs/MOBILE_PLATFORM_SAFE_AREA_v1.11.11.md',
  'docs/PATCH_NOTES_v1.11.11.md',
  'docs/MOVEMENT_DIRECTION_HOTFIX_v1.11.11.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.11 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.11 upgrade: runtime and documentation contracts preserved across later README and UI revisions');
}
