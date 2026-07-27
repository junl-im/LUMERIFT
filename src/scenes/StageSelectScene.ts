import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import type { StageConfig } from '../game/combat/combatData';
import { calculateTotalPower, ensureStarterInventory } from '../game/items/inventoryLogic';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { UiButton } from '../ui/UiButton';
import { BattleScene } from './BattleScene';
import { LobbyScene } from './LobbyScene';

export class StageSelectScene implements Scene {
  public readonly view = new Container();
  private profile?: PlayerProfile;

  public constructor(private readonly selectedStageId?: string) {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const loaded = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    this.profile = ensureStarterInventory(loaded, context.gameData);
    await context.playerRepository.save(this.profile);

    const stages = context.gameData.stagesInOrder;
    const selected = this.resolveSelected(stages);
    const power = calculateTotalPower(context.gameData.player, this.profile, context.gameData);
    const clearCount = Object.values(this.profile.stageProgress).filter((entry) => entry.clearCount > 0).length;

    this.view.addChild(createBackground('루멘 숲 작전도', '잠금을 해제하고 10개 스테이지를 순서대로 정화하세요.'));
    this.view.addChild(createPanel(20, 180, 500, 682));

    const summary = new Text({
      text: `진행 ${clearCount} / ${stages.length}  ·  전투력 ${power}  ·  최고 개방 1-${Math.min(this.profile.highestStage, stages.length)}`,
      style: new TextStyle({ fill: COLORS.text, fontSize: 16, fontWeight: '600' }),
    });
    summary.anchor.set(0.5);
    summary.position.set(DESIGN_WIDTH / 2, 207);
    this.view.addChild(summary);

    stages.forEach((stage, index) => {
      const unlocked = this.isUnlocked(stage);
      const progress = this.profile?.stageProgress[stage.id];
      const mark = progress?.clearCount ? `✓ ${progress.clearCount}회` : unlocked ? '도전 가능' : '잠김';
      const button = new UiButton({
        label: `${nodeMark(stage)} ${stage.label}\n${mark}`,
        width: 232,
        height: 62,
        tone: selected.id === stage.id ? 'primary' : 'secondary',
        fontSize: 13,
        lineHeight: 17,
        onPress: async () => context.scenes.change(() => new StageSelectScene(stage.id)),
      });
      const column = index % 2;
      const row = Math.floor(index / 2);
      button.position.set(28 + column * 252, 238 + row * 70);
      this.view.addChild(button);
    });

    this.createDetails(context, selected, power);

    const back = new UiButton({
      label: '거점으로',
      width: 150,
      height: 54,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(28, 882);

    const start = new UiButton({
      label: power < selected.recommendedPower ? '도전 시작 · 전투력 부족' : '도전 시작',
      width: 330,
      height: 54,
      onPress: async () => context.scenes.change(() => new BattleScene(selected.id)),
    });
    start.position.set(182, 882);
    start.setEnabled(this.isUnlocked(selected));
    this.view.addChild(back, start);
  }

  public exit(): void {}
  public update(): void {}

  private createDetails(context: AppContext, stage: StageConfig, power: number): void {
    const profile = this.profile;
    if (!profile) return;
    const progress = profile.stageProgress[stage.id];
    const firstItems = stage.rewards.firstClear.itemIds.map((itemId) => context.gameData.getItem(itemId).name);
    const firstReward = [
      `EXP ${stage.rewards.firstClear.exp}`,
      `${stage.rewards.firstClear.gold}G`,
      ...firstItems,
    ].join(' · ');
    const detailPanel = new Graphics()
      .roundRect(28, 602, 484, 258, 20)
      .fill({ color: COLORS.panelStrong, alpha: 0.98 })
      .stroke({ color: nodeColor(stage), alpha: 0.45, width: 2 });
    const title = new Text({
      text: `${stage.label}  ·  권장 전투력 ${stage.recommendedPower}`,
      style: new TextStyle({ fill: nodeColor(stage), fontSize: 21, fontWeight: '700' }),
    });
    title.position.set(45, 620);
    const description = new Text({
      text: stage.description,
      style: new TextStyle({ fill: COLORS.text, fontSize: 15, wordWrap: true, wordWrapWidth: 440, lineHeight: 22 }),
    });
    description.position.set(45, 657);
    const info = new Text({
      text: [
        `일반 보상  EXP ${stage.rewards.exp} · ${stage.rewards.gold}G`,
        `최초 보상  ${progress?.firstClearReceived ? '수령 완료' : firstReward}`,
        `최고 기록  ${progress?.bestSeconds ? `${progress.bestSeconds}초` : '-'}  ·  클리어 ${progress?.clearCount ?? 0}회`,
        power >= stage.recommendedPower ? '현재 전투력: 적정' : `현재 전투력: ${stage.recommendedPower - power} 부족`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 14, lineHeight: 24 }),
    });
    info.position.set(45, 710);
    this.view.addChild(detailPanel, title, description, info);
  }

  private resolveSelected(stages: readonly StageConfig[]): StageConfig {
    const requested = this.selectedStageId && stages.find((stage) => stage.id === this.selectedStageId);
    if (requested) return requested;
    const order = Math.min(this.profile?.highestStage ?? 1, stages.length);
    return stages.find((stage) => stage.order === order) ?? stages[0]!;
  }

  private isUnlocked(stage: StageConfig): boolean {
    return stage.order <= (this.profile?.highestStage ?? 1);
  }
}

function nodeMark(stage: StageConfig): string {
  if (stage.nodeType === 'boss') return 'BOSS';
  if (stage.nodeType === 'elite') return 'ELITE';
  return 'STAGE';
}

function nodeColor(stage: StageConfig): number {
  if (stage.nodeType === 'boss') return COLORS.danger;
  if (stage.nodeType === 'elite') return COLORS.warning;
  return COLORS.primaryBright;
}
