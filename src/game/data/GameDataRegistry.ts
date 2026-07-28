import actionData from '../../data/actions.json';
import itemData from '../../data/items.json';
import monsterData from '../../data/monsters.json';
import questData from '../../data/quests.json';
import playerData from '../../data/player.json';
import stageData from '../../data/stages.json';
import type {
  CombatActionConfig,
  CombatActionKind,
  CombatImpactTier,
  HitShape,
  MonsterDefinition,
  MonsterPatternConfig,
  MonsterRank,
  MonsterTargetMode,
  PlayerCombatConfig,
  StageConfig,
  StageNodeType,
  StatusEffectApplication,
  StatusEffectId,
} from '../combat/combatData';
import type { EquipmentSlot, ItemDefinition, ItemGrade } from '../items/itemTypes';
import type { QuestConditionType, QuestDefinition, QuestType } from '../quests/questTypes';

type UnknownRecord = Record<string, unknown>;

const ACTION_KINDS = new Set<CombatActionKind>(['basic', 'skill1', 'skill2']);
const IMPACT_TIERS = new Set<CombatImpactTier>(['light', 'heavy', 'ultimate']);
const HIT_SHAPES = new Set<HitShape>(['arc', 'circle']);
const STATUS_IDS = new Set<StatusEffectId>(['burn', 'slow']);
const MONSTER_RANKS = new Set<MonsterRank>(['normal', 'elite', 'boss']);
const TARGET_MODES = new Set<MonsterTargetMode>(['self', 'playerLocked']);
const EQUIPMENT_SLOTS = new Set<EquipmentSlot>(['weapon', 'armor', 'accessory']);
const ITEM_GRADES = new Set<ItemGrade>(['common', 'rare', 'heroic']);
const STAGE_NODE_TYPES = new Set<StageNodeType>(['normal', 'elite', 'boss']);
const QUEST_TYPES = new Set<QuestType>(['main', 'daily']);
const QUEST_CONDITION_TYPES = new Set<QuestConditionType>(['clearStage', 'clearAnyStage', 'defeatMonster', 'upgradeItem', 'obtainItem']);

export class GameDataValidationError extends Error {
  public constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'GameDataValidationError';
  }
}

export class GameDataRegistry {
  private readonly actions = new Map<string, CombatActionConfig>();
  private readonly monsters = new Map<string, MonsterDefinition>();
  private readonly items = new Map<string, ItemDefinition>();
  private readonly stages = new Map<string, StageConfig>();
  private readonly quests = new Map<string, QuestDefinition>();
  public readonly player: PlayerCombatConfig;

  public constructor(raw: {
    readonly actions: unknown;
    readonly player: unknown;
    readonly monsters: unknown;
    readonly items: unknown;
    readonly stages: unknown;
    readonly quests: unknown;
  } = {
    actions: actionData,
    player: playerData,
    monsters: monsterData,
    items: itemData,
    stages: stageData,
    quests: questData,
  }) {
    this.loadActions(raw.actions);
    this.player = this.loadPlayer(raw.player);
    this.loadMonsters(raw.monsters);
    this.loadItems(raw.items);
    this.loadStages(raw.stages);
    this.loadQuests(raw.quests);
  }

  public getAction(id: string): CombatActionConfig {
    const action = this.actions.get(id);
    if (!action) throw new GameDataValidationError(`actions.${id}`, '등록되지 않은 액션입니다.');
    return action;
  }

  public getMonster(id: string): MonsterDefinition {
    const monster = this.monsters.get(id);
    if (!monster) throw new GameDataValidationError(`monsters.${id}`, '등록되지 않은 몬스터입니다.');
    return monster;
  }

  public getItem(id: string): ItemDefinition {
    const item = this.items.get(id);
    if (!item) throw new GameDataValidationError(`items.${id}`, '등록되지 않은 아이템입니다.');
    return item;
  }

  public get itemIds(): readonly string[] {
    return [...this.items.keys()];
  }

  public getStage(id: string): StageConfig {
    const stage = this.stages.get(id);
    if (!stage) throw new GameDataValidationError(`stages.${id}`, '등록되지 않은 스테이지입니다.');
    return stage;
  }

