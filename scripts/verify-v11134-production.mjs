import { readFile, stat } from 'node:fs/promises';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const failures = [];
const specs = [
  ['player-action', 'public/assets/live/v18/atlases/player/player_action_parts_v18.json', 'public/assets/live/v18/atlases/player/player_action_parts_v18.webp', 48, 24, 223776],
  ['monster-motion', 'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.json', 'public/assets/live/v18/atlases/monsters/monster_motion_parts_v18.webp', 32, 16, 288136],
  ['boss-core', 'public/assets/live/v18/atlases/effects/boss_core_fx_v18.json', 'public/assets/live/v18/atlases/effects/boss_core_fx_v18.webp', 30, 5, 301020],
  ['ui', 'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.json', 'public/assets/live/v18/atlases/ui/premium_ui_icons_v18.webp', 16, 16, 69584],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes] of specs) {
  const atlas = await json(atlasPath); const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames || Object.keys(atlas.animations ?? {}).length !== animations || image.size !== bytes) failures.push(label);
}
const player = await json('public/assets/live/v18/production/PLAYER_ACTION_PARTS_V18.json');
const monster = await json('public/assets/live/v18/production/MONSTER_MOTION_PARTS_V18.json');
const core = await json('public/assets/live/v18/production/BOSS_CORE_FX_V18.json');
const ui = await json('public/assets/live/v18/production/PREMIUM_UI_ICONS_V18.json');
if (!player.runtimeComposite || player.finalFullBodyHandPaintedAtlasComplete || player.directions.length !== 8 || player.attackFootprintChanged) failures.push('player completion contract');
if (!monster.runtimeComposite || monster.finalFullBodyHandPaintedAtlasComplete || monster.families.length !== 4 || monster.gameplayTimingChanged) failures.push('monster completion contract');
if (Object.values(core.states).reduce((a, b) => a + b, 0) !== 30 || core.gameplayTimingChanged || core.attackFootprintChanged) failures.push('boss core contract');
if (Object.values(ui.categories).reduce((a, b) => a + b, 0) !== 16 || ui.gameplayDataChanged) failures.push('UI contract');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.34 production: 126 raster frames, 61 animations, four v18 WebP Atlases, final full-body art still pending');
