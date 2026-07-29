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

if (!atLeast(pkg.version, '1.11.5')) errors.push(`package version must preserve 1.11.5+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.5')) errors.push(`asset manifest release must preserve 1.11.5+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1115'] !== 'node scripts/validate-v1115-upgrade.mjs') errors.push('v1.11.5 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1115')) errors.push('verify does not include v1.11.5 validator');

const requirements = {
  'src/scenes/BattleScene.ts': [
    'private readonly directionArrow = new Graphics()',
    'private readonly attackTelemetryText = new Text({',
    'private readonly hitFeedbackPanel = new Container()',
    'private updateCombatTelemetry(player: PlayerCombatController): void {',
    'private presentHitFeedback(headline: string, subline: string, critical: boolean): void {',
    "'CRITICAL RUSH'",
    'ATTACK VECTOR',
    '`CRIT\\n${amount}`',
  ],
  'src/ui/VirtualJoystick.ts': [
    'private readonly headingNeedle = new Graphics()',
    'const diagonal = spoke * 0.72',
  ],
  'src/ui/CombatActionButton.ts': [
    "text: options.tone === 'secondary' ? 'SKILL' : options.label === '회피' ? 'DODGE' : 'ACTION'",
    'const flare = new Graphics()',
  ],
  'src/ui/UiButton.ts': [
    'const stickerShadow = new Graphics()',
    'const topSheen = new Graphics()',
  ],
  'src/ui/UiSkin.ts': [
    'function addPanelComicAccent(',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.5 marker missing: ${marker}`);
}

for (const doc of [
  'docs/WEBTOON_UI_DIRECTION_v1.11.5.md',
  'docs/COMBAT_HUD_REWORK_v1.11.5.md',
  'docs/HIT_FEEDBACK_DIRECTION_REVIEW_v1.11.5.md',
  'docs/PATCH_NOTES_v1.11.5.md',
]) {
  try {
    await readFile(doc, 'utf8');
  } catch {
    errors.push(`missing v1.11.5 document: ${doc}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.5 upgrade: webtoon-clean HUD redesign, direction telemetry, richer hit feedback, and UI presentation refresh');
}