  public get stageIds(): readonly string[] {
    return [...this.stages.values()].sort((left, right) => left.order - right.order).map((stage) => stage.id);
  }

  public get stagesInOrder(): readonly StageConfig[] {
    return [...this.stages.values()].sort((left, right) => left.order - right.order);
  }

  public getQuest(id: string): QuestDefinition {
    const quest = this.quests.get(id);
    if (!quest) throw new GameDataValidationError(`quests.${id}`, '등록되지 않은 퀘스트입니다.');
    return quest;
  }

  public get questsInOrder(): readonly QuestDefinition[] {
    return [...this.quests.values()];
  }

  private loadActions(raw: unknown): void {
    const root = asRecord(raw, 'actions');
    expectVersion(root, 'actions');
    const records = asArray(root.actions, 'actions.actions');

    records.forEach((item, index) => {
      const path = `actions.actions[${index}]`;
      const record = asRecord(item, path);
      const id = asString(record.id, `${path}.id`);
      ensureUnique(this.actions, id, `${path}.id`);
      const kind = asEnum(record.kind, ACTION_KINDS, `${path}.kind`);
      const hitShape = asEnum(record.hitShape, HIT_SHAPES, `${path}.hitShape`);
      const statusEffect = record.statusEffect === undefined
        ? undefined
        : parseStatusEffect(record.statusEffect, `${path}.statusEffect`);

      this.actions.set(id, Object.freeze({
        id,
        label: asString(record.label, `${path}.label`),
        kind,
        duration: asPositive(record.duration, `${path}.duration`),
        hitTime: asNonNegative(record.hitTime, `${path}.hitTime`),
        damageMultiplier: asPositive(record.damageMultiplier, `${path}.damageMultiplier`),
        range: asPositive(record.range, `${path}.range`),
        halfAngleRadians: degrees(asNumber(record.halfAngleDegrees, `${path}.halfAngleDegrees`)),
        hitShape,
        cooldown: asNonNegative(record.cooldown, `${path}.cooldown`),
        hitStop: asNonNegative(record.hitStop, `${path}.hitStop`),
        shake: asNonNegative(record.shake, `${path}.shake`),
        lungeDistance: asNonNegative(record.lungeDistance, `${path}.lungeDistance`),
        effectColor: asColor(record.effectColor, `${path}.effectColor`),
        impactTier: asEnum(record.impactTier, IMPACT_TIERS, `${path}.impactTier`),
        driveGain: asNonNegative(record.driveGain, `${path}.driveGain`),
        driveCost: asNonNegative(record.driveCost, `${path}.driveCost`),
        comboWindow: asPositive(record.comboWindow, `${path}.comboWindow`),
        ...(statusEffect ? { statusEffect } : {}),
      }));
    });

    if (this.actions.size === 0) throw new GameDataValidationError('actions.actions', '최소 1개 액션이 필요합니다.');
  }

  private loadPlayer(raw: unknown): PlayerCombatConfig {
    const root = asRecord(raw, 'player');
    expectVersion(root, 'player');
    const record = asRecord(root.player, 'player.player');
    const dodge = asRecord(record.dodge, 'player.player.dodge');
    const comboIds = asArray(record.comboActionIds, 'player.player.comboActionIds')
      .map((value, index) => asString(value, `player.player.comboActionIds[${index}]`));
    const skills = asRecord(record.skills, 'player.player.skills');
    const skill1 = this.getAction(asString(skills.skill1, 'player.player.skills.skill1'));
    const skill2 = this.getAction(asString(skills.skill2, 'player.player.skills.skill2'));
    const combo = comboIds.map((id) => this.getAction(id));

    if (combo.some((action) => action.kind !== 'basic')) {
      throw new GameDataValidationError('player.player.comboActionIds', '기본 공격만 등록할 수 있습니다.');
    }
    if (skill1.kind !== 'skill1' || skill2.kind !== 'skill2') {
      throw new GameDataValidationError('player.player.skills', '스킬 슬롯과 액션 종류가 일치하지 않습니다.');
    }

    return Object.freeze({
      id: asString(record.id, 'player.player.id'),
      name: asString(record.name, 'player.player.name'),
      maxHp: asPositive(record.maxHp, 'player.player.maxHp'),
      attack: asPositive(record.attack, 'player.player.attack'),
      defense: asNonNegative(record.defense, 'player.player.defense'),
      moveSpeed: asPositive(record.moveSpeed, 'player.player.moveSpeed'),
      radius: asPositive(record.radius, 'player.player.radius'),
      hitRecovery: asNonNegative(record.hitRecovery, 'player.player.hitRecovery'),
      dodge: Object.freeze({
        duration: asPositive(dodge.duration, 'player.player.dodge.duration'),
        speed: asPositive(dodge.speed, 'player.player.dodge.speed'),
        cooldown: asNonNegative(dodge.cooldown, 'player.player.dodge.cooldown'),
        invulnerability: asNonNegative(dodge.invulnerability, 'player.player.dodge.invulnerability'),
      }),
      combo: Object.freeze(combo),
      skills: Object.freeze({ skill1, skill2 }),
    });
  }

