import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import {
  autoBattleStrategyPresetDescription,
  autoBattleStrategyPresetLabel,
  autoBattleStrategyTuning,
  type AutoBattleStrategyPreset,
} from '../core/input/CombatAssistController';
import {
  autoBattlePresetSlotLabel,
  autoBattlePresetSlotUpdatedLabel,
} from '../core/input/AutoBattlePresetSlots';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { SettingsScene } from './SettingsScene';

export class AutoPresetLabScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public enter(context: AppContext): void {
    const settings = context.combatAssist.current;
    const slotState = context.combatAssist.presetSlots;
    const selectedSlot = slotState.slots[slotState.selectedSlot];

    this.view.addChild(createBackground('자동 전투 프리셋 연구소', '전략별 성향을 비교하고 사용자 설정을 3개 슬롯에 저장·복원합니다.'));
    this.view.addChild(createPanel(24, 176, 492, 670));

    const feedback = createInlineFeedback(
      this.message || '슬롯에는 자동 타겟 우선순위·스킬·회피·보스·기기 반응 설정이 함께 저장됩니다.',
      this.message ? 'success' : 'neutral',
      456,
    );
    feedback.position.set(42, 190);

    const currentTitle = new Text({
      text: `현재 전략 · ${autoBattleStrategyPresetLabel(settings.strategyPreset)}`,
      style: new TextStyle({ fill: 0xffe9ad, fontSize: 18, fontWeight: '900' }),
    });
    currentTitle.position.set(48, 246);
    const currentDescription = new Text({
      text: autoBattleStrategyPresetDescription(settings.strategyPreset),
      style: new TextStyle({ fill: COLORS.text, fontSize: 10, fontWeight: '700', wordWrap: true, wordWrapWidth: 430 }),
    });
    currentDescription.position.set(48, 274);
    const currentBadge = createBadge(settings.strategyPreset === 'custom' ? 'CUSTOM SLOT READY' : 'BUILT-IN PRESET', settings.strategyPreset === 'custom' ? 'warning' : 'success');
    currentBadge.position.set(350, 242);
    currentBadge.scale.set(0.76);

    const matrixTitle = new Text({
      text: 'STRATEGY MATRIX · 공격 / 안정 / Drive 보존',
      style: new TextStyle({ fill: 0xc7d8d6, fontSize: 11, fontWeight: '800', letterSpacing: 0.45 }),
    });
    matrixTitle.position.set(48, 310);

    const matrixRows = (['aggressive', 'balanced', 'conservative'] as const).map((preset, index) => this.createMatrixRow(preset, 48, 338 + index * 58));

