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
  if (imageName && !['.png', '.webp'].includes(extname(imageName).toLowerCase())) errors.push(`${display}: Atlas 이미지 포맷 위반 ${imageName}`);
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
    if (!frame) { errors.push(`${display}: 프레임 정보 누락 ${name}`); continue; }
    if (frame.x < 0 || frame.y < 0 || frame.w <= 0 || frame.h <= 0) errors.push(`${display}: 프레임 좌표 오류 ${name}`);
    if (size && (frame.x + frame.w > size.w || frame.y + frame.h > size.h)) errors.push(`${display}: 프레임 범위 초과 ${name}`);
  }
  for (const [animation, frames] of Object.entries(atlas.animations ?? {})) {
    animationCount += 1;
    if (!Array.isArray(frames) || frames.length === 0) errors.push(`${display}: 빈 애니메이션 ${animation}`);
    for (const name of frames ?? []) if (!names.has(name)) errors.push(`${display}: 애니메이션 참조 누락 ${animation} -> ${name}`);
  }
}

async function validateRequiredAnimations() {
  const player = JSON.parse(await readFile('public/assets/live/v4/atlases/player/player_live_v4.json', 'utf8'));
  const monsters = JSON.parse(await readFile('public/assets/live/v4/atlases/monsters/monsters_live_v4.json', 'utf8'));
  const ui = JSON.parse(await readFile('public/assets/live/v5/atlases/ui/ui_luminous_v5.json', 'utf8'));
  const effects = JSON.parse(await readFile('public/assets/live/v4/atlases/effects/combat_effects_v4.json', 'utf8'));
  const uiIcons = JSON.parse(await readFile('public/assets/live/v5/atlases/ui/ui_icons_v5.json', 'utf8'));
  const equipment = JSON.parse(await readFile('public/assets/atlases/items/equipment_icons_v1.json', 'utf8'));
  const playerStates = ['idle','run','attack1','attack2','attack3','skill1','skill2','hit','death','dodge'];
  for (const state of playerStates) {
    const key = `player.${state}.s`;
    const frames = player.animations?.[key];
    if (!Array.isArray(frames) || frames.length < 3) errors.push(`player live atlas: 필수 애니메이션 누락 ${key}`);
  }
  const monsterIds = ['monster_crawler','monster_brute','monster_wisp','monster_spitter','monster_shade','monster_warden','monster_mender','boss_harbinger'];
  for (const id of monsterIds) for (const state of ['idle','move','attack','hit','die','roar']) {
    const key = `monster.${id}.${state}`;
    const frames = monsters.animations?.[key];
    if (!Array.isArray(frames) || frames.length < 2) errors.push(`monster live atlas: 필수 애니메이션 누락 ${key}`);
  }
  for (const frame of ['panel','panel_strong','panel_gold','panel_glass','button_primary','button_secondary','button_danger','slot','slot_rare','slot_heroic','skill_frame','nav_active','nav_idle']) {
    if (!ui.frames?.[frame]) errors.push(`ui v1.9 atlas: 필수 프레임 누락 ${frame}`);
  }
  for (const frame of ['play','account','guest','notice','settings','terms','stage','equipment','inventory','quest','mail','attendance','ranking','home','cloud','recovery']) {
    if (!uiIcons.frames?.[frame]) errors.push(`ui icon v1.9 atlas: 필수 프레임 누락 ${frame}`);
  }
  for (const effect of ['slash','nova','hit','explosion','dodge']) {
    const key = `effect.${effect}`;
    const frames = effects.animations?.[key];
    if (!Array.isArray(frames) || frames.length < 8) errors.push(`effects atlas: 필수 애니메이션 누락 ${key}`);
  }
  for (const itemId of [
    'weapon_rift_blade_common','armor_scout_common','accessory_lumen_common',
    'weapon_rift_blade_rare','armor_warden_rare','accessory_core_rare',
    'weapon_heir_heroic','armor_harbinger_heroic','accessory_rift_heroic',
  ]) if (!equipment.frames?.[`item.${itemId}`]) errors.push(`equipment atlas: 필수 프레임 누락 item.${itemId}`);
  const operations = JSON.parse(await readFile('public/assets/live/v3/atlases/operations/operations_ui_v3.json', 'utf8'));
  for (const frame of ['notice_bell','attendance_calendar','mail_envelope','coupon_seal','reward_chest','reward_gold','reward_crystal','reward_essence','status_claimed','status_locked']) {
    if (!operations.frames?.[frame]) errors.push(`operations atlas: 필수 프레임 누락 ${frame}`);
  }
}

await walk(root);
await validateRequiredAnimations();
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS active atlas policy: ${atlasCount} atlases, ${frameCount} frames, ${animationCount} animations`);
}
