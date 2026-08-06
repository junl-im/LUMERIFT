import { readFile, stat } from 'node:fs/promises';

const errors = [];
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const contract = await readJson('public/assets/live/v22/production/INTEGRATED_VISUAL_REPLACEMENT_V22.json');
const state = await readJson('HANDOFF_STATE.json');
const release = await readJson('RELEASE_MANIFEST.json');
const catalog = await readFile('src/core/assets/AssetCatalog.ts', 'utf8');
const actor = await readFile('src/game/presentation/BattleActorView.ts', 'utf8');
const battle = await readFile('src/scenes/BattleScene.ts', 'utf8');
const wardrobe = await readFile('src/scenes/CharacterWardrobeScene.ts', 'utf8');
const replacement = await readFile('src/game/presentation/IntegratedVisualReplacementV22.ts', 'utf8');

if (contract.schema !== 'lumerift-integrated-visual-replacement-v22') errors.push('v22 contract schema mismatch');
if (contract.version !== '1.11.38') errors.push('v22 contract version mismatch');
if (!contract.defaultRuntimeReplacement || contract.oldOverlayStackDefaultEnabled) errors.push('v22 default replacement mode mismatch');
if (contract.finalHandPaintedFullBodyAtlasesComplete !== false) errors.push('final hand-painted truthfulness mismatch');
if (state.version !== '1.11.38' || release.version !== '1.11.38') errors.push('release metadata mismatch');

const specs = [
  ['public/assets/live/v22/atlases/player/player_reborn_body_v22.json', 648, 80],
  ['public/assets/live/v22/atlases/monsters/monsters_reborn_v22.json', 268, 66],
  ['public/assets/live/v22/atlases/effects/combat_effects_reborn_v22.json', 40, 5],
  ['public/assets/live/v22/atlases/ui/ui_reborn_v22.json', 30, 0],
];
for (const [path, frames, animations] of specs) {
  const atlas = await readJson(path);
  if (Object.keys(atlas.frames ?? {}).length !== frames) errors.push(`${path}: frame mismatch`);
  if (Object.keys(atlas.animations ?? {}).length !== animations) errors.push(`${path}: animation mismatch`);
  if (atlas.meta?.qualityStage !== 'production-candidate-unified-art-pass') errors.push(`${path}: quality stage mismatch`);
  const image = path.replace(/\.json$/, '.webp');
  try { if ((await stat(image)).size < 10_000) errors.push(`${image}: too small`); } catch { errors.push(`${image}: missing`); }
}
for (const path of [
  'public/assets/live/v22/backgrounds/title_reborn_v22.webp',
  'public/assets/live/v22/backgrounds/lobby_reborn_v22.webp',
  'public/assets/live/v22/portraits/hero_reborn_v22.webp',
  'public/assets/live/v22/portraits/hero_face_reborn_v22.webp',
  'public/assets/live/v22/portraits/monster_reborn_v22.webp',
  'public/assets/live/v22/portraits/boss_phase_1_reborn_v22.webp',
  'public/assets/live/v22/portraits/boss_phase_2_reborn_v22.webp',
  'public/assets/live/v22/portraits/boss_phase_3_reborn_v22.webp',
]) {
  try { if ((await stat(path)).size < 10_000) errors.push(`${path}: too small`); } catch { errors.push(`${path}: missing`); }
}
for (const marker of [
  'assets/live/v22/atlases/player/player_reborn_body_v22.json',
  'assets/live/v22/atlases/monsters/monsters_reborn_v22.json',
  'assets/live/v22/atlases/effects/combat_effects_reborn_v22.json',
  'assets/live/v22/atlases/ui/ui_reborn_v22.json',
  'integratedVisualReplacementV22Contract',
  "id: 'battle-chapter-1-v22'",
]) if (!catalog.includes(marker)) errors.push(`AssetCatalog missing ${marker}`);
if (!replacement.includes('oldBodyOverlayStackEnabled: false')) errors.push('v22 overlay disable contract missing');
if (!actor.includes('integratedVisualReplacement')) errors.push('actor integrated replacement flag missing');
if (!battle.includes('integratedVisualReplacementV22Enabled()')) errors.push('battle v22 runtime connection missing');
if (!wardrobe.includes('integratedVisualReplacementV22Enabled()')) errors.push('wardrobe v22 runtime connection missing');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS v1.11.38 integrated visual replacement: unified player, monsters, VFX, UI, title, lobby and portraits');
}
