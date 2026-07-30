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

if (!atLeast(pkg.version, '1.11.9')) errors.push(`package version must preserve 1.11.9+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.9')) errors.push(`asset manifest release must preserve 1.11.9+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1119'] !== 'node scripts/validate-v1119-upgrade.mjs') errors.push('v1.11.9 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1119')) errors.push('verify does not include v1.11.9 validator');

const requirements = {
  'src/core/input/CombatAssistController.ts': [
    "export type AutoSkillHpRule = 'always' | 'below-85' | 'below-65' | 'emergency'",
    "export type BossDodgePolicy = 'all' | 'critical-only' | 'off'",
    "export type ManualResumeDelay = 'instant' | 'brief' | 'delayed'",
    'cycleAutoSkillHpRule()',
    'cycleBossDodgePolicy()',
    'cycleManualResumeDelay()',
    'manualResumeDelaySeconds',
  ],
  'src/game/combat/AutoTargetController.ts': [
    'export interface AutoTargetScoreBreakdown',
    'targetScoreDetails(',
    "reason: keepCurrent && selected.candidate.id !== best.candidate.id ? 'lock-stability'",
    'autoTargetReasonLabel',
  ],
  'src/game/combat/AutoBattleController.ts': [
    'readonly autoSkillHpRule: AutoSkillHpRule',
    'readonly bossDodgePolicy: BossDodgePolicy',
    'boss-critical-evade',
    'skill-hp-gated',
    'autoBattleReasonLabel',
  ],
  'src/core/layout/BattleHudSafeArea.ts': [
    'export interface BattleHudSafeAreaLayout',
    'keyboardOpen',
    'controlScale',
  ],
  'src/game/presentation/DirectionalAttackPose.ts': [
    'export interface DirectionalAttackPose',
    'resolveDirectionalAttackPose',
    'accentLength',
  ],
  'src/game/presentation/BattleActorView.ts': [
    'private readonly attackPoseAccent = new Graphics()',
    'resolveDirectionalAttackPose({',
    'drawAttackPoseAccent(',
  ],
  'src/scenes/BattleScene.ts': [
    'manualOverrideRemaining',
    'AUTO · ${this.lastAssistReason}',
    'SCORE ${Math.round(snapshot.score)}',
    'applyHudSafeArea(force = false)',
    'autoSkillHpRule: settings.autoSkillHpRule',
    'bossDodgePolicy: settings.bossDodgePolicy',
  ],
  'src/scenes/SettingsScene.ts': [
    '스킬 HP 조건',
    '보스 자동 회피 정책',
    'manualResumeDelayLabel(settings.manualResumeDelay)',
    'context.combatAssist.cycleManualResumeDelay()',
    'ASSIST MATRIX',
  ],
  'README.md': [
    '## v1.11.9 핵심',
    'docs/AUTO_COMBAT_DIAGNOSTICS_v1.11.9.md',
    'docs/MOBILE_SAFE_AREA_v1.11.9.md',
    'docs/DIRECTIONAL_ATTACK_POSE_v1.11.9.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.9 marker missing: ${marker}`);
}

for (const doc of [
  'docs/AUTO_COMBAT_DIAGNOSTICS_v1.11.9.md',
  'docs/MOBILE_SAFE_AREA_v1.11.9.md',
  'docs/DIRECTIONAL_ATTACK_POSE_v1.11.9.md',
  'docs/PATCH_NOTES_v1.11.9.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.9 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.9 upgrade: auto diagnostics, hp/boss assist policies, mobile safe area, and directional attack pose');
}
