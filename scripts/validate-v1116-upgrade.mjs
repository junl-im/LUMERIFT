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

if (!atLeast(pkg.version, '1.11.6')) errors.push(`package version must preserve 1.11.6+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.6')) errors.push(`asset manifest release must preserve 1.11.6+ contracts: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1116'] !== 'node scripts/validate-v1116-upgrade.mjs') errors.push('v1.11.6 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1116')) errors.push('verify does not include v1.11.6 validator');

const requirements = {
  'src/game/presentation/BattleActorView.ts': [
    'private readonly directionRibbon = new Graphics()',
    'private readonly stepHighlights = new Graphics()',
    'private smoothedFacing: Vec2 = { x: 0, y: -1 }',
    'const facing = blendFacing(this.smoothedFacing, controller.facing',
    'this.drawMotionLayers(controller, facing, motion.auraAlpha, motion.auraRadius, motion.trailAlpha, motion.trailLength, frame.overdrive);',
    '.ellipse(-facing.x * 7, 2 + Math.abs(facing.x) * 1.6, 13 * scaleX, 8 * scaleY)',
    'const diagonalWeight = direction.length === 2 ? 1 : 0.78;',
  ],
  'src/game/presentation/PlayerMotionDirector.ts': [
    'const locomotion = Math.sin(progress * Math.PI * 2);',
    'const shoulderRhythm = Math.sin(progress * Math.PI * 4 + Math.PI / 5);',
    'trailAlpha = 0.09 * intensity;',
    'trailLength = 20;',
  ],
  'src/game/presentation/PlayerMotionDirector.test.ts': [
    "it('gives moving state a readable natural locomotion profile'",
  ],
  'README.md': [
    'docs/EIGHT_DIRECTION_POLISH_v1.11.6.md',
    'docs/PATCH_NOTES_v1.11.6.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.6 marker missing: ${marker}`);
}

for (const doc of [
  'docs/EIGHT_DIRECTION_POLISH_v1.11.6.md',
  'docs/PATCH_NOTES_v1.11.6.md',
]) {
  try {
    await readFile(doc, 'utf8');
  } catch {
    errors.push(`missing v1.11.6 document: ${doc}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.6 upgrade: smoother 8-direction facing blend, richer locomotion silhouette, and added movement readability polish');
}