  private loadMonsters(raw: unknown): void {
    const root = asRecord(raw, 'monsters');
    expectVersion(root, 'monsters');
    const records = asArray(root.monsters, 'monsters.monsters');

    records.forEach((item, index) => {
      const path = `monsters.monsters[${index}]`;
      const record = asRecord(item, path);
      const id = asString(record.id, `${path}.id`);
      ensureUnique(this.monsters, id, `${path}.id`);
      const rank = asEnum(record.rank, MONSTER_RANKS, `${path}.rank`);
      const combat = asRecord(record.combat, `${path}.combat`);
      const visual = asRecord(record.visual, `${path}.visual`);
      const patterns = asArray(record.patterns, `${path}.patterns`)
        .map((pattern, patternIndex) => parsePattern(pattern, `${path}.patterns[${patternIndex}]`));

      if (patterns.length === 0) throw new GameDataValidationError(`${path}.patterns`, '최소 1개 패턴이 필요합니다.');
      if (rank === 'boss' && patterns.length < 3) {
        throw new GameDataValidationError(`${path}.patterns`, '보스는 최소 3개 패턴이 필요합니다.');
      }

      this.monsters.set(id, Object.freeze({
        combat: Object.freeze({
          id,
          name: asString(record.name, `${path}.name`),
          rank,
          maxHp: asPositive(combat.maxHp, `${path}.combat.maxHp`),
          attack: asPositive(combat.attack, `${path}.combat.attack`),
          defense: asNonNegative(combat.defense, `${path}.combat.defense`),
          radius: asPositive(combat.radius, `${path}.combat.radius`),
          moveSpeed: asPositive(combat.moveSpeed, `${path}.combat.moveSpeed`),
          detectionRange: asPositive(combat.detectionRange, `${path}.combat.detectionRange`),
          hitRecovery: asNonNegative(combat.hitRecovery, `${path}.combat.hitRecovery`),
          statusDurationMultiplier: asRange(combat.statusDurationMultiplier, 0, 1, `${path}.combat.statusDurationMultiplier`),
          patterns: Object.freeze(patterns),
        }),
        visual: Object.freeze({
          bodyColor: asColor(visual.bodyColor, `${path}.visual.bodyColor`),
          accentColor: asColor(visual.accentColor, `${path}.visual.accentColor`),
          eyeColor: asColor(visual.eyeColor, `${path}.visual.eyeColor`),
        }),
      }));
    });
  }

  private loadItems(raw: unknown): void {
    const root = asRecord(raw, 'items');
    expectVersion(root, 'items');
    const records = asArray(root.items, 'items.items');

    records.forEach((item, index) => {
      const path = `items.items[${index}]`;
      const record = asRecord(item, path);
      const id = asString(record.id, `${path}.id`);
      ensureUnique(this.items, id, `${path}.id`);
      const stats = asRecord(record.baseStats, `${path}.baseStats`);

      this.items.set(id, Object.freeze({
        id,
        name: asString(record.name, `${path}.name`),
        slot: asEnum(record.slot, EQUIPMENT_SLOTS, `${path}.slot`),
        grade: asEnum(record.grade, ITEM_GRADES, `${path}.grade`),
        baseStats: Object.freeze({
          attack: asNonNegative(stats.attack, `${path}.baseStats.attack`),
          defense: asNonNegative(stats.defense, `${path}.baseStats.defense`),
          maxHp: asNonNegative(stats.maxHp, `${path}.baseStats.maxHp`),
        }),
        sellPrice: asNonNegative(record.sellPrice, `${path}.sellPrice`),
        upgradeBaseCost: asPositive(record.upgradeBaseCost, `${path}.upgradeBaseCost`),
        maxUpgrade: asPositiveInteger(record.maxUpgrade, `${path}.maxUpgrade`),
      }));
    });

    if (this.items.size === 0) throw new GameDataValidationError('items.items', '최소 1개 아이템이 필요합니다.');
  }

