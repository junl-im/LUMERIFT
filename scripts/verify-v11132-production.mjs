import { readFile, stat } from 'node:fs/promises';
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const failures = [];
const specs = [
  ['player', 'public/assets/live/v16/atlases/player/player_parts_v16.json', 'public/assets/live/v16/atlases/player/player_parts_v16.webp', 16, 16, 120320],
  ['monster', 'public/assets/live/v16/atlases/monsters/monster_parts_v16.json', 'public/assets/live/v16/atlases/monsters/monster_parts_v16.webp', 16, 16, 151360],
  ['boss-core', 'public/assets/live/v16/atlases/effects/boss_core_fx_v16.json', 'public/assets/live/v16/atlases/effects/boss_core_fx_v16.webp', 12, 5, 87228],
  ['ui', 'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.json', 'public/assets/live/v16/atlases/ui/premium_ui_icons_v16.webp', 16, 16, 173434],
];
for (const [label, atlasPath, imagePath, frames, animations, bytes] of specs) {
  const atlas = await json(atlasPath);
  const image = await stat(imagePath);
  if (Object.keys(atlas.frames ?? {}).length !== frames || Object.keys(atlas.animations ?? {}).length !== animations || image.size !== bytes) failures.push(label);
}
const player = await json('public/assets/live/v16/production/PLAYER_PARTS_V16.json');
const monster = await json('public/assets/live/v16/production/MONSTER_PARTS_V16.json');
const core = await json('public/assets/live/v16/production/BOSS_CORE_FX_V16.json');
const ui = await json('public/assets/live/v16/production/PREMIUM_UI_ICONS_V16.json');
if (!player.runtimeComposite || player.finalFullBodyHandPaintedAtlasComplete) failures.push('player completion contract');
if (!monster.runtimeComposite || monster.finalFullBodyHandPaintedAtlasComplete) failures.push('monster completion contract');
if (core.states.join(',') !== 'shielded,fractured,shattered,regenerating,overdrive' || core.gameplayTimingChanged || core.attackFootprintChanged) failures.push('boss core contract');
if (ui.categories.skills !== 3 || ui.categories.itemGrades !== 4 || ui.categories.bossPatterns !== 5 || ui.gameplayDataChanged) failures.push('UI contract');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('PASS v1.11.32 production: 60 raster frames, 53 animations, four transparent WebP Atlases, final full-body Atlases pending');
