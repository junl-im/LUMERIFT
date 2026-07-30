import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const actions = await readJson('src/data/actions.json');
const player = await readJson('src/data/player.json');
const monsters = await readJson('src/data/monsters.json');
const items = await readJson('src/data/items.json');
const stages = await readJson('src/data/stages.json');
const quests = await readJson('src/data/quests.json');
const bossDodgeRules = await readJson('src/data/boss-dodge-rules.json');
const errors = [];

const actionIds = new Set();
for (const [index, action] of actions.actions.entries()) {
  if (actionIds.has(action.id)) errors.push(`중복 액션 ID: ${action.id}`);
  actionIds.add(action.id);
  if (!/^#[0-9a-fA-F]{6}$/.test(action.effectColor)) {
    errors.push(`잘못된 액션 색상: actions[${index}].effectColor`);
  }
  if (!['light', 'heavy', 'ultimate'].includes(action.impactTier)) {
    errors.push(`액션 충격 등급 오류: actions[${index}].impactTier`);
  }
  if (typeof action.driveGain !== 'number' || action.driveGain < 0) {
    errors.push(`액션 Drive 획득량 오류: actions[${index}].driveGain`);
  }
  if (typeof action.driveCost !== 'number' || action.driveCost < 0 || action.driveCost > 100) {
    errors.push(`액션 Drive 비용 오류: actions[${index}].driveCost`);
  }
  if (typeof action.comboWindow !== 'number' || action.comboWindow <= 0 || action.comboWindow > 1.5) {
    errors.push(`액션 콤보 윈도 오류: actions[${index}].comboWindow`);
  }
}
for (const id of player.player.comboActionIds) {
  if (!actionIds.has(id)) errors.push(`플레이어 콤보 액션 누락: ${id}`);
}
for (const id of Object.values(player.player.skills)) {
  if (!actionIds.has(id)) errors.push(`플레이어 스킬 액션 누락: ${id}`);
}

const monsterIds = new Set();
const ranks = { normal: 0, elite: 0, boss: 0 };
for (const [index, monster] of monsters.monsters.entries()) {
  if (monsterIds.has(monster.id)) errors.push(`중복 몬스터 ID: ${monster.id}`);
  monsterIds.add(monster.id);
  if (monster.rank in ranks) ranks[monster.rank] += 1;
  if (!Array.isArray(monster.patterns) || monster.patterns.length === 0) {
    errors.push(`몬스터 패턴 누락: monsters[${index}]`);
  }
  if (monster.rank === 'boss' && monster.patterns.length < 3) {
    errors.push(`보스 패턴 3개 미만: ${monster.id}`);
  }
}
if (ranks.normal < 5 || ranks.elite < 2 || ranks.boss < 1) {
  errors.push(`MVP 몬스터 수량 부족: normal ${ranks.normal}, elite ${ranks.elite}, boss ${ranks.boss}`);
}


const bossPatternIds = new Set(
  monsters.monsters
    .filter((monster) => monster.rank === 'boss')
    .flatMap((monster) => monster.patterns.map((pattern) => pattern.id)),
);
if (bossDodgeRules.version !== 1) errors.push(`보스 회피 규칙 버전 오류: ${bossDodgeRules.version}`);
if (!bossDodgeRules.defaultRule || typeof bossDodgeRules.defaultRule.triggerProgress !== 'number') {
  errors.push('보스 회피 기본 규칙 누락');
}
const dodgeRuleIds = new Set();
for (const rule of bossDodgeRules.patterns ?? []) {
  if (dodgeRuleIds.has(rule.patternId)) errors.push(`중복 보스 회피 규칙: ${rule.patternId}`);
  dodgeRuleIds.add(rule.patternId);
  if (!bossPatternIds.has(rule.patternId)) errors.push(`보스 패턴 참조 누락: ${rule.patternId}`);
  if (typeof rule.triggerProgress !== 'number' || rule.triggerProgress < 0 || rule.triggerProgress > 1) {
    errors.push(`보스 회피 시점 오류: ${rule.patternId}`);
  }
  if (!['perpendicular', 'away', 'diagonal'].includes(rule.directionMode)) {
    errors.push(`보스 회피 방향 오류: ${rule.patternId}/${rule.directionMode}`);
  }
}
for (const patternId of bossPatternIds) {
  if (!dodgeRuleIds.has(patternId)) errors.push(`보스 회피 규칙 누락: ${patternId}`);
}

