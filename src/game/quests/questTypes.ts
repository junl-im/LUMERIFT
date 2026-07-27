export type QuestType = 'main' | 'daily';
export type QuestConditionType = 'clearStage' | 'clearAnyStage' | 'defeatMonster' | 'upgradeItem' | 'obtainItem';

export interface QuestCondition {
  readonly type: QuestConditionType;
  readonly targetId?: string;
  readonly count: number;
}

export interface QuestReward {
  readonly exp: number;
  readonly gold: number;
  readonly itemIds: readonly string[];
}

export interface QuestDefinition {
  readonly id: string;
  readonly type: QuestType;
  readonly title: string;
  readonly description: string;
  readonly prerequisiteQuestId?: string;
  readonly conditions: readonly QuestCondition[];
  readonly rewards: QuestReward;
}
