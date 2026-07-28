import { readFile, stat } from 'node:fs/promises';

const errors = [];
const summary = JSON.parse(await readFile('public/assets/LIVE_ART_V170_SUMMARY.json', 'utf8'));
const licenses = JSON.parse(await readFile('public/assets/live/v1/licenses/ASSET_LICENSES.json', 'utf8'));
const catalog = await readFile('src/core/assets/AssetCatalog.ts', 'utf8');
const battleScene = await readFile('src/scenes/BattleScene.ts', 'utf8');
const actorView = await readFile('src/game/presentation/BattleActorView.ts', 'utf8');
const visualProfile = await readFile('src/game/presentation/StageVisualProfile.ts', 'utf8');

if (summary.release !== '1.7.0') errors.push(`live art release mismatch: ${summary.release}`);
if (summary.qualityStage !== 'production-candidate-unified-art-pass') errors.push(`live art stage mismatch: ${summary.qualityStage}`);
if ((summary.runtimeBytes ?? 0) < 4_000_000) errors.push('v1.7 실사용 런타임 아트가 4 MB 미만입니다.');
if (!Array.isArray(licenses.assets) || licenses.assets.length < 8) errors.push('제3자 에셋 라이선스 기록이 부족합니다.');

const expected = [
  'public/assets/live/v4/atlases/player/player_live_v4.json',
  'public/assets/live/v4/atlases/player/player_live_v4.webp',
  'public/assets/live/v4/atlases/monsters/monsters_live_v4.json',
  'public/assets/live/v4/atlases/monsters/monsters_live_v4.webp',
  'public/assets/live/v4/atlases/effects/combat_effects_v4.json',
  'public/assets/live/v4/atlases/effects/combat_effects_v4.webp',
  'public/assets/live/v5/atlases/ui/ui_luminous_v5.json',
  'public/assets/live/v5/atlases/ui/ui_luminous_v5.webp',
  'public/assets/live/v5/atlases/ui/ui_icons_v5.json',
  'public/assets/live/v5/atlases/ui/ui_icons_v5.webp',
  'public/assets/live/v5/backgrounds/title_screen_v5.webp',
  'public/assets/live/v4/backgrounds/lobby_forest_v4.webp',
  'public/assets/live/v4/backgrounds/forest_approach_v4.webp',
  'public/assets/live/v4/backgrounds/forest_ruins_v4.webp',
  'public/assets/live/v4/backgrounds/forest_depths_v4.webp',
  'public/assets/live/v4/backgrounds/rift_core_v4.webp',
  'public/assets/live/v4/portraits/hero_v4.webp',
  'public/assets/live/v4/portraits/boss_phase_1_v4.webp',
  'public/assets/live/v4/portraits/boss_phase_2_v4.webp',
  'public/assets/live/v4/portraits/boss_phase_3_v4.webp',
  'docs/THIRD_PARTY_ASSETS.md',
  'docs/ART_UNIFICATION_v1.7.0.md',
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
  'assets/live/v4/atlases/player/player_live_v4.json',
  'assets/live/v4/atlases/monsters/monsters_live_v4.json',
  'assets/live/v4/atlases/effects/combat_effects_v4.json',
  'assets/live/v4/backgrounds/forest_approach_v4.webp',
  'assets/live/v4/backgrounds/rift_core_v4.webp',
  'assets/live/v4/portraits/boss_phase_3_v4.webp',
]) {
  if (!catalog.includes(fragment)) errors.push(`AssetCatalog 기본 경로가 v1.7 아트를 가리키지 않습니다: ${fragment}`);
}
if (!battleScene.includes('resolveStageVisualProfile')) errors.push('스테이지별 비주얼 프로필 연결이 없습니다.');
if (!battleScene.includes('updateBossPortrait')) errors.push('보스 페이즈 초상 전환이 없습니다.');
if (!visualProfile.includes("tier: 'core'")) errors.push('Chapter 1 core 비주얼 티어가 없습니다.');
if (!actorView.includes('monster.${this.definition.combat.id}')) errors.push('몬스터 종별 실사용 애니메이션 키 연결이 없습니다.');
if (actorView.includes('this.sprite.tint = visual.bodyColor')) errors.push('실사용 몬스터 원화에 임의 tint가 적용되어 있습니다.');

const player = JSON.parse(await readFile('public/assets/live/v4/atlases/player/player_live_v4.json', 'utf8'));
const monsters = JSON.parse(await readFile('public/assets/live/v4/atlases/monsters/monsters_live_v4.json', 'utf8'));
const effects = JSON.parse(await readFile('public/assets/live/v4/atlases/effects/combat_effects_v4.json', 'utf8'));
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
for (const effect of ['slash','nova','hit','explosion','dodge']) {
  const key = `effect.${effect}`;
  if (!Array.isArray(effects.animations?.[key]) || effects.animations[key].length < 8) errors.push(`v1.7 VFX 애니메이션 누락: ${key}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS live art v1.7: ${summary.runtimeFiles} files, ${(summary.runtimeBytes / 1_000_000).toFixed(2)} MB, 4 battle tiers, 3 boss phases`);
}