const itemIds = new Set();
for (const item of items.items) {
  if (itemIds.has(item.id)) errors.push(`중복 아이템 ID: ${item.id}`);
  itemIds.add(item.id);
  if (!['weapon', 'armor', 'accessory'].includes(item.slot)) errors.push(`장비 부위 오류: ${item.id}`);
  if (!['common', 'rare', 'heroic'].includes(item.grade)) errors.push(`장비 등급 오류: ${item.id}`);
}

if (stages.version !== 2) errors.push(`스테이지 버전 오류: ${stages.version}`);
const stageIds = new Set();
const stageOrders = new Set();
for (const stage of stages.stages) {
  if (stageIds.has(stage.id)) errors.push(`중복 스테이지 ID: ${stage.id}`);
  if (stageOrders.has(stage.order)) errors.push(`중복 스테이지 순서: ${stage.order}`);
  stageIds.add(stage.id);
  stageOrders.add(stage.order);
  if (!['normal', 'elite', 'boss'].includes(stage.nodeType)) errors.push(`스테이지 유형 오류: ${stage.id}`);
  if (!Array.isArray(stage.waves) || stage.waves.length === 0) errors.push(`웨이브 누락: ${stage.id}`);
  for (const wave of stage.waves) {
    for (const enemy of wave.enemies) {
      if (!monsterIds.has(enemy.monsterId)) {
        errors.push(`스테이지 몬스터 참조 누락: ${stage.id}/${wave.id}/${enemy.monsterId}`);
      }
    }
  }
  for (const drop of stage.rewards.dropTable ?? []) {
    if (!itemIds.has(drop.itemId)) errors.push(`스테이지 아이템 참조 누락: ${stage.id}/${drop.itemId}`);
    if (typeof drop.chance !== 'number' || drop.chance < 0 || drop.chance > 1) {
      errors.push(`드롭 확률 오류: ${stage.id}/${drop.itemId}`);
    }
  }
  for (const itemId of stage.rewards.firstClear?.itemIds ?? []) {
    if (!itemIds.has(itemId)) errors.push(`최초 보상 아이템 참조 누락: ${stage.id}/${itemId}`);
  }
}
if (stageIds.size !== 10) errors.push(`MVP 스테이지는 정확히 10개여야 합니다: ${stageIds.size}`);
for (const stage of stages.stages) {
  if (stage.previousStageId && !stageIds.has(stage.previousStageId)) {
    errors.push(`이전 스테이지 참조 누락: ${stage.id}/${stage.previousStageId}`);
  }
}

const questIds = new Set();
for (const quest of quests.quests) {
  if (questIds.has(quest.id)) errors.push(`중복 퀘스트 ID: ${quest.id}`);
  questIds.add(quest.id);
  if (!['main', 'daily'].includes(quest.type)) errors.push(`퀘스트 유형 오류: ${quest.id}`);
  if (!Array.isArray(quest.conditions) || quest.conditions.length === 0) errors.push(`퀘스트 조건 누락: ${quest.id}`);
  for (const condition of quest.conditions ?? []) {
    if (!['clearStage', 'clearAnyStage', 'defeatMonster', 'upgradeItem', 'obtainItem'].includes(condition.type)) {
      errors.push(`퀘스트 조건 유형 오류: ${quest.id}/${condition.type}`);
    }
    if (condition.type === 'clearStage' && !stageIds.has(condition.targetId)) {
      errors.push(`퀘스트 스테이지 참조 누락: ${quest.id}/${condition.targetId}`);
    }
  }
  for (const itemId of quest.rewards?.itemIds ?? []) {
    if (!itemIds.has(itemId)) errors.push(`퀘스트 아이템 참조 누락: ${quest.id}/${itemId}`);
  }
}
for (const quest of quests.quests) {
  if (quest.prerequisiteQuestId && !questIds.has(quest.prerequisiteQuestId)) {
    errors.push(`선행 퀘스트 참조 누락: ${quest.id}/${quest.prerequisiteQuestId}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS game data: ${actionIds.size} actions, ${monsterIds.size} monsters, ${itemIds.size} items, ${stageIds.size} stages, ${questIds.size} quests, ${dodgeRuleIds.size} boss dodge rules`);
}
