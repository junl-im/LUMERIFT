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

if (!atLeast(pkg.version, '1.11.7')) errors.push(`package version must preserve 1.11.7+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.7')) errors.push(`asset manifest release must preserve 1.11.7+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1117'] !== 'node scripts/validate-v1117-upgrade.mjs') errors.push('v1.11.7 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1117')) errors.push('verify does not include v1.11.7 validator');

const requirements = {
  'src/core/input/CombatAssistController.ts': [
    'autoTarget: true',
    'autoBattle: false',
    'toggleAutoTarget()',
    'toggleAutoBattle()',
    'export type AutoTargetPriority',
  ],
  'src/game/combat/AutoTargetController.ts': [
    'export class AutoTargetController',
    'switchHysteresis',
    'rankBonus',
    'telegraphBonus',
  ],
  'src/game/combat/AutoBattleController.ts': [
    "export type AutoBattleAction = 'none' | 'attack' | 'skill1' | 'skill2' | 'dodge'",
    "reason: 'telegraph-evade'",
    "'manual-override'",
    "reason: 'queue-combo'",
  ],
  'src/scenes/BattleScene.ts': [
    'private readonly autoTargetController = new AutoTargetController()',
    'private updateAutoTargeting(): void {',
    'private resolveCombatAssist(manualMove: Vec2, deltaSeconds: number, manualAction: boolean): Vec2 {',
    'TARGET ·',
    'AUTO ·',
    'LOCK SIGNAL',
  ],
  'src/ui/InterfaceChrome.ts': [
    'export function createInterfaceBackdrop',
    'export function createInterfaceStamp',
    'RIFT INTERFACE',
  ],
  'src/scenes/BootScene.ts': [
    'FIRST AWAKENING',
    'createInterfaceBackdrop',
  ],
  'src/scenes/LoginScene.ts': [
    'ACCOUNT GATE',
    '계승 기록으로 계속',
  ],
  'src/scenes/LobbyScene.ts': [
    'COMMAND HUB',
    'createInterfaceBackdrop',
  ],
  'src/scenes/SettingsScene.ts': [
    '자동 타겟',
    '자동 전투',
  ],
  'README.md': [
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.7 marker missing: ${marker}`);
}

for (const doc of [
  'docs/AUTO_TARGET_AUTO_BATTLE_v1.11.7.md',
  'docs/FULL_INTERFACE_RENEWAL_v1.11.7.md',
  'docs/PATCH_NOTES_v1.11.7.md',
]) {
  try {
    await readFile(doc, 'utf8');
  } catch {
    errors.push(`missing v1.11.7 document: ${doc}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.7 upgrade: persistent auto target, opt-in auto battle, manual override safety, and first-start interface renewal');
}