  private loadStages(raw: unknown): void {
    const root = asRecord(raw, 'stages');
    expectVersion(root, 'stages', 2);
    const records = asArray(root.stages, 'stages.stages');
    const orders = new Set<number>();

    records.forEach((item, index) => {
      const path = `stages.stages[${index}]`;
      const record = asRecord(item, path);
      const id = asString(record.id, `${path}.id`);
      ensureUnique(this.stages, id, `${path}.id`);
      const order = asPositiveInteger(record.order, `${path}.order`);
      if (orders.has(order)) throw new GameDataValidationError(`${path}.order`, `중복 순서입니다: ${order}`);
      orders.add(order);
      const spawn = asRecord(record.playerSpawn, `${path}.playerSpawn`);
      const rewards = asRecord(record.rewards, `${path}.rewards`);
      const firstClear = asRecord(rewards.firstClear, `${path}.rewards.firstClear`);
      const firstClearItems = asArray(firstClear.itemIds, `${path}.rewards.firstClear.itemIds`)
        .map((value, itemIndex) => {
          const itemId = asString(value, `${path}.rewards.firstClear.itemIds[${itemIndex}]`);
          this.getItem(itemId);
          return itemId;
        });
      const waves = asArray(record.waves, `${path}.waves`).map((waveItem, waveIndex) => {
        const wavePath = `${path}.waves[${waveIndex}]`;
        const wave = asRecord(waveItem, wavePath);
        const enemies = asArray(wave.enemies, `${wavePath}.enemies`).map((enemyItem, enemyIndex) => {
          const enemyPath = `${wavePath}.enemies[${enemyIndex}]`;
          const enemy = asRecord(enemyItem, enemyPath);
          const monsterId = asString(enemy.monsterId, `${enemyPath}.monsterId`);
          this.getMonster(monsterId);
          return Object.freeze({
            monsterId,
            x: asNumber(enemy.x, `${enemyPath}.x`),
            y: asNumber(enemy.y, `${enemyPath}.y`),
          });
        });
        if (enemies.length === 0) throw new GameDataValidationError(`${wavePath}.enemies`, '웨이브에 적이 필요합니다.');
        return Object.freeze({
          id: asString(wave.id, `${wavePath}.id`),
          label: asString(wave.label, `${wavePath}.label`),
          spawnDelay: asNonNegative(wave.spawnDelay, `${wavePath}.spawnDelay`),
          enemies: Object.freeze(enemies),
        });
      });
      if (waves.length === 0) throw new GameDataValidationError(`${path}.waves`, '최소 1개 웨이브가 필요합니다.');

      const dropTable = asArray(rewards.dropTable, `${path}.rewards.dropTable`).map((dropItem, dropIndex) => {
        const dropPath = `${path}.rewards.dropTable[${dropIndex}]`;
        const drop = asRecord(dropItem, dropPath);
        const itemId = asString(drop.itemId, `${dropPath}.itemId`);
        this.getItem(itemId);
        return Object.freeze({
          itemId,
          chance: asRange(drop.chance, 0, 1, `${dropPath}.chance`),
        });
      });
      const previousStageId = record.previousStageId === null || record.previousStageId === undefined
        ? undefined
        : asString(record.previousStageId, `${path}.previousStageId`);

      this.stages.set(id, Object.freeze({
        id,
        order,
        label: asString(record.label, `${path}.label`),
        areaName: asString(record.areaName, `${path}.areaName`),
        description: asString(record.description, `${path}.description`),
        nodeType: asEnum(record.nodeType, STAGE_NODE_TYPES, `${path}.nodeType`),
        recommendedPower: asNonNegative(record.recommendedPower, `${path}.recommendedPower`),
        ...(previousStageId ? { previousStageId } : {}),
        playerSpawn: Object.freeze({
          x: asNumber(spawn.x, `${path}.playerSpawn.x`),
          y: asNumber(spawn.y, `${path}.playerSpawn.y`),
        }),
        rewards: Object.freeze({
          exp: asNonNegative(rewards.exp, `${path}.rewards.exp`),
          gold: asNonNegative(rewards.gold, `${path}.rewards.gold`),
          firstClear: Object.freeze({
            exp: asNonNegative(firstClear.exp, `${path}.rewards.firstClear.exp`),
            gold: asNonNegative(firstClear.gold, `${path}.rewards.firstClear.gold`),
            itemIds: Object.freeze(firstClearItems),
          }),
          dropTable: Object.freeze(dropTable),
        }),
        waves: Object.freeze(waves),
      }));
    });

    for (const stage of this.stages.values()) {
      if (stage.previousStageId && !this.stages.has(stage.previousStageId)) {
        throw new GameDataValidationError(`stages.${stage.id}.previousStageId`, '이전 스테이지가 존재하지 않습니다.');
      }
    }
    if (this.stages.size < 10) throw new GameDataValidationError('stages.stages', 'MVP 스테이지 10개가 필요합니다.');
  }

