import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { autoBattleStrategyPresetLabel } from '../core/input/CombatAssistController';
import { analyzeAutoCombatHistory } from '../game/presentation/AutoCombatHistoryAnalysis';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { AutoPresetLabScene } from './AutoPresetLabScene';

export class AutoCombatHistoryScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public enter(context: AppContext): void {
    const analysis = analyzeAutoCombatHistory(context.autoCombatHistory.current);
    this.view.addChild(createBackground('자동 전투 기록 분석', '최근 전투 기록을 바탕으로 프리셋 적합도·승률·수동 개입을 비교합니다.'));
    this.view.addChild(createPanel(24, 176, 492, 670));

    const feedback = createInlineFeedback(
      this.message || '기록은 이 기기의 로컬 저장소에 최대 18건 보관되며 Player Save와 분리됩니다.',
      this.message ? 'success' : 'neutral',
      456,
    );
    feedback.position.set(42, 190);

    const headline = new Text({
      text: analysis.totalSessions > 0
        ? `RECENT ${analysis.totalSessions} · WIN ${analysis.victories} · 추천 ${autoBattleStrategyPresetLabel(analysis.recommendedPreset)}`
        : '아직 저장된 자동 전투 기록이 없습니다.',
      style: new TextStyle({ fill: 0xffe9ad, fontSize: 15, fontWeight: '900', letterSpacing: 0.4 }),
    });
    headline.position.set(48, 246);

    const recommendation = createBadge(
      analysis.totalSessions > 0 ? `${autoBattleStrategyPresetLabel(analysis.recommendedPreset)} RECOMMENDED` : 'WAITING FOR DATA',
      analysis.totalSessions > 0 ? 'success' : 'secondary',
    );
    recommendation.position.set(330, 242);
    recommendation.scale.set(0.72);

    const matrixTitle = new Text({
      text: 'PRESET PERFORMANCE · 평균 적합도 / 실제 사용 기록',
      style: new TextStyle({ fill: COLORS.text, fontSize: 11, fontWeight: '800', letterSpacing: 0.4 }),
    });
    matrixTitle.position.set(48, 286);

    analysis.aggregates.forEach((aggregate, index) => {
      const y = 316 + index * 64;
      const label = new Text({
        text: autoBattleStrategyPresetLabel(aggregate.preset),
        style: new TextStyle({ fill: aggregate.preset === analysis.recommendedPreset ? 0xffe9ad : COLORS.text, fontSize: 12, fontWeight: '900' }),
      });
      label.position.set(48, y);
      const score = new Text({
        text: `${aggregate.score.toFixed(0)}점`,
        style: new TextStyle({ fill: 0xc7d8d6, fontSize: 11, fontWeight: '800' }),
      });
      score.anchor.set(1, 0);
      score.position.set(486, y);
      const bar = createProgressBar(286, aggregate.score / 100, aggregate.preset === analysis.recommendedPreset ? 'warning' : 'primary', 9);
      bar.position.set(124, y + 4);
      const detail = new Text({
        text: `사용 ${aggregate.sessions}회 · 승리 ${aggregate.victories}회 · 평균 ${aggregate.averageClearSeconds.toFixed(1)}초 · 수동 ${aggregate.averageManualInterventions.toFixed(1)}회`,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700' }),
      });
      detail.position.set(48, y + 25);
      this.view.addChild(label, score, bar, detail);
    });

    const recentPanel = createPanel(42, 514, 456, 246);
    const recentTitle = new Text({
      text: 'RECENT SESSION LOG',
      style: new TextStyle({ fill: 0xffe9ad, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }),
    });
    recentTitle.position.set(58, 530);
    this.view.addChild(recentPanel, recentTitle);

    if (analysis.recent.length === 0) {
      const empty = new Text({
        text: '자동 전투를 사용해 전투를 완료하면 이곳에 기록이 표시됩니다.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 10, fontWeight: '700', wordWrap: true, wordWrapWidth: 400 }),
      });
      empty.position.set(58, 568);
      this.view.addChild(empty);
    } else {
      analysis.recent.forEach((entry, index) => {
        const y = 562 + index * 31;
        const row = new Graphics()
          .roundRect(56, y - 3, 428, 27, 8)
          .fill({ color: COLORS.panelStrong, alpha: index % 2 === 0 ? 0.7 : 0.5 })
          .stroke({ color: entry.victory ? COLORS.primaryBright : COLORS.danger, alpha: 0.18, width: 1 });
        const label = new Text({
          text: `${entry.victory ? 'CLEAR' : 'FAIL'} · ${entry.stageLabel}`,
          style: new TextStyle({ fill: entry.victory ? COLORS.text : 0xffb6c0, fontSize: 9, fontWeight: '800' }),
        });
        label.position.set(66, y + 4);
        const detail = new Text({
          text: `${autoBattleStrategyPresetLabel(entry.summary.strategyPreset)} · ${entry.clearSeconds.toFixed(1)}s · C${entry.maxCombo} · M${entry.summary.manualInterventions}`,
          style: new TextStyle({ fill: COLORS.muted, fontSize: 8, fontWeight: '700' }),
        });
        detail.anchor.set(1, 0);
        detail.position.set(474, y + 5);
        this.view.addChild(row, label, detail);
      });
    }

    const clear = new UiButton({
      label: '기록 초기화',
      subtitle: '이 기기의 자동 전투 기록만 삭제합니다.',
      width: 220,
      height: 56,
      tone: 'secondary',
      fontSize: 13,
      subtitleFontSize: 8,
      onPress: async () => {
        context.autoCombatHistory.clear();
        await context.scenes.change(() => new AutoCombatHistoryScene('자동 전투 기록을 초기화했습니다.'));
      },
    });
    clear.position.set(28, 786);

    const back = new UiButton({
      label: '프리셋 연구소로 복귀',
      width: 258,
      height: 56,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => context.scenes.change(() => new AutoPresetLabScene('최근 자동 전투 성과 기록을 확인했습니다.')),
    });
    back.position.set(254, 786);

    this.view.addChild(feedback, headline, recommendation, matrixTitle, clear, back);
  }

  public exit(): void {}
  public update(): void {}
}
