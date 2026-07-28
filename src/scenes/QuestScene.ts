import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { conditionLabel, getQuestProgress, isQuestClaimed, isQuestUnlocked, claimQuestReward } from '../game/quests/questLogic';
import type { QuestDefinition, QuestType } from '../game/quests/questTypes';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createRasterPanel } from '../ui/UiSkin';
import { createIconSprite } from '../ui/UiTheme';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

const PAGE_SIZE = 4;

export class QuestScene implements Scene {
  public readonly view = new Container();
  private profile?: PlayerProfile;
  private readonly rewardReadyPanels: Container[] = [];
  private elapsed = 0;

  public constructor(
    private readonly type: QuestType = 'main',
    private readonly page = 0,
  ) {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    this.profile = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    await context.playerRepository.save(this.profile);

    const all = context.gameData.questsInOrder.filter((quest) => quest.type === this.type);
    const maxPage = Math.max(0, Math.ceil(all.length / PAGE_SIZE) - 1);
    const safePage = Math.min(this.page, maxPage);
    const quests = all.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

    this.view.addChild(createBackground('작전 퀘스트', '조건을 달성하고 성장 재화와 장비를 수령하세요.'));
    this.view.addChild(createPanel(20, 180, 500, 680));

    this.createTabs(context);
    quests.forEach((quest, index) => this.createQuestRow(context, quest, index));
    this.createPageControls(context, safePage, maxPage);

    const resetIcon = createIconSprite(this.type === 'daily' ? 'attendance' : 'quest', 22);
    resetIcon.position.set(74, 827);
    const reset = new Text({
      text: this.type === 'daily' ? `일일 기준일 ${this.profile.dailyQuestDate} · UTC 00:00 초기화` : '메인 퀘스트는 순서대로 개방됩니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13 }),
    });
    reset.anchor.set(0.5);
    reset.position.set(DESIGN_WIDTH / 2 + 10, 838);

    const back = new UiButton({
      label: '거점으로',
      icon: 'back',
      width: 484,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(28, 876);
    this.view.addChild(resetIcon, reset, back);
  }

  public exit(): void {}

  public update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    const alpha = 0.88 + Math.sin(this.elapsed * 4) * 0.1;
    for (const panel of this.rewardReadyPanels) panel.alpha = alpha;
  }

  private createTabs(context: AppContext): void {
    const main = new UiButton({
      label: '메인 퀘스트', icon: 'quest', width: 230, height: 52,
      tone: this.type === 'main' ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new QuestScene('main')),
    });
    main.position.set(28, 202);
    const daily = new UiButton({
      label: '일일 퀘스트', icon: 'attendance', width: 230, height: 52,
      tone: this.type === 'daily' ? 'primary' : 'secondary',
      onPress: async () => context.scenes.change(() => new QuestScene('daily')),
    });
    daily.position.set(282, 202);
    this.view.addChild(main, daily);
  }

  private createQuestRow(context: AppContext, quest: QuestDefinition, index: number): void {
    const profile = this.profile;
    if (!profile) return;
    const y = 274 + index * 126;
    const unlocked = isQuestUnlocked(quest, profile);
    const claimed = isQuestClaimed(quest, profile);
    const progress = getQuestProgress(quest, profile);
    const panel = createRasterPanel(28, y, 484, 112, progress.complete && !claimed ? 'panel_gold' : 'panel');
    panel.alpha = unlocked ? 1 : 0.52;
    if (progress.complete && !claimed) this.rewardReadyPanels.push(panel);

    const iconName = claimed ? 'check' : !unlocked ? 'lock' : progress.complete ? 'reward' : 'quest';
    const icon = createIconSprite(iconName === 'reward' ? 'upgrade' : iconName, 32);
    icon.position.set(43, y + 15);
    const title = new Text({
      text: quest.title,
      style: new TextStyle({ fill: unlocked ? COLORS.text : COLORS.muted, fontSize: 17, fontWeight: '700' }),
    });
    title.position.set(82, y + 14);
    const state = createBadge(
      claimed ? '수령 완료' : progress.complete ? '완료' : unlocked ? '진행 중' : '잠김',
      claimed ? 'secondary' : progress.complete ? 'success' : unlocked ? 'primary' : 'secondary',
    );
    state.position.set(348, y + 12);
    state.scale.set(0.76);
    const condition = quest.conditions[0];
    const detail = new Text({
      text: unlocked
        ? `${quest.description}\n${condition ? conditionLabel(condition, quest) : ''}  ${progress.current} / ${progress.target}`
        : `선행 퀘스트 ${quest.prerequisiteQuestId ?? ''} 보상 수령 필요`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, lineHeight: 19, wordWrap: true, wordWrapWidth: 270 }),
    });
    detail.position.set(82, y + 44);

    const rewardGold = createIconSprite('gold', 18);
    rewardGold.position.set(360, y + 44);
    const rewardExp = createIconSprite('energy', 18);
    rewardExp.position.set(360, y + 65);
    const reward = new Text({
      text: `${quest.rewards.gold.toLocaleString()} G\nEXP ${quest.rewards.exp}${quest.rewards.itemIds.length ? `\n장비 ${quest.rewards.itemIds.length}` : ''}`,
      style: new TextStyle({ fill: COLORS.warning, fontSize: 11, lineHeight: 19 }),
    });
    reward.position.set(383, y + 42);
    const claim = new UiButton({
      label: claimed ? '수령 완료' : progress.complete ? '보상 수령' : '진행 중',
      icon: progress.complete && !claimed ? 'check' : undefined,
      width: 132,
      height: 44,
      tone: progress.complete && !claimed ? 'primary' : 'secondary',
      fontSize: 12,
      onPress: async () => {
        if (!this.profile) return;
        const updated = claimQuestReward(quest, this.profile, context.gameData);
        if (updated === this.profile) return;
        await context.playerRepository.save(updated);
        await context.scenes.change(() => new QuestScene(this.type, this.page));
      },
    });
    claim.position.set(362, y + 64);
    claim.setEnabled(unlocked && progress.complete && !claimed);
    const bar = createProgressBar(290, progress.target > 0 ? progress.current / progress.target : 0, progress.complete ? 'success' : 'primary', 7);
    bar.position.set(44, y + 96);
    this.view.addChild(panel, icon, title, state, detail, rewardGold, rewardExp, reward, bar, claim);
  }

  private createPageControls(context: AppContext, page: number, maxPage: number): void {
    const previous = new UiButton({
      label: '이전', icon: 'back', width: 110, height: 46, tone: 'secondary', fontSize: 13,
      onPress: async () => context.scenes.change(() => new QuestScene(this.type, Math.max(0, page - 1))),
    });
    previous.position.set(100, 788);
    previous.setEnabled(page > 0);
    const text = new Text({ text: `${page + 1} / ${maxPage + 1}`, style: new TextStyle({ fill: COLORS.text, fontSize: 15, fontWeight: '700' }) });
    text.anchor.set(0.5);
    text.position.set(DESIGN_WIDTH / 2, 812);
    const next = new UiButton({
      label: '다음', icon: 'play', width: 110, height: 46, tone: 'secondary', fontSize: 13,
      onPress: async () => context.scenes.change(() => new QuestScene(this.type, Math.min(maxPage, page + 1))),
    });
    next.position.set(330, 788);
    next.setEnabled(page < maxPage);
    this.view.addChild(previous, text, next);
  }
}
