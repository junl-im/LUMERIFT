import { readFile, stat } from 'node:fs/promises';

const errors = [];
const summary = JSON.parse(await readFile('public/assets/LIVE_ART_V100_SUMMARY.json', 'utf8'));
const licenses = JSON.parse(await readFile('public/assets/live/v1/licenses/ASSET_LICENSES.json', 'utf8'));
const catalog = await readFile('src/core/assets/AssetCatalog.ts', 'utf8');
const actorView = await readFile('src/game/presentation/BattleActorView.ts', 'utf8');

if (summary.release !== '1.0.0') errors.push(`live art release mismatch: ${summary.release}`);
if (summary.qualityStage !== 'production-candidate-open-art-pass') errors.push(`live art stage mismatch: ${summary.qualityStage}`);
if ((summary.runtimeBytes ?? 0) < 4_000_000) errors.push('실사용 런타임 아트가 4 MB 미만입니다.');
if (!Array.isArray(licenses.assets) || licenses.assets.length < 8) errors.push('제3자 에셋 라이선스 기록이 부족합니다.');

const expected = [
  'public/assets/live/v1/atlases/player/player_live_v1.json',
  'public/assets/live/v1/atlases/player/player_live_v1.webp',
  'public/assets/live/v1/atlases/monsters/monsters_live_v1.json',
  'public/assets/live/v1/atlases/monsters/monsters_live_v1.webp',
  'public/assets/live/v1/atlases/ui/ui_live_v1.json',
  'public/assets/live/v1/atlases/ui/ui_live_v1.webp',
  'public/assets/live/v1/backgrounds/lobby_forest_live_v1.webp',
  'public/assets/live/v1/backgrounds/battle_forest_live_v1.webp',
  'public/assets/live/v1/portraits/hero_live_v1.webp',
  'public/assets/live/v1/portraits/boss_harbinger_live_v1.webp',
  'docs/THIRD_PARTY_ASSETS.md',
  'docs/previews/v1.0.0_lobby_preview.webp',
  'docs/previews/v1.0.0_battle_preview.webp',
];
for (const path of expected) {
  try {
    const info = await stat(path);
    if (info.size < 128) errors.push(`${path}: 파일이 지나치게 작습니다.`);
  } catch {
    errors.push(`${path}: 필수 실사용 아트 누락`);
  }
}

for (const fragment of [
  "assets/live/v1/atlases/ui/ui_live_v1.json",
  "assets/live/v1/atlases/player/player_live_v1.json",
  "assets/live/v1/atlases/monsters/monsters_live_v1.json",
  "assets/live/v1/backgrounds/battle_forest_live_v1.webp",
]) {
  if (!catalog.includes(fragment)) errors.push(`AssetCatalog 기본 경로가 실사용 아트를 가리키지 않습니다: ${fragment}`);
}
if (!actorView.includes('monster.${this.definition.combat.id}')) errors.push('몬스터 종별 실사용 애니메이션 키 연결이 없습니다.');
if (actorView.includes('this.sprite.tint = visual.bodyColor')) errors.push('실사용 몬스터 원화에 임의 tint가 적용되어 있습니다.');

const player = JSON.parse(await readFile('public/assets/live/v1/atlases/player/player_live_v1.json', 'utf8'));
const monsters = JSON.parse(await readFile('public/assets/live/v1/atlases/monsters/monsters_live_v1.json', 'utf8'));
const monsterIds = ['monster_crawler','monster_brute','monster_wisp','monster_spitter','monster_shade','monster_warden','monster_mender','boss_harbinger'];
for (const id of monsterIds) {
  for (const state of ['idle','move','attack','hit','die','roar']) {
    const key = `monster.${id}.${state}`;
    if (!Array.isArray(monsters.animations?.[key]) || monsters.animations[key].length < 2) errors.push(`몬스터 실사용 애니메이션 누락: ${key}`);
  }
}
for (const state of ['idle','run','attack1','attack2','attack3','skill1','skill2','hit','death','dodge']) {
  const key = `player.${state}.s`;
  if (!Array.isArray(player.animations?.[key]) || player.animations[key].length < 3) errors.push(`플레이어 실사용 애니메이션 누락: ${key}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS live art: ${summary.runtimeFiles} runtime files, ${(summary.runtimeBytes / 1_000_000).toFixed(2)} MB, ${licenses.assets.length} licensed source groups`);
}
