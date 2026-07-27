import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createBackground, createPanel } from '../ui/SceneChrome';
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
    const title = this.outcome.victory ? '균열 안정화 완료' : '계승자 전투 불능';
    const subtitle = this.outcome.victory
      ? `${this.outcome.stageLabel}${this.outcome.firstClear ? ' · 최초 클리어' : ''}`
      : `${this.outcome.stageLabel} · 장비와 회피 타이밍을 정비하세요.`;
    this.view.addChild(createBackground(title, subtitle));
    this.view.addChild(createPanel(40, 210, 460, 520));

    const grade = new Text({
      text: this.outcome.victory ? this.grade() : 'F',
      style: new TextStyle({
        fill: this.outcome.victory ? COLORS.warning : COLORS.danger,
        fontSize: 96,
        fontWeight: '700',
      }),
    });
    grade.anchor.set(0.5);
    grade.position.set(DESIGN_WIDTH / 2, 300);

    const dropNames = this.outcome.itemDrops.length > 0
      ? this.outcome.itemDrops.map((itemId) => context.gameData.getItem(itemId).name).join('\n')
      : '획득 장비 없음';
    const rewards = new Text({
      text: [
        this.outcome.firstClear ? '★ 최초 클리어 보너스 포함' : '반복 클리어 보상',
        `처치 ${this.outcome.defeated} · 최대 콤보 ${this.outcome.maxCombo}`,
        `전투 시간 ${this.outcome.clearSeconds}초`,
        `경험치 +${this.outcome.exp} · 골드 +${this.outcome.gold}`,
        '',
        '획득 장비',
        dropNames,
      ].join('\n'),
      style: new TextStyle({
        fill: COLORS.text,
        fontSize: 17,
        align: 'center',
        lineHeight: 27,
        wordWrap: true,
        wordWrapWidth: 390,
      }),
    });
    rewards.anchor.set(0.5, 0);
    rewards.position.set(DESIGN_WIDTH / 2, 370);

    const retry = new UiButton({
      label: '재도전',
      width: 145,
      height: 58,
      onPress: async () => context.scenes.change(() => new BattleScene(this.outcome.stageId)),
    });
    retry.position.set(30, 748);

    const next = new UiButton({
      label: this.outcome.nextStageId ? '다음 스테이지' : '작전도',
      width: 145,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(
        () => this.outcome.nextStageId && this.outcome.victory
          ? new BattleScene(this.outcome.nextStageId)
          : new StageSelectScene(this.outcome.stageId),
      ),
    });
    next.position.set(198, 748);
    next.setEnabled(this.outcome.victory);

    const stages = new UiButton({
      label: '스테이지 선택',
      width: 145,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new StageSelectScene(this.outcome.stageId)),
    });
    stages.position.set(366, 748);

    const inventory = new UiButton({
      label: '장비 확인',
      width: 230,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new InventoryScene()),
    });
    inventory.position.set(30, 820);

    const lobby = new UiButton({
      label: '거점 복귀',
      width: 230,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    lobby.position.set(280, 820);

    this.view.addChild(grade, rewards, retry, next, stages, inventory, lobby);
  }

  public exit(): void {}
  public update(): void {}

  private grade(): string {
    if (this.outcome.clearSeconds <= 55 && this.outcome.maxCombo >= 3) return 'S';
    if (this.outcome.clearSeconds <= 90) return 'A';
    return 'B';
  }
}
