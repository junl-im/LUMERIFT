import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const errors = [];

if (pkg.version !== '1.11.4') errors.push(`package version must be 1.11.4: ${pkg.version}`);
if (manifest.release !== '1.11.4') errors.push(`asset manifest release must be 1.11.4: ${manifest.release}`);
if (pkg.scripts?.['validate:upgrade:v1114'] !== 'node scripts/validate-v1114-upgrade.mjs') errors.push('v1.11.4 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v1114')) errors.push('verify does not include v1.11.4 validator');

const requirements = {
  'src/core/input/JoystickCalibrationController.ts': [
    "export type JoystickCalibrationMode = 'screen' | 'reverse' | 'invert-x' | 'invert-y'",
    'apply(axis: Vec2)',
    "return { x: -axis.x, y: -axis.y }",
  ],
  'src/scenes/BattleScene.ts': [
    'joystickCalibration.apply(rawJoystick)',
    'spriteBaseScale: this.usingOwnedPlayerPreview || this.usingOwnedPaintedCandidate ? 1.36 : 1.12',
  ],
  'src/scenes/SettingsScene.ts': [
    '조이스틱 보정',
    'joystickCalibrationLabel',
    'STICK',
  ],
  'src/game/presentation/BattleActorView.ts': [
    'private readonly silhouetteGlow = new Graphics()',
    'private readonly focusHalo = new Graphics()',
    'drawCharacterPolish(',
    'this.sprite.tint = frame.overdrive ? 0xfff5c8 : 0xffffff',
  ],
  'src/ui/SceneChrome.ts': [
    '0xf8e7b5',
    '0xbfd0cf',
  ],
  'src/ui/UiSkin.ts': [
    'highlightAlpha = compact ? 0.14 : 0.22',
  ],
  'src/app/constants.ts': [
    'background: 0x07111a',
    'primaryBright: 0x92fff1',
  ],
  'src/app/GameApp.ts': [
    'new JoystickCalibrationController()',
    'joystickCalibration,',
  ],
  'src/app/AppContext.ts': [
    'readonly joystickCalibration: JoystickCalibrationController',
  ],
};
for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.4 marker missing: ${marker}`);
  if (source.includes('.polygon(')) errors.push(`${path}: PixiJS 8 incompatible Graphics.polygon call reintroduced`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.4 upgrade: joystick calibration, brighter refined UI, cleaner panels and player visual polish contracts');
}