  private loadQuests(raw: unknown): void {
    const root = asRecord(raw, 'quests');
    expectVersion(root, 'quests');
    const records = asArray(root.quests, 'quests.quests');

    records.forEach((item, index) => {
      const path = `quests.quests[${index}]`;
      const record = asRecord(item, path);
      const id = asString(record.id, `${path}.id`);
      ensureUnique(this.quests, id, `${path}.id`);
      const type = asEnum(record.type, QUEST_TYPES, `${path}.type`);
      const prerequisiteQuestId = record.prerequisiteQuestId === undefined
        ? undefined
        : asString(record.prerequisiteQuestId, `${path}.prerequisiteQuestId`);
      const conditions = asArray(record.conditions, `${path}.conditions`).map((value, conditionIndex) => {
        const conditionPath = `${path}.conditions[${conditionIndex}]`;
        const condition = asRecord(value, conditionPath);
        const conditionType = asEnum(condition.type, QUEST_CONDITION_TYPES, `${conditionPath}.type`);
        const targetId = condition.targetId === undefined
          ? undefined
          : asString(condition.targetId, `${conditionPath}.targetId`);
        if (conditionType === 'clearStage') {
          if (!targetId) throw new GameDataValidationError(`${conditionPath}.targetId`, '스테이지 ID가 필요합니다.');
          this.getStage(targetId);
        }
        return Object.freeze({
          type: conditionType,
          ...(targetId ? { targetId } : {}),
          count: asPositiveInteger(condition.count, `${conditionPath}.count`),
        });
      });
      if (conditions.length === 0) throw new GameDataValidationError(`${path}.conditions`, '최소 1개 조건이 필요합니다.');
      const reward = asRecord(record.rewards, `${path}.rewards`);
      const itemIds = asArray(reward.itemIds, `${path}.rewards.itemIds`).map((value, itemIndex) => {
        const itemId = asString(value, `${path}.rewards.itemIds[${itemIndex}]`);
        this.getItem(itemId);
        return itemId;
      });

      this.quests.set(id, Object.freeze({
        id,
        type,
        title: asString(record.title, `${path}.title`),
        description: asString(record.description, `${path}.description`),
        ...(prerequisiteQuestId ? { prerequisiteQuestId } : {}),
        conditions: Object.freeze(conditions),
        rewards: Object.freeze({
          exp: asNonNegative(reward.exp, `${path}.rewards.exp`),
          gold: asNonNegative(reward.gold, `${path}.rewards.gold`),
          itemIds: Object.freeze(itemIds),
        }),
      }));
    });

    for (const quest of this.quests.values()) {
      if (quest.prerequisiteQuestId && !this.quests.has(quest.prerequisiteQuestId)) {
        throw new GameDataValidationError(`quests.${quest.id}.prerequisiteQuestId`, '선행 퀘스트가 존재하지 않습니다.');
      }
    }
  }

}

