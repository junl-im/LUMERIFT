import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const pkg = await readJson('package.json');
const manifest = await readJson('public/assets/ASSET_MANIFEST.json');
const registry = await readJson('asset_registry/ASSET_REGISTRY.json');
const bossRules = await readJson('src/data/boss-dodge-rules.json');
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

if (!atLeast(pkg.version, '1.11.16')) errors.push(`package version must preserve 1.11.16+ contracts: ${pkg.version}`);
if (!atLeast(manifest.release, '1.11.16')) errors.push(`asset manifest release must preserve 1.11.16+ contracts: ${manifest.release}`);
if (!atLeast(registry.release, '1.11.16')) errors.push(`asset registry release must preserve 1.11.16+ contracts: ${registry.release}`);
if (pkg.scripts?.['validate:upgrade:v11116'] !== 'node scripts/validate-v11116-upgrade.mjs') errors.push('v1.11.16 validator script is not connected');
if (!pkg.scripts?.verify?.includes('npm run validate:upgrade:v11116')) errors.push('verify does not include v1.11.16 validator');

if (bossRules.version < 2) errors.push(`boss dodge data version must preserve visual metadata v2+: ${bossRules.version}`);
for (const rule of [bossRules.defaultRule, ...(bossRules.patterns ?? [])]) {
  if (!rule || typeof rule.hudIcon !== 'string') errors.push(`boss HUD icon missing: ${rule?.patternId ?? 'unknown'}`);
  for (const key of ['warningColor', 'dangerColor', 'criticalColor']) {
    if (!Number.isInteger(rule?.[key]) || rule[key] < 0 || rule[key] > 0xffffff) errors.push(`boss HUD color invalid: ${rule?.patternId ?? 'unknown'}/${key}`);
  }
  if (typeof rule?.safeMoveLabel !== 'string' || rule.safeMoveLabel.length < 4) errors.push(`boss safe move label missing: ${rule?.patternId ?? 'unknown'}`);
}

const requirements = {
  'src/game/combat/AutoCombatHistoryStore.ts': [
    "const STORAGE_KEY = 'lumerift.autoCombatHistory.v1'",
    'const MAX_ENTRIES = 18',
    'export class AutoCombatHistoryStore',
    'public record(',
    'public clear()',
  ],
  'src/game/presentation/AutoCombatHistoryAnalysis.ts': [
    'export function analyzeAutoCombatHistory',
    "const PRESETS: readonly BuiltInAutoBattlePreset[] = ['aggressive', 'balanced', 'conservative']",
    'averageManualInterventions',
  ],
  'src/scenes/AutoCombatHistoryScene.ts': [
    'export class AutoCombatHistoryScene',
    'PRESET PERFORMANCE',
    'RECENT SESSION LOG',
    'context.autoCombatHistory.clear()',
  ],
  'src/scenes/AutoPresetLabScene.ts': [
    "new AutoCombatHistoryScene()",
    '최근 전투 기록 분석',
    'context.autoCombatHistory.current.length',
  ],
  'src/app/AppContext.ts': [
    'readonly autoCombatHistory: AutoCombatHistoryStore',
  ],
  'src/app/GameApp.ts': [
    'const autoCombatHistory = new AutoCombatHistoryStore()',
    'autoCombatHistory,',
  ],
  'src/scenes/BattleScene.ts': [
    'this.context.autoCombatHistory.record({',
    'patternId: telegraph.pattern.id',
    'const threatColor = threat.accentColor',
  ],
  'src/game/presentation/DirectionalWeaponTrail.ts': [
    'export function resolveDirectionalWeaponTrail',
    'export function resolveDirectionalWeaponTrailFromAngle',
    'echoCount',
  ],
  'src/game/presentation/DirectionalAttackPose.ts': [
    'accentWidth',
    'accentEchoes',
    'accentLateralOffset',
    'resolveDirectionalWeaponTrail(input.direction)',
  ],
  'src/game/presentation/BattleVfxSystem.ts': [
    'trailProfile: DirectionalWeaponTrailProfile',
    'resolveDirectionalWeaponTrailFromAngle(rotation)',
    'profile.lengthMultiplier',
  ],
  'src/game/combat/BossDodgeRules.ts': [
    'readonly hudIcon: string',
    'readonly warningColor: number',
    'readonly safeMoveLabel: string',
  ],
  'src/game/presentation/BossThreatHud.ts': [
    'readonly accentColor: number',
    'resolveBossDodgeRule(input.patternId)',
    'rule.safeMoveLabel',
  ],
  'README.md': [
    '## v1.11.16 핵심 업데이트',
    'docs/AUTO_COMBAT_HISTORY_v1.11.16.md',
    'docs/DIRECTIONAL_WEAPON_TRAILS_v1.11.16.md',
    'docs/BOSS_HUD_DATA_v1.11.16.md',
    'docs/PATCH_NOTES_v1.11.16.md',
  ],
};

for (const [path, markers] of Object.entries(requirements)) {
  const source = await readFile(path, 'utf8');
  for (const marker of markers) if (!source.includes(marker)) errors.push(`${path}: v1.11.16 marker missing: ${marker}`);
}

for (const doc of [
  'docs/AUTO_COMBAT_HISTORY_v1.11.16.md',
  'docs/DIRECTIONAL_WEAPON_TRAILS_v1.11.16.md',
  'docs/BOSS_HUD_DATA_v1.11.16.md',
  'docs/PATCH_NOTES_v1.11.16.md',
  'docs/NEXT_UPDATE_v1.11.17.md',
]) {
  try { await readFile(doc, 'utf8'); }
  catch { errors.push(`missing v1.11.16 document: ${doc}`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.16 upgrade: local auto-combat history, preset analytics, boss HUD data v2, and eight-direction weapon trails');
}
