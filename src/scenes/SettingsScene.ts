import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { downloadJson } from '../core/files/JsonFileTransfer';
import { buildDeviceQaReport } from '../core/performance/DeviceQaReport';
import type { DeviceQaSessionSampleInput } from '../core/performance/DeviceQaSessionRecorder';
import { analyzeDeviceQaSession } from '../core/performance/DeviceQaSessionAnalyzer';
import { performanceLevelLabel } from '../core/performance/AdaptivePerformanceController';
import { playerArtVariantLabel } from '../core/presentation/PlayerArtVariantController';
import { characterDyeLabel } from '../core/presentation/CharacterDyeController';
import { joystickCalibrationLabel } from '../core/input/JoystickCalibrationController';
import {
  autoBattleStrategyPresetDescription,
  autoBattleStrategyPresetLabel,
  autoSkillHpRuleLabel,
  autoTargetPriorityLabel,
  bossAutoModeLabel,
  bossDodgePolicyLabel,
  combatDevicePresetLabel,
  manualResumeDelayLabel,
} from '../core/input/CombatAssistController';
import { visionModeLabel } from '../core/accessibility/AccessibilityController';
import { autoBattlePresetSlotLabel } from '../core/input/AutoBattlePresetSlots';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { createBadge } from '../ui/PremiumUi';
import { createInterfaceStamp } from '../ui/InterfaceChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { LoginScene } from './LoginScene';
import { AutoPresetLabScene } from './AutoPresetLabScene';

export class SettingsScene implements Scene {
  public readonly view = new Container();
  private diagnosticsText?: Text;
  private elapsed = 0;
  private context?: AppContext;

  public constructor(private readonly returnTo: 'login' | 'lobby' = 'lobby', private readonly message = '') {}

  public enter(context: AppContext): void {
    this.context = context;
    this.view.addChild(createBackground('시스템 커맨드 센터', '성능·입력·자동 전투·접근성·실기기 QA를 하나의 콘솔에서 관리합니다.'));
    const feedback = createInlineFeedback(
      this.message || '설정 변경은 즉시 저장되며, 조이스틱 기본값은 화면 기준으로 유지됩니다.',
      this.message ? 'success' : 'neutral',
      484,
    );
    feedback.position.set(28, 136);
    this.view.addChild(feedback);
    this.createPerformancePanel(context);
    this.createCombatAssistPanel(context);
    this.createAccessibilityPanel(context);
    this.createQaPanel(context);

    const back = new UiButton({
      label: this.returnTo === 'login' ? '타이틀 게이트로 복귀' : '커맨드 허브로 복귀',
      width: 484,
      height: 50,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => context.scenes.change(() => this.returnTo === 'login' ? new LoginScene() : new LobbyScene()),
    });
    back.position.set(28, 896);
    this.view.addChild(back);
  }

  public exit(): void {}

