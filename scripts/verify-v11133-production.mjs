import { readFile, stat } from 'node:fs/promises';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const failures = [];
const specs = [
  ['player-direction', 'public/assets/live/v17/atlases/player/player_direction_parts_v17.json', 'public/assets/live/v17/atlases/player/player_direction_parts_v17.webp', 32, 32, 131758],
  ['monster-body', 'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.json', 'public/assets/live/v17/atlases/monsters/monster_body_parts_v17.webp', 24, 24, 209430],
  ['boss-core', 'public/assets/live/v17/atlases/effects/boss_core_fx_v17.json', 'public/assets/live/v17/atlases/effects/boss_core_fx_v17.webp', 24, 5, 366868],
  ['ui', 'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.json', 'public/assets/live/v17/atlases/ui/premium_ui_icons_v17.webp', 24, 24, 244692],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes] of specs) {
  const atlas = await json(atlasPath); const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames || Object.keys(atlas.animations ?? {}).length !== animations || image.size !== bytes) failures.push(label);
}
const player = await json('public/assets/live/v17/production/PLAYER_DIRECTION_PARTS_V17.json');
const monster = await json('public/assets/live/v17/production/MONSTER_BODY_PARTS_V17.json');
const core = await json('public/assets/live/v17/production/BOSS_CORE_FX_V17.json');
const ui = await json('public/assets/live/v17/production/PREMIUM_UI_ICONS_V17.json');
if (!player.runtimeComposite && player.finalFullBodyHandPaintedAtlasComplete) failures.push('player completion contract');
if (!player.directionAwarePivot || !player.directionAwareOcclusion || player.directions.length !== 8) failures.push('player direction contract');
if (!monster.runtimeComposite || monster.finalFullBodyHandPaintedAtlasComplete || monster.families.length !== 4) failures.push('monster completion contract');
if (Object.values(core.states).reduce((a, b) => a + b, 0) !== 24 || core.gameplayTimingChanged || core.attackFootprintChanged) failures.push('boss core contract');
if (Object.values(ui.categories).reduce((a, b) => a + b, 0) !== 24 || ui.gameplayDataChanged) failures.push('UI contract');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.33 production: 104 raster frames, 85 animations, four v17 WebP Atlases, full-body final art still pending');
