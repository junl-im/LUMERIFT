import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';

const root = 'public/assets';
const errors = [];
let atlasCount = 0;
let frameCount = 0;
let animationCount = 0;

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (extname(entry.name).toLowerCase() !== '.json') continue;
    const raw = JSON.parse(await readFile(fullPath, 'utf8'));
    if (!raw.frames || !raw.meta?.image) continue;
    await validateAtlas(fullPath, raw);
  }
}

async function validateAtlas(atlasPath, atlas) {
  atlasCount += 1;
  const display = relative(process.cwd(), atlasPath);
  const imageName = atlas.meta?.image;
  const size = atlas.meta?.size;
  if (typeof imageName !== 'string') errors.push(`${display}: meta.image 누락`);
  if (!size || !Number.isFinite(size.w) || !Number.isFinite(size.h)) errors.push(`${display}: meta.size 누락`);
  if (imageName && !['.png', '.webp'].includes(extname(imageName).toLowerCase())) {
    errors.push(`${display}: Atlas 이미지 포맷 위반 ${imageName}`);
  }
  if (imageName) {
    try {
      const image = await stat(join(dirname(atlasPath), imageName));
      if (image.size <= 0) errors.push(`${display}: Atlas 이미지가 비어 있습니다.`);
    } catch {
      errors.push(`${display}: Atlas 이미지 파일 누락 ${imageName}`);
    }
  }

  const names = new Set(Object.keys(atlas.frames ?? {}));
  for (const [name, value] of Object.entries(atlas.frames ?? {})) {
    frameCount += 1;
    const frame = value?.frame;
    if (!frame) {
      errors.push(`${display}: 프레임 정보 누락 ${name}`);
      continue;
    }
    if (frame.x < 0 || frame.y < 0 || frame.w <= 0 || frame.h <= 0) errors.push(`${display}: 프레임 좌표 오류 ${name}`);
    if (size && (frame.x + frame.w > size.w || frame.y + frame.h > size.h)) errors.push(`${display}: 프레임 범위 초과 ${name}`);
  }

  for (const [animation, frames] of Object.entries(atlas.animations ?? {})) {
    animationCount += 1;
    if (!Array.isArray(frames) || frames.length === 0) errors.push(`${display}: 빈 애니메이션 ${animation}`);
    for (const name of frames ?? []) {
      if (!names.has(name)) errors.push(`${display}: 애니메이션 참조 누락 ${animation} -> ${name}`);
    }
  }
}


async function validateRequiredAnimations() {
  const player = JSON.parse(await readFile('public/assets/atlases/player/player_v1.json', 'utf8'));
  const monster = JSON.parse(await readFile('public/assets/atlases/monsters/monster_common_v1.json', 'utf8'));
  const ui = JSON.parse(await readFile('public/assets/atlases/ui/ui_skin_v1.json', 'utf8'));
  const effects = JSON.parse(await readFile('public/assets/atlases/effects/combat_effects_v1.json', 'utf8'));
  const equipment = JSON.parse(await readFile('public/assets/atlases/items/equipment_icons_v1.json', 'utf8'));
  const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  const playerStates = ['idle', 'run', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'hit', 'death', 'dodge'];
  const monsterRanks = ['normal', 'elite', 'boss'];
  const monsterStates = ['idle', 'move', 'attack', 'hit', 'die', 'roar'];
  const uiFrames = ['panel', 'button_primary', 'button_secondary', 'button_danger', 'slot', 'slot_rare', 'slot_heroic', 'skill_frame'];
  const effectStates = ['slash', 'nova', 'hit', 'explosion', 'dodge'];
  const equipmentFrames = [
    'weapon_rift_blade_common', 'armor_scout_common', 'accessory_lumen_common',
    'weapon_rift_blade_rare', 'armor_warden_rare', 'accessory_core_rare',
    'weapon_heir_heroic', 'armor_harbinger_heroic', 'accessory_rift_heroic',
  ];

  for (const state of playerStates) {
    for (const direction of directions) {
      const key = `player.${state}.${direction}`;
      const frames = player.animations?.[key];
      if (!Array.isArray(frames) || frames.length < 3) errors.push(`player atlas: 필수 애니메이션 누락 ${key}`);
    }
  }
  for (const rank of monsterRanks) {
    for (const state of monsterStates) {
      const key = `monster.${rank}.${state}`;
      const frames = monster.animations?.[key];
      if (!Array.isArray(frames) || frames.length < 3) errors.push(`monster atlas: 필수 애니메이션 누락 ${key}`);
    }
  }
  for (const frame of uiFrames) {
    if (!ui.frames?.[frame]) errors.push(`ui atlas: 필수 프레임 누락 ${frame}`);
  }
  for (const effect of effectStates) {
    const key = `effect.${effect}`;
    const frames = effects.animations?.[key];
    if (!Array.isArray(frames) || frames.length < 5) errors.push(`effects atlas: 필수 애니메이션 누락 ${key}`);
  }
  for (const itemId of equipmentFrames) {
    const key = `item.${itemId}`;
    if (!equipment.frames?.[key]) errors.push(`equipment atlas: 필수 프레임 누락 ${key}`);
  }

  const megaRequirements = [
    ['public/assets/atlases/items/mega_items_v1.json', 160, 0],
    ['public/assets/atlases/skills/skill_icons_v1.json', 80, 0],
    ['public/assets/atlases/status/status_icons_v1.json', 48, 0],
    ['public/assets/atlases/ui/ui_icons_v2.json', 96, 0],
    ['public/assets/atlases/bestiary/bestiary_portraits_v1.json', 48, 0],
    ['public/assets/atlases/npc/npc_portraits_v1.json', 32, 0],
    ['public/assets/atlases/environment/environment_props_v1.json', 120, 0],
    ['public/assets/atlases/effects/effects_mega_v1.json', 144, 24],
    ['public/assets/atlases/emblems/emblems_v1.json', 64, 0],
    ['public/assets/atlases/tutorial/tutorial_glyphs_v1.json', 40, 0],
  ];
  for (const [path, expectedFrames, expectedAnimations] of megaRequirements) {
    const atlas = JSON.parse(await readFile(path, 'utf8'));
    const actualFrames = Object.keys(atlas.frames ?? {}).length;
    const actualAnimations = Object.keys(atlas.animations ?? {}).length;
    if (actualFrames !== expectedFrames) errors.push(`${path}: 프레임 ${actualFrames} != ${expectedFrames}`);
    if (actualAnimations !== expectedAnimations) errors.push(`${path}: 애니메이션 ${actualAnimations} != ${expectedAnimations}`);
  }
}

await walk(root);
await validateRequiredAnimations();
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS atlas policy: ${atlasCount} atlases, ${frameCount} frames, ${animationCount} animations`);
}