  public update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    if (this.elapsed < 0.5 || !this.context || !this.diagnosticsText) return;
    this.elapsed = 0;
    this.diagnosticsText.text = diagnosticsSummaryCompact(this.context);
  }

  private createPerformancePanel(context: AppContext): void {
    const panel = createRasterPanel(24, 158, 492, 148, 'panel_strong');
    const title = createTitle('성능·입력 캘리브레이션', 42, 172);
    const adaptive = context.adaptivePerformance.snapshot();
    const badge = createBadge(performanceLevelLabel(adaptive.level), adaptive.level === 'safe' ? 'warning' : 'success');
    badge.position.set(370, 168);

    const fps = new UiButton({
      label: `FPS · ${context.frameRate.currentMode.toUpperCase()}`,
      width: 210,
      height: 46,
      tone: 'secondary',
      fontSize: 13,
      onPress: async () => {
        context.frameRate.cycleMode();
        await context.scenes.change(() => new SettingsScene(this.returnTo, 'FPS 설정을 변경했습니다.'));
      },
    });
    fps.position.set(42, 204);

    const graphics = new UiButton({
      label: `그래픽 · ${context.graphicsQuality.current.label}`,
      width: 210,
      height: 46,
      tone: 'secondary',
      fontSize: 13,
      onPress: async () => {
        context.graphicsQuality.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '그래픽 선호도를 변경했습니다.'));
      },
    });
    graphics.position.set(282, 204);

    const joystick = new UiButton({
      label: `조이스틱 보정 · ${joystickCalibrationLabel(context.joystickCalibration.current)}`,
      subtitle: '기본은 화면 기준입니다. 방향이 어긋난 기기에서만 좌우·상하·전체 반전을 선택합니다.',
      width: 442,
      height: 42,
      tone: context.joystickCalibration.current === 'screen' ? 'secondary' : 'primary',
      fontSize: 11,
      align: 'left',
      onPress: async () => {
        context.joystickCalibration.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '조이스틱 방향 보정을 변경했습니다.'));
      },
    });
    joystick.position.set(42, 256);

    this.view.addChild(panel, title, badge, fps, graphics, joystick);
  }

  private createCombatAssistPanel(context: AppContext): void {
    const settings = context.combatAssist.current;
    const panel = createRasterPanel(24, 316, 492, 336, 'panel_gold');
    const title = createTitle('자동 전투 커맨드', 42, 330);
    const stamp = createInterfaceStamp('ASSIST MATRIX 4', 142);
    stamp.position.set(350, 326);
    const helper = new Text({
      text: '공격형·균형형·보존형 프리셋을 선택한 뒤 세부 옵션을 직접 조정할 수 있습니다.',
      style: new TextStyle({ fill: 0xb9ccca, fontSize: 8, fontWeight: '700', wordWrap: true, wordWrapWidth: 438 }),
    });
    helper.position.set(42, 356);

    const autoTarget = new UiButton({
      label: `자동 타겟 · ${settings.autoTarget ? 'ON' : 'OFF'}`,
      width: 210,
      height: 36,
      tone: settings.autoTarget ? 'primary' : 'secondary',
      fontSize: 11,
      onPress: async () => {
        context.combatAssist.toggleAutoTarget();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 타겟 설정을 변경했습니다.'));
      },
    });
    autoTarget.position.set(42, 378);

    const autoBattle = new UiButton({
      label: `자동 전투 · ${settings.autoBattle ? 'ON' : 'OFF'}`,
      width: 210,
      height: 36,
      tone: settings.autoBattle ? 'primary' : 'secondary',
      fontSize: 11,
      onPress: async () => {
        context.combatAssist.toggleAutoBattle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 전투 설정을 변경했습니다.'));
      },
    });
    autoBattle.position.set(282, 378);

    const strategy = new UiButton({
      label: `전투 프리셋 · ${autoBattleStrategyPresetLabel(settings.strategyPreset)}`,
      subtitle: autoBattleStrategyPresetDescription(settings.strategyPreset),
      width: 442,
      height: 42,
      tone: settings.strategyPreset === 'custom' ? 'secondary' : 'primary',
      fontSize: 11,
      subtitleFontSize: 8,
      subtitleLineHeight: 10,
      align: 'left',
      onPress: async () => {
        const next = context.combatAssist.cycleStrategyPreset();
        await context.scenes.change(() => new SettingsScene(this.returnTo, `${autoBattleStrategyPresetLabel(next)} 자동 전투 프리셋을 적용했습니다.`));
      },
    });
    strategy.position.set(42, 420);

    const priority = new UiButton({
      label: `타겟 우선 · ${autoTargetPriorityLabel(settings.targetPriority)}`,
      width: 442,
      height: 30,
      tone: 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleTargetPriority();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 타겟 우선순위를 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    priority.position.set(42, 468);

    const skills = smallToggle(`자동 스킬 · ${settings.autoSkills ? 'ON' : 'OFF'}`, settings.autoSkills, async () => {
      context.combatAssist.toggleAutoSkills();
      await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 스킬 사용을 변경해 사용자 설정으로 전환했습니다.'));
    });
    skills.position.set(42, 504);
    const dodge = smallToggle(`자동 회피 · ${settings.autoDodge ? 'ON' : 'OFF'}`, settings.autoDodge, async () => {
      context.combatAssist.toggleAutoDodge();
      await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 회피 사용을 변경해 사용자 설정으로 전환했습니다.'));
    });
    dodge.position.set(282, 504);

    const skillHp = new UiButton({
      label: `스킬 HP 조건 · ${autoSkillHpRuleLabel(settings.autoSkillHpRule)}`,
      width: 210,
      height: 32,
      tone: settings.autoSkillHpRule === 'always' ? 'primary' : 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleAutoSkillHpRule();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 스킬 HP 조건을 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    skillHp.position.set(42, 542);

    const bossDodge = new UiButton({
      label: bossDodgePolicyLabel(settings.bossDodgePolicy),
      width: 210,
      height: 32,
      tone: settings.bossDodgePolicy === 'all' ? 'primary' : 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleBossDodgePolicy();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '보스 자동 회피 정책을 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    bossDodge.position.set(282, 542);

    const boss = new UiButton({
      label: bossAutoModeLabel(settings.bossAutoMode),
      width: 210,
      height: 32,
      tone: settings.bossAutoMode === 'full' ? 'primary' : 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleBossAutoMode();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '보스전 자동화 제한을 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    boss.position.set(42, 580);

    const device = new UiButton({
      label: `실기기 보정 · ${combatDevicePresetLabel(settings.devicePreset)}`,
      width: 210,
      height: 32,
      tone: settings.devicePreset === 'balanced' ? 'secondary' : 'primary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleDevicePreset();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '실기기 전투 반응을 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    device.position.set(282, 580);

    const resume = new UiButton({
      label: `자동 복귀 · ${manualResumeDelayLabel(settings.manualResumeDelay)}`,
      width: 210,
      height: 28,
      tone: 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.combatAssist.cycleManualResumeDelay();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '수동 조작 후 자동 복귀 시간을 변경해 사용자 설정으로 전환했습니다.'));
      },
    });
    resume.position.set(42, 618);

    const presetVault = new UiButton({
      label: `프리셋 저장소 · ${autoBattlePresetSlotLabel(context.combatAssist.presetSlots)}`,
      width: 210,
      height: 28,
      tone: 'secondary',
      fontSize: 8,
      onPress: async () => context.scenes.change(() => new AutoPresetLabScene()),
    });
    presetVault.position.set(282, 618);

    const diagnosticsText = new Text({
      text: diagnosticsSummaryCompact(context),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 7, lineHeight: 8, wordWrap: true, wordWrapWidth: 442 }),
    });
    diagnosticsText.position.set(42, 648);
    this.diagnosticsText = diagnosticsText;

    this.view.addChild(panel, title, stamp, helper, autoTarget, autoBattle, strategy, priority, skills, dodge, skillHp, bossDodge, boss, device, resume, presetVault, diagnosticsText);
  }

  private createAccessibilityPanel(context: AppContext): void {
    const settings = context.accessibility.current;
    const panel = createRasterPanel(24, 660, 492, 176, 'panel');
    const title = createTitle('전투 표현·접근성', 42, 672);

    const vision = new UiButton({
      label: visionModeLabel(settings.visionMode),
      width: 442,
      height: 34,
      tone: settings.visionMode === 'standard' ? 'secondary' : 'primary',
      fontSize: 11,
      onPress: async () => {
        context.accessibility.cycleVisionMode();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '색상 접근성 모드를 변경했습니다.'));
      },
    });
    vision.position.set(42, 696);

    const largeHud = smallToggle(`큰 HUD · ${settings.largeHud ? 'ON' : 'OFF'}`, settings.largeHud, async () => { context.accessibility.toggleLargeHud(); await context.scenes.change(() => new SettingsScene(this.returnTo, '큰 HUD 설정을 변경했습니다.')); });
    largeHud.position.set(42, 736);
    const reduceFlash = smallToggle(`연출 완화 · ${settings.reduceFlash ? 'ON' : 'OFF'}`, settings.reduceFlash, async () => { context.accessibility.toggleReduceFlash(); await context.scenes.change(() => new SettingsScene(this.returnTo, '연출 완화 설정을 변경했습니다.')); });
    reduceFlash.position.set(282, 736);
    const haptics = smallToggle(`진동 피드백 · ${settings.haptics ? 'ON' : 'OFF'}`, settings.haptics, async () => { context.accessibility.toggleHaptics(); await context.scenes.change(() => new SettingsScene(this.returnTo, '진동 설정을 변경했습니다.')); });
    haptics.position.set(42, 772);
    const announcements = smallToggle(`전투 낭독 · ${settings.combatAnnouncements ? 'ON' : 'OFF'}`, settings.combatAnnouncements, async () => { context.accessibility.toggleCombatAnnouncements(); await context.scenes.change(() => new SettingsScene(this.returnTo, '전투 낭독 설정을 변경했습니다.')); });
    announcements.position.set(282, 772);

    const artVariant = new UiButton({
      label: `본체 · ${playerArtVariantLabel(context.playerArtVariant.current)}`,
      width: 210,
      height: 28,
      tone: context.playerArtVariant.current === 'detail' ? 'secondary' : 'primary',
      fontSize: 9,
      onPress: async () => {
        context.playerArtVariant.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '다음 전투부터 플레이어 본체 원화를 변경합니다.'));
      },
    });
    artVariant.position.set(42, 808);

    const characterDye = new UiButton({
      label: `염색 · ${characterDyeLabel(context.characterDye.current)}`,
      width: 210,
      height: 28,
      tone: context.characterDye.current === 'heir-gold' ? 'primary' : 'secondary',
      fontSize: 9,
      onPress: async () => {
        context.characterDye.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, `캐릭터 염색을 ${characterDyeLabel(context.characterDye.current)}로 변경했습니다.`));
      },
    });
    characterDye.position.set(282, 808);

    this.view.addChild(panel, title, vision, largeHud, reduceFlash, haptics, announcements, artVariant, characterDye);
  }

  private createQaPanel(context: AppContext): void {
    const panel = createRasterPanel(24, 842, 492, 44, 'panel_strong');
    const analysis = analyzeDeviceQaSession(context.deviceQaSession.snapshot());
    const title = createTitle('실기기 QA', 42, 846);
    const helper = new Text({
      text: context.deviceQaSession.isRunning
        ? '기록 중 · 3초 간격으로 FPS·1% Low·긴 프레임·뷰포트를 수집합니다.'
        : analysis
          ? `${analysis.verdict} · 점수 ${analysis.score} · 신뢰 ${analysis.confidence.toUpperCase()}`
          : '실제 기기에서 전투를 기록하고 JSON으로 내보냅니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, wordWrap: true, wordWrapWidth: 278 }),
    });
    helper.position.set(42, 864);

    const sessionButton = new UiButton({
      label: context.deviceQaSession.isRunning ? 'QA 기록 종료' : 'QA 기록 시작',
      width: 96,
      height: 38,
      tone: context.deviceQaSession.isRunning ? 'danger' : 'secondary',
      fontSize: 10,
      onPress: async () => {
        if (context.deviceQaSession.isRunning) await context.deviceQaSession.stop(deviceQaSample(context));
        else await context.deviceQaSession.start(deviceQaSample(context));
        await context.scenes.change(() => new SettingsScene(this.returnTo, context.deviceQaSession.isRunning ? 'QA 기록을 시작했습니다.' : 'QA 기록을 종료했습니다.'));
      },
    });
    sessionButton.position.set(314, 846);

    const exportButton = new UiButton({
      label: 'QA JSON 저장',
      width: 96,
      height: 38,
      fontSize: 10,
      onPress: () => {
        const report = buildDeviceQaReport({
          adaptive: context.adaptivePerformance.snapshot(),
          viewport: context.mobileViewport.metrics(),
          accessibility: context.accessibility.current,
          graphicsPreference: context.graphicsQuality.mode,
          graphicsEffective: context.graphicsQuality.effectiveMode,
          fpsMode: context.frameRate.currentMode,
          targetFps: context.frameRate.targetFps,
          combatAssist: context.combatAssist.current,
          session: context.deviceQaSession.snapshot(),
        });
        downloadJson(`LUMERIFT_DEVICE_QA_${deviceDateKey()}.json`, report);
      },
    });
    exportButton.position.set(416, 846);

    const message = new Text({
      text: this.message || `LIVE ${BRAND.version} · App Check 비활성화 유지`,
      style: new TextStyle({ fill: this.message ? 0xf2d58a : 0x7f9693, fontSize: 8 }),
    });
    message.position.set(42, 882);
    this.view.addChild(panel, title, helper, sessionButton, exportButton, message);
  }
}

