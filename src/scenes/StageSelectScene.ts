import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import type { StageConfig } from '../game/combat/combatData';
import { calculateTotalPower, ensureStarterInventory } from '../game/items/inventoryLogic';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createProgressBar, createSectionPanel } from '../ui/PremiumUi';
import { getUiTexture } from '../ui/UiSkin';
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

    this.view.addChild(createBackground('루멘 숲 작전도', '현재 전력과 보상을 비교해 다음 균열을 선택하세요.'));
    this.view.addChild(createPanel(18, 150, 504, 708));

    this.createSummary(stages.length, clearCount, power);
    this.createRoute(context, stages, selected);
    this.createDetails(context, selected, power);
    this.createFooter(context, selected, power);
  }

  public exit(): void {}
  public update(): void {}

  private createSummary(totalStages: number, clearCount: number, power: number): void {
    const panel = createSectionPanel(28, 166, 484, 78, 'panel_strong');
    const chapter = new Text({
      text: 'CHAPTER 01  ·  안개숲의 균열',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 }),
    });
    chapter.position.set(46, 181);
    const summary = new Text({
      text: `진행 ${clearCount}/${totalStages}   전투력 ${power.toLocaleString()}   개방 1-${Math.min(this.profile?.highestStage ?? 1, totalStages)}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, fontWeight: '600' }),
    });
    summary.position.set(46, 207);
    const progress = createProgressBar(190, clearCount / totalStages, 'primary', 8);
    progress.position.set(304, 208);
    this.view.addChild(panel, chapter, summary, progress);
  }

  private createRoute(
    context: AppContext,
    stages: readonly StageConfig[],
    selected: StageConfig,
  ): void {
    const routePanel = createSectionPanel(28, 256, 484, 344, 'panel_glass');
    const routeLines = new Graphics();
    for (let index = 0; index < stages.length; index += 2) {
      const row = Math.floor(index / 2);
      const y = 292 + row * 58;
      routeLines.moveTo(137, y).lineTo(403, y);
      if (index + 2 < stages.length) {
        routeLines.moveTo(403, y).lineTo(137, y + 58);
      }
    }
    routeLines.stroke({ color: COLORS.primaryBright, alpha: 0.2, width: 3 });
    this.view.addChild(routePanel, routeLines);

    stages.forEach((stage, index) => {
      const unlocked = this.isUnlocked(stage);
      const progress = this.profile?.stageProgress[stage.id];
      const column = index % 2;
      const row = Math.floor(index / 2);
      const node = this.createStageNode(context, stage, {
        x: 44 + column * 244,
        y: 268 + row * 58,
        selected: selected.id === stage.id,
        unlocked,
        clearCount: progress?.clearCount ?? 0,
      });
      this.view.addChild(node);
    });
  }

  private createStageNode(
    context: AppContext,
    stage: StageConfig,
    options: {
      readonly x: number;
      readonly y: number;
      readonly selected: boolean;
      readonly unlocked: boolean;
      readonly clearCount: number;
    },
  ): Container {
    const root = new Container();
    root.position.set(options.x, options.y);
    const textureName = !options.unlocked
      ? 'stage_node_locked'
      : stage.nodeType === 'boss'
        ? 'stage_node_boss'
        : 'stage_node';
    const texture = getUiTexture(textureName);
    if (texture) {
      const frame = new Sprite(texture);
      frame.width = 208;
      frame.height = 48;
      root.addChild(frame);
    } else {
      root.addChild(new Graphics()
        .roundRect(0, 0, 208, 48, 15)
        .fill({ color: COLORS.panelStrong, alpha: 0.96 })
        .stroke({ color: nodeColor(stage), alpha: options.selected ? 1 : 0.5, width: options.selected ? 3 : 1 }));
    }
    if (options.selected) {
      root.addChild(new Graphics()
        .roundRect(-2, -2, 212, 52, 17)
        .stroke({ color: COLORS.warning, alpha: 0.92, width: 3 }));
    }

    const code = new Text({
      text: stage.label.split(' ')[0] ?? stage.label,
      style: new TextStyle({ fill: options.unlocked ? nodeColor(stage) : COLORS.muted, fontSize: 14, fontWeight: '700' }),
    });
    code.position.set(14, 8);
    const status = new Text({
      text: !options.unlocked ? '잠김' : options.clearCount > 0 ? `완료 ${options.clearCount}회` : '도전 가능',
      style: new TextStyle({ fill: options.unlocked ? COLORS.text : COLORS.muted, fontSize: 10, fontWeight: '600' }),
    });
    status.position.set(14, 27);
    const type = new Text({
      text: nodeMark(stage),
      style: new TextStyle({ fill: nodeColor(stage), fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }),
    });
    type.anchor.set(1, 0.5);
    type.position.set(192, 24);
    root.addChild(code, status, type);

    root.eventMode = 'static';
    root.cursor = 'pointer';
    root.hitArea = { contains: (x: number, y: number) => x >= 0 && y >= 0 && x <= 208 && y <= 48 };
    root.on('pointerup', () => {
      void context.scenes.change(() => new StageSelectScene(stage.id));
    });
    return root;
  }

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
    const detailPanel = createSectionPanel(
      28,
      614,
      484,
      226,
      stage.nodeType === 'boss' ? 'panel_gold' : 'panel_strong',
    );
    const badge = createBadge(nodeMark(stage), stage.nodeType === 'boss' ? 'danger' : stage.nodeType === 'elite' ? 'warning' : 'primary');
    badge.scale.set(0.78);
    badge.position.set(46, 632);
    const title = new Text({
      text: stage.label,
      style: new TextStyle({ fill: nodeColor(stage), fontSize: 20, fontWeight: '700' }),
    });
    title.position.set(128, 631);
    const recommended = new Text({
      text: `권장 ${stage.recommendedPower.toLocaleString()}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, fontWeight: '700' }),
    });
    recommended.anchor.set(1, 0);
    recommended.position.set(490, 636);
    const description = new Text({
      text: stage.description,
      style: new TextStyle({ fill: COLORS.text, fontSize: 14, wordWrap: true, wordWrapWidth: 438, lineHeight: 20 }),
    });
    description.position.set(46, 675);
    const info = new Text({
      text: [
        `일반 보상  EXP ${stage.rewards.exp} · ${stage.rewards.gold}G`,
        `최초 보상  ${progress?.firstClearReceived ? '수령 완료' : firstReward}`,
        `기록  ${progress?.bestSeconds ? `${progress.bestSeconds}초` : '-'} · 클리어 ${progress?.clearCount ?? 0}회`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, lineHeight: 20 }),
    });
    info.position.set(46, 727);
    const readiness = createProgressBar(
      438,
      Math.min(1, power / stage.recommendedPower),
      power >= stage.recommendedPower ? 'success' : 'warning',
      9,
    );
    readiness.position.set(46, 812);
    this.view.addChild(detailPanel, badge, title, recommended, description, info, readiness);
  }

  private createFooter(context: AppContext, selected: StageConfig, power: number): void {
    const back = new UiButton({
      label: '거점 복귀',
      width: 154,
      height: 58,
      tone: 'secondary',
      fontSize: 15,
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(28, 870);

    const start = new UiButton({
      label: power < selected.recommendedPower ? '전투력 부족 · 도전' : '균열 진입',
      width: 330,
      height: 58,
      fontSize: 17,
      onPress: async () => context.scenes.change(() => new BattleScene(selected.id)),
    });
    start.position.set(190, 870);
    start.setEnabled(this.isUnlocked(selected));
    this.view.addChild(back, start);
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