    const slotPanel = createPanel(42, 520, 456, 238);
    const slotTitle = new Text({
      text: `USER PRESET VAULT · ${autoBattlePresetSlotLabel(slotState)}`,
      style: new TextStyle({ fill: 0xffe9ad, fontSize: 13, fontWeight: '900', letterSpacing: 0.4 }),
    });
    slotTitle.position.set(58, 536);
    const slotDetail = new Text({
      text: autoBattlePresetSlotUpdatedLabel(selectedSlot),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, fontWeight: '700' }),
    });
    slotDetail.position.set(58, 558);

    const slotButtons = ([1, 2, 3] as const).map((slotId, index) => {
      const saved = Boolean(slotState.slots[slotId]);
      const selected = slotState.selectedSlot === slotId;
      const button = new UiButton({
        label: `SLOT ${slotId} · ${saved ? 'SAVED' : 'EMPTY'}`,
        width: 132,
        height: 42,
        tone: selected ? 'primary' : 'secondary',
        fontSize: 10,
        onPress: async () => {
          context.combatAssist.selectCustomPresetSlot(slotId);
          await context.scenes.change(() => new AutoPresetLabScene(`사용자 슬롯 ${slotId}을 선택했습니다.`));
        },
      });
      button.position.set(58 + index * 142, 584);
      return button;
    });

    const save = new UiButton({
      label: '현재 설정 저장',
      subtitle: `선택한 SLOT ${slotState.selectedSlot}에 덮어씁니다.`,
      width: 132,
      height: 58,
      fontSize: 11,
      subtitleFontSize: 8,
      tone: 'primary',
      onPress: async () => {
        context.combatAssist.saveSelectedCustomPreset();
        await context.scenes.change(() => new AutoPresetLabScene(`SLOT ${slotState.selectedSlot}에 현재 자동 전투 설정을 저장했습니다.`));
      },
    });
    save.position.set(58, 642);

    const load = new UiButton({
      label: '슬롯 불러오기',
      subtitle: '불러오면 사용자 설정으로 적용됩니다.',
      width: 132,
      height: 58,
      fontSize: 11,
      subtitleFontSize: 8,
      tone: selectedSlot ? 'primary' : 'secondary',
      onPress: async () => {
        const loaded = context.combatAssist.loadSelectedCustomPreset();
        await context.scenes.change(() => new AutoPresetLabScene(loaded
          ? `SLOT ${slotState.selectedSlot} 설정을 불러왔습니다.`
          : `SLOT ${slotState.selectedSlot}에 저장된 설정이 없습니다.`));
      },
    });
    load.position.set(200, 642);

    const clear = new UiButton({
      label: '슬롯 초기화',
      subtitle: '선택 슬롯의 저장값만 삭제합니다.',
      width: 132,
      height: 58,
      fontSize: 11,
      subtitleFontSize: 8,
      tone: 'secondary',
      onPress: async () => {
        context.combatAssist.clearSelectedCustomPreset();
        await context.scenes.change(() => new AutoPresetLabScene(`SLOT ${slotState.selectedSlot} 저장값을 초기화했습니다.`));
      },
    });
    clear.position.set(342, 642);

    const note = new Text({
      text: '자동 전투 ON/OFF와 자동 타겟 ON/OFF는 전투 진입 안전을 위해 슬롯에 저장하지 않습니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700', wordWrap: true, wordWrapWidth: 410 }),
    });
    note.position.set(58, 714);

    const back = new UiButton({
      label: '시스템 커맨드 센터로 복귀',
      width: 484,
      height: 54,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => context.scenes.change(() => new SettingsScene('lobby', '사용자 자동 전투 프리셋 저장소를 확인했습니다.')),
    });
    back.position.set(28, 884);

    this.view.addChild(
      feedback,
      currentTitle,
      currentDescription,
      currentBadge,
      matrixTitle,
      ...matrixRows,
      slotPanel,
      slotTitle,
      slotDetail,
      ...slotButtons,
      save,
      load,
      clear,
      note,
      back,
    );
  }

  public exit(): void {}
  public update(): void {}

  private createMatrixRow(preset: Exclude<AutoBattleStrategyPreset, 'custom'>, x: number, y: number): Container {
    const root = new Container();
    root.position.set(x, y);
    const tuning = autoBattleStrategyTuning(preset);
    const label = new Text({
      text: autoBattleStrategyPresetLabel(preset),
      style: new TextStyle({ fill: preset === 'balanced' ? 0xffe9ad : COLORS.text, fontSize: 12, fontWeight: '900' }),
    });
    label.position.set(0, 2);
    const detail = new Text({
      text: autoBattleStrategyPresetDescription(preset),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700' }),
    });
    detail.position.set(70, 4);

    const offense = createProgressBar(118, clamp01(1.15 - tuning.skill2DriveFloor), 'warning', 7);
    offense.position.set(0, 28);
    const safety = createProgressBar(118, preset === 'conservative' ? 0.92 : preset === 'balanced' ? 0.74 : 0.58, 'success', 7);
    safety.position.set(146, 28);
    const conservation = createProgressBar(118, clamp01(tuning.skill2DriveFloor + tuning.finisherSaveThreshold), 'primary', 7);
    conservation.position.set(292, 28);
    root.addChild(label, detail, offense, safety, conservation);
    return root;
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