function parsePattern(value: unknown, path: string): MonsterPatternConfig {
  const record = asRecord(value, path);
  return Object.freeze({
    id: asString(record.id, `${path}.id`),
    label: asString(record.label, `${path}.label`),
    shape: asEnum(record.shape, HIT_SHAPES, `${path}.shape`),
    targetMode: asEnum(record.targetMode, TARGET_MODES, `${path}.targetMode`),
    damageMultiplier: asPositive(record.damageMultiplier, `${path}.damageMultiplier`),
    range: asPositive(record.range, `${path}.range`),
    triggerRange: asPositive(record.triggerRange, `${path}.triggerRange`),
    halfAngleRadians: degrees(asNumber(record.halfAngleDegrees, `${path}.halfAngleDegrees`)),
    cooldown: asNonNegative(record.cooldown, `${path}.cooldown`),
    windup: asNonNegative(record.windup, `${path}.windup`),
    duration: asPositive(record.duration, `${path}.duration`),
    effectColor: asColor(record.effectColor, `${path}.effectColor`),
  });
}

function parseStatusEffect(value: unknown, path: string): StatusEffectApplication {
  const record = asRecord(value, path);
  const id = asEnum(record.id, STATUS_IDS, `${path}.id`);
  return Object.freeze({
    id,
    chance: asRange(record.chance, 0, 1, `${path}.chance`),
    duration: asPositive(record.duration, `${path}.duration`),
    potency: asPositive(record.potency, `${path}.potency`),
    ...(record.tickInterval === undefined
      ? {}
      : { tickInterval: asPositive(record.tickInterval, `${path}.tickInterval`) }),
  });
}

function asRecord(value: unknown, path: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GameDataValidationError(path, '객체가 필요합니다.');
  }
  return value as UnknownRecord;
}

function asArray(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new GameDataValidationError(path, '배열이 필요합니다.');
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new GameDataValidationError(path, '비어 있지 않은 문자열이 필요합니다.');
  }
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new GameDataValidationError(path, '유한한 숫자가 필요합니다.');
  }
  return value;
}

function asPositive(value: unknown, path: string): number {
  const number = asNumber(value, path);
  if (number <= 0) throw new GameDataValidationError(path, '0보다 커야 합니다.');
  return number;
}

function asNonNegative(value: unknown, path: string): number {
  const number = asNumber(value, path);
  if (number < 0) throw new GameDataValidationError(path, '0 이상이어야 합니다.');
  return number;
}

function asPositiveInteger(value: unknown, path: string): number {
  const number = asPositive(value, path);
  if (!Number.isInteger(number)) throw new GameDataValidationError(path, '양의 정수가 필요합니다.');
  return number;
}

function asRange(value: unknown, min: number, max: number, path: string): number {
  const number = asNumber(value, path);
  if (number < min || number > max) {
    throw new GameDataValidationError(path, `${min} 이상 ${max} 이하여야 합니다.`);
  }
  return number;
}

function asEnum<T extends string>(value: unknown, allowed: ReadonlySet<T>, path: string): T {
  const item = asString(value, path) as T;
  if (!allowed.has(item)) throw new GameDataValidationError(path, `허용되지 않은 값입니다: ${item}`);
  return item;
}

function asColor(value: unknown, path: string): number {
  const color = asString(value, path);
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new GameDataValidationError(path, '#RRGGBB 색상 형식이 필요합니다.');
  }
  return Number.parseInt(color.slice(1), 16);
}

function expectVersion(record: UnknownRecord, path: string, version = 1): void {
  if (record.version !== version) {
    throw new GameDataValidationError(`${path}.version`, `지원 버전은 ${version}입니다.`);
  }
}

function ensureUnique<T>(map: ReadonlyMap<string, T>, id: string, path: string): void {
  if (map.has(id)) throw new GameDataValidationError(path, `중복 ID입니다: ${id}`);
}

function degrees(value: number): number {
  return value * Math.PI / 180;
}