function diagnosticsSummaryCompact(context: AppContext): string {
  const adaptive = context.adaptivePerformance.snapshot();
  const assist = context.combatAssist.current;
  return `${context.performance.fps} FPS · ${performanceLevelLabel(adaptive.level)} · ${context.graphicsQuality.effectiveMode} · PRESET ${autoBattleStrategyPresetLabel(assist.strategyPreset)} · CALIBRATION ${adaptive.calibration.label} · STICK ${joystickCalibrationLabel(context.joystickCalibration.current)} · ${autoTargetPriorityLabel(assist.targetPriority)} · ${combatDevicePresetLabel(assist.devicePreset)} · ${autoSkillHpRuleLabel(assist.autoSkillHpRule)} · ${bossDodgePolicyLabel(assist.bossDodgePolicy)} · ${manualResumeDelayLabel(assist.manualResumeDelay)}`;
}

function deviceQaSample(context: AppContext): DeviceQaSessionSampleInput {
  return {
    adaptive: context.adaptivePerformance.snapshot(),
    viewport: context.mobileViewport.metrics(),
    graphicsEffective: context.graphicsQuality.effectiveMode,
    targetFps: context.frameRate.targetFps,
  };
}

function createTitle(value: string, x: number, y: number): Text {
  const title = new Text({ text: value, style: new TextStyle({ fill: 0xffe9ad, fontSize: 15, fontWeight: '900', letterSpacing: 0.35 }) });
  title.position.set(x, y);
  return title;
}

function smallToggle(label: string, active: boolean, action: () => void | Promise<void>): UiButton {
  return new UiButton({
    label,
    width: 210,
    height: 32,
    tone: active ? 'primary' : 'secondary',
    fontSize: 10,
    onPress: async () => { await action(); },
  });
}

function deviceDateKey(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
