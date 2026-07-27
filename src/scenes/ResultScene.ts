import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createDivider, createMetric, createSectionPanel } from '../ui/PremiumUi';
import { getUiTexture } from '../ui/UiSkin';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { BattleScene } from './BattleScene';
import { InventoryScene } from './InventoryScene';
import { StageSelectScene } from './StageSelectScene';

export interface BattleOutcome {
  readonly victory: boolean;
  readonly stageId: string;
  readonly stageLabel: string;
  readonly nextStageId?: string;
  readonly firstClear: boolean;
  readonly exp: number;
  readonly gold: number;
  readonly itemDrops: readonly string[];
  readonly defeated: number;
  readonly maxCombo: number;
  readonly clearSeconds: number;
}

const DEFAULT_OUTCOME: BattleOutcome = {
  victory: true,
  stageId: 'stage_001',
  stageLabel: '1-1 깨어난 균열',
  nextStageId: 'stage_002',
  firstClear: true,
  exp: 340,
  gold: 605,
  itemDrops: ['weapon_rift_blade_common'],
  defeated: 4,
  maxCombo: 3,
  clearSeconds: 60,
};

export class ResultScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly outcome: BattleOutcome = DEFAULT_OUTCOME) {}

  public enter(context: AppContext): void {
    const title = this.outcome.victory ? '균열 안정화 완료' : '작전 실패';
    const subtitle = this.outcome.victory
      ? `${this.outcome.stageLabel}${this.outcome.firstClear ? ' · 최초 클리어' : ''}`
      : `${this.outcome.stageLabel} · 장비와 회피 타이밍을 정비하세요.`;
    this.view.addChild(createBackground(title, subtitle));
    this.view.addChild(createPanel(28, 154, 484, 686));

    this.createRank();
    this.createMetrics();
    this.createRewards(context);
    this.createActions(context);
  }

  public exit(): void {}
  public update(): void {}

  private createRank(): void {
    const rankPanel = createSectionPanel(48, 174, 444, 214, this.outcome.victory ? 'panel_gold' : 'panel_strong');
    const texture = getUiTexture('medal');
    if (texture) {
      const medal = new Sprite(texture);
      medal.anchor.set(0.5);
      medal.width = 160;
      medal.height = 160;
      medal.position.set(DESIGN_WIDTH / 2, 274);
      this.view.addChild(rankPanel, medal);
    } else {
      this.view.addChild(rankPanel);
    }

    const grade = new Text({
      text: this.outcome.victory ? this.grade() : 'F',
      style: new TextStyle({
        fill: this.outcome.victory ? 0xf4dca0 : COLORS.danger,
        fontSize: 70,
        fontWeight: '700',
        dropShadow: { color: COLORS.dark, alpha: 0.8, blur: 4, distance: 1 },
      }),
    });
    grade.anchor.set(0.5);
    grade.position.set(DESIGN_WIDTH / 2, 272);
    const badge = createBadge(
      this.outcome.firstClear ? 'FIRST CLEAR' : this.outcome.victory ? 'MISSION CLEAR' : 'RETRY',
      this.outcome.victory ? 'success' : 'danger',
    );
    badge.position.set(224, 350);
    this.view.addChild(grade, badge);
  }

  private createMetrics(): void {
    const divider = createDivider(408);
    divider.position.set(66, 410);
    const defeat = createMetric('처치', this.outcome.defeated.toString(), 126);
    defeat.position.set(58, 434);
    const combo = createMetric('최대 콤보', this.outcome.maxCombo.toString(), 144);
    combo.position.set(198, 434);
    const time = createMetric('전투 시간', `${this.outcome.clearSeconds}초`, 144);
    time.position.set(356, 434);
    this.view.addChild(divider, defeat, combo, time);
  }

  private createRewards(context: AppContext): void {
    const dropNames = this.outcome.itemDrops.length > 0
      ? this.outcome.itemDrops.map((itemId) => context.gameData.getItem(itemId).name).join(' · ')
      : '획득 장비 없음';
    const rewardPanel = createSectionPanel(58, 518, 424, 210, 'panel_strong');
    const rewardTitle = new Text({
      text: 'MISSION REWARD',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 14, fontWeight: '700', letterSpacing: 0.7 }),
    });
    rewardTitle.position.set(82, 540);
    const exp = createMetric('경험치', `+${this.outcome.exp.toLocaleString()}`, 174);
    exp.position.set(82, 574);
    const gold = createMetric('골드', `+${this.outcome.gold.toLocaleString()}`, 174);
    gold.position.set(282, 574);
    const equipmentLabel = new Text({
      text: '획득 장비',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '700' }),
    });
    equipmentLabel.position.set(82, 650);
    const equipment = new Text({
      text: dropNames,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: 15,
        fontWeight: '700',
        wordWrap: true,
        wordWrapWidth: 360,
      }),
    });
    equipment.position.set(82, 672);
    this.view.addChild(rewardPanel, rewardTitle, exp, gold, equipmentLabel, equipment);
  }

  private createActions(context: AppContext): void {
    const retry = new UiButton({
      label: '재도전',
      width: 148,
      height: 56,
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new BattleScene(this.outcome.stageId)),
    });
    retry.position.set(28, 756);

    const next = new UiButton({
      label: this.outcome.nextStageId ? '다음 작전' : '작전도',
      width: 176,
      height: 56,
      fontSize: 15,
      onPress: async () => context.scenes.change(
        () => this.outcome.nextStageId && this.outcome.victory
          ? new BattleScene(this.outcome.nextStageId)
          : new StageSelectScene(this.outcome.stageId),
      ),
    });
    next.position.set(182, 756);
    next.setEnabled(this.outcome.victory);

    const stages = new UiButton({
      label: '스테이지 선택',
      width: 148,
      height: 56,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => context.scenes.change(() => new StageSelectScene(this.outcome.stageId)),
    });
    stages.position.set(364, 756);

    const inventory = new UiButton({
      label: '장비 확인',
      width: 230,
      height: 58,
      tone: 'secondary',
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(28, 852);

    const lobby = new UiButton({
      label: '거점 복귀',
      width: 230,
      height: 58,
      tone: 'secondary',
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    lobby.position.set(282, 852);
    this.view.addChild(retry, next, stages, inventory, lobby);
  }

  private grade(): string {
    if (this.outcome.clearSeconds <= 55 && this.outcome.maxCombo >= 3) return 'S';
    if (this.outcome.clearSeconds <= 90) return 'A';
    return 'B';
  }
}
