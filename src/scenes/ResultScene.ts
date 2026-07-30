import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createDivider, createMetric, createSectionPanel } from '../ui/PremiumUi';
import { getUiTexture } from '../ui/UiSkin';
import { createIconSprite } from '../ui/UiTheme';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { BattleScene } from './BattleScene';
import { InventoryScene } from './InventoryScene';
import { StageSelectScene } from './StageSelectScene';
import { autoBattleReasonLabel } from '../game/combat/AutoBattleController';
import { autoBattleStrategyPresetLabel } from '../core/input/CombatAssistController';
import type { AutoCombatSessionSummary } from '../game/combat/AutoCombatSessionLog';
import { resolveResultActionPlan, type ResultActionPlan } from '../game/presentation/ResultActionPlan';
import { autoPresetPerformanceCompactLabel, resolveAutoPresetPerformance } from '../game/presentation/AutoPresetPerformance';

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
  readonly autoAssist?: AutoCombatSessionSummary;
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
  private medalGroup?: Container;
  private elapsed = 0;

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
    this.createAutoAssistReport();
    this.createRewards(context);
    this.createActions(context);
  }

  public exit(): void {}

  public update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    if (!this.medalGroup) return;
    const intro = Math.min(1, this.elapsed / 0.42);
    const eased = 1 - (1 - intro) ** 3;
    const pulse = this.outcome.victory && intro >= 1 ? Math.sin(this.elapsed * 3.4) * 0.012 : 0;
    this.medalGroup.alpha = intro;
    this.medalGroup.scale.set(0.84 + eased * 0.16 + pulse);
  }

  private createRank(): void {
    const rankPanel = createSectionPanel(48, 174, 444, 214, this.outcome.victory ? 'panel_gold' : 'panel_strong');
    this.view.addChild(rankPanel);

    const medalGroup = new Container();
    medalGroup.position.set(DESIGN_WIDTH / 2, 274);
    medalGroup.alpha = 0;
    medalGroup.scale.set(0.84);
    this.medalGroup = medalGroup;

    const texture = getUiTexture('medal');
    if (texture) {
      const medal = new Sprite(texture);
      medal.anchor.set(0.5);
      medal.width = 160;
      medal.height = 160;
      medalGroup.addChild(medal);
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
    medalGroup.addChild(grade);

    const badge = createBadge(
      this.outcome.firstClear ? 'FIRST CLEAR' : this.outcome.victory ? 'TACTICAL CLEAR' : 'RETRY REQUIRED',
      this.outcome.victory ? 'success' : 'danger',
    );
    badge.position.set(224, 350);
    const performanceBadge = createBadge(this.actionPlan().performanceLabel, this.outcome.victory ? 'warning' : 'secondary');
    performanceBadge.position.set(352, 350);
    this.view.addChild(medalGroup, badge, performanceBadge);
  }

  private createMetrics(): void {
    const divider = createDivider(408);
    divider.position.set(66, 410);
    const defeatIcon = createIconSprite('check', 22);
    defeatIcon.position.set(74, 445);
    const comboIcon = createIconSprite('upgrade', 22);
    comboIcon.position.set(214, 445);
    const timeIcon = createIconSprite('energy', 22);
    timeIcon.position.set(372, 445);
    const defeat = createMetric('처치', this.outcome.defeated.toString(), 126);
    defeat.position.set(58, 434);
    const combo = createMetric('최대 콤보', this.outcome.maxCombo.toString(), 144);
    combo.position.set(198, 434);
    const time = createMetric('전투 시간', `${this.outcome.clearSeconds}초`, 144);
    time.position.set(356, 434);
    this.view.addChild(divider, defeat, combo, time, defeatIcon, comboIcon, timeIcon);
  }

  private createAutoAssistReport(): void {
    const summary = this.outcome.autoAssist;
    const performance = resolveAutoPresetPerformance({
      victory: this.outcome.victory,
      clearSeconds: this.outcome.clearSeconds,
      maxCombo: this.outcome.maxCombo,
      defeated: this.outcome.defeated,
      summary,
    });
    const panel = createSectionPanel(58, 492, 424, 90, 'panel_gold');
    const title = new Text({
      text: 'TACTICAL SUMMARY · AUTO ASSIST REPORT',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 10, fontWeight: '800', letterSpacing: 0.65 }),
    });
    title.position.set(76, 503);
    const totals = summary
      ? `PRESET ${autoBattleStrategyPresetLabel(summary.strategyPreset)} · AUTO ${summary.enabledSeconds.toFixed(1)}s · TARGET ${summary.targetChanges} · ATK ${summary.attacks} · SKILL ${summary.skill1Uses + summary.skill2Uses} · DODGE ${summary.dodges} · MANUAL ${summary.manualInterventions}`
      : '자동 전투 기록 없음';
    const totalText = new Text({
      text: totals,
      style: new TextStyle({ fill: COLORS.text, fontSize: 9, fontWeight: '700', wordWrap: true, wordWrapWidth: 386 }),
    });
    totalText.position.set(76, 523);
    const reasonText = new Text({
      text: summary ? `주요 판단 · ${autoBattleReasonLabel(summary.topReason)} · 다음 추천 · ${this.actionPlan().recommendation}` : `수동 전투 결과 · 다음 추천 · ${this.actionPlan().recommendation}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, fontWeight: '700', wordWrap: true, wordWrapWidth: 386 }),
    });
    reasonText.position.set(76, 543);
    const comparisonText = new Text({
      text: `프리셋 적합도 · ${autoPresetPerformanceCompactLabel(performance)} · 추천 ${performance.headline}`,
      style: new TextStyle({ fill: 0xc7d8d6, fontSize: 8, fontWeight: '700', wordWrap: true, wordWrapWidth: 386 }),
    });
    comparisonText.position.set(76, 562);
    this.view.addChild(panel, title, totalText, reasonText, comparisonText);
  }

  private createRewards(context: AppContext): void {
    const dropNames = this.outcome.itemDrops.length > 0
      ? this.outcome.itemDrops.map((itemId) => context.gameData.getItem(itemId).name).join(' · ')
      : '획득 장비 없음';
    const rewardPanel = createSectionPanel(58, 590, 424, 160, 'panel_strong');
    const chest = createIconSprite('inventory', 28);
    chest.position.set(80, 602);
    const rewardTitle = new Text({
      text: 'MISSION REWARD · LOOT OVERVIEW',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 }),
    });
    rewardTitle.position.set(116, 606);
    const expIcon = createIconSprite('energy', 24);
    expIcon.position.set(82, 639);
    const goldIcon = createIconSprite('gold', 24);
    goldIcon.position.set(282, 639);
    const exp = createMetric('경험치', `+${this.outcome.exp.toLocaleString()}`, 174);
    exp.position.set(82, 622);
    const gold = createMetric('골드', `+${this.outcome.gold.toLocaleString()}`, 174);
    gold.position.set(282, 622);
    const equipmentLabel = new Text({
      text: '획득 장비',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, fontWeight: '700' }),
    });
    equipmentLabel.position.set(82, 682);
    const equipment = new Text({
      text: dropNames,
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: 13,
        fontWeight: '700',
        wordWrap: true,
        wordWrapWidth: 360,
        lineHeight: 15,
      }),
    });
    equipment.position.set(82, 700);
    const followUp = new Text({
      text: `다음 추천 행동 · ${this.actionPlan().recommendation}`,
      style: new TextStyle({ fill: 0xc3d7d3, fontSize: 10, fontWeight: '700', wordWrap: true, wordWrapWidth: 360 }),
    });
    followUp.position.set(82, 730);
    this.view.addChild(rewardPanel, chest, rewardTitle, exp, gold, expIcon, goldIcon, equipmentLabel, equipment, followUp);
  }

  private createActions(context: AppContext): void {
    const retry = new UiButton({
      label: '재도전',
      subtitle: '같은 스테이지를 바로 다시 시작합니다.',
      icon: 'recovery',
      width: 148,
      height: 56,
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new BattleScene(this.outcome.stageId)),
    });
    retry.position.set(28, 756);

    const actionPlan = this.actionPlan();
    const next = new UiButton({
      label: actionPlan.primaryLabel,
      subtitle: actionPlan.primarySubtitle,
      subtitleFontSize: 8,
      icon: this.outcome.nextStageId ? 'play' : this.outcome.itemDrops.length > 0 ? 'equipment' : 'stage',
      width: 176,
      height: 56,
      fontSize: 13,
      onPress: async () => context.scenes.change(
        () => this.outcome.nextStageId && this.outcome.victory
          ? new BattleScene(this.outcome.nextStageId)
          : this.outcome.itemDrops.length > 0
            ? new InventoryScene()
            : new StageSelectScene(this.outcome.stageId),
      ),
    });
    next.position.set(182, 756);
    next.setEnabled(this.outcome.victory);

    const stages = new UiButton({
      label: '스테이지 선택',
      subtitle: '다른 스테이지를 확인합니다.',
      icon: 'stage',
      width: 148,
      height: 56,
      tone: 'secondary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new StageSelectScene(this.outcome.stageId)),
    });
    stages.position.set(364, 756);

    const inventory = new UiButton({
      label: '장비 확인',
      subtitle: '획득 장비와 성장 상태를 검토합니다.',
      icon: 'equipment',
      width: 230,
      height: 58,
      tone: 'secondary',
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(28, 852);

    const lobby = new UiButton({
      label: '거점 복귀',
      subtitle: '로비에서 다음 행동을 준비합니다.',
      icon: 'home',
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

  private actionPlan(): ResultActionPlan {
    return resolveResultActionPlan({
      victory: this.outcome.victory,
      clearSeconds: this.outcome.clearSeconds,
      maxCombo: this.outcome.maxCombo,
      nextStageId: this.outcome.nextStageId,
      itemDropCount: this.outcome.itemDrops.length,
    });
  }
}
