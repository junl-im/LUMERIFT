import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { downloadJson } from '../core/files/JsonFileTransfer';
import { buildDeviceQaReport } from '../core/performance/DeviceQaReport';
import type { DeviceQaSessionSampleInput } from '../core/performance/DeviceQaSessionRecorder';
import { analyzeDeviceQaSession } from '../core/performance/DeviceQaSessionAnalyzer';
import { performanceLevelLabel, pressureLabel } from '../core/performance/AdaptivePerformanceController';
import { playerArtVariantLabel } from '../core/presentation/PlayerArtVariantController';
import { joystickCalibrationLabel } from '../core/input/JoystickCalibrationController';
import { visionModeLabel } from '../core/accessibility/AccessibilityController';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { createBadge } from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';
import { LoginScene } from './LoginScene';

export class SettingsScene implements Scene {
  public readonly view = new Container();
  private diagnosticsText?: Text;
  private elapsed = 0;
  private context?: AppContext;

  public constructor(private readonly returnTo: 'login' | 'lobby' = 'lobby', private readonly message = '') {}

  public enter(context: AppContext): void {
    this.context = context;
    this.view.addChild(createBackground('환경 설정 및 기기 QA', '접근성·프레임·그래픽 품질과 실제 단말 진단 로그를 관리합니다.'));
    this.createPerformancePanel(context);
    this.createAccessibilityPanel(context);
    this.createQaPanel(context);

    const back = new UiButton({
      label: this.returnTo === 'login' ? '타이틀로 돌아가기' : '거점으로 돌아가기',
      width: 484,
      height: 54,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => this.returnTo === 'login' ? new LoginScene() : new LobbyScene()),
    });
    back.position.set(28, 884);
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
    const panel = createRasterPanel(24, 150, 492, 238, 'panel_strong');
    const title = createTitle('성능 자동 조정', 42, 168);
    const adaptive = context.adaptivePerformance.snapshot();
    const badge = createBadge(performanceLevelLabel(adaptive.level), adaptive.level === 'safe' ? 'warning' : 'success');
    badge.position.set(366, 166);

    const fps = new UiButton({
      label: `FPS · ${context.frameRate.currentMode.toUpperCase()}`,
      width: 210,
      height: 54,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => {
        context.frameRate.cycleMode();
        await context.scenes.change(() => new SettingsScene(this.returnTo, 'FPS 설정을 변경했습니다.'));
      },
    });
    fps.position.set(42, 214);

    const graphics = new UiButton({
      label: `그래픽 · ${context.graphicsQuality.current.label}`,
      width: 210,
      height: 54,
      tone: 'secondary',
      fontSize: 14,
      onPress: async () => {
        context.graphicsQuality.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '그래픽 선호도를 변경했습니다.'));
      },
    });
    graphics.position.set(282, 214);

    const joystick = new UiButton({
      label: `조이스틱 보정 · ${joystickCalibrationLabel(context.joystickCalibration.current)}`,
      subtitle: '문제가 있으면 반전·좌우·상하 보정 순서로 순환합니다.',
      width: 442,
      height: 48,
      tone: context.joystickCalibration.current === 'reverse' ? 'primary' : 'secondary',
      fontSize: 12,
      align: 'left',
      onPress: async () => {
        context.joystickCalibration.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '조이스틱 방향 보정을 변경했습니다.'));
      },
    });
    joystick.position.set(42, 280);

    const autoTarget = new UiButton({
      label: `자동 타겟 · ${context.combatAssist.current.autoTarget ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 36,
      tone: context.combatAssist.current.autoTarget ? 'primary' : 'secondary',
      fontSize: 11,
      onPress: async () => {
        context.combatAssist.toggleAutoTarget();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 타겟 설정을 변경했습니다.'));
      },
    });
    autoTarget.position.set(42, 334);

    const autoBattle = new UiButton({
      label: `자동 전투 · ${context.combatAssist.current.autoBattle ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 36,
      tone: context.combatAssist.current.autoBattle ? 'primary' : 'secondary',
      fontSize: 11,
      onPress: async () => {
        context.combatAssist.toggleAutoBattle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '자동 전투 설정을 변경했습니다.'));
      },
    });
    autoBattle.position.set(282, 334);

    const diagnosticsText = new Text({
      text: diagnosticsSummaryCompact(context),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 7, lineHeight: 9, wordWrap: true, wordWrapWidth: 442 }),
    });
    diagnosticsText.position.set(42, 374);
    this.diagnosticsText = diagnosticsText;
    this.view.addChild(panel, title, badge, fps, graphics, joystick, autoTarget, autoBattle, diagnosticsText);
  }

  private createAccessibilityPanel(context: AppContext): void {
    const panel = createRasterPanel(24, 406, 492, 320, 'panel');
    const title = createTitle('전투 표현·접근성', 42, 424);
    const settings = context.accessibility.current;

    const vision = new UiButton({
      label: visionModeLabel(settings.visionMode),
      subtitle: 'HP·보스·위험 상태를 색과 기호로 중복 표시',
      width: 442,
      height: 64,
      tone: settings.visionMode === 'standard' ? 'secondary' : 'primary',
      fontSize: 15,
      align: 'left',
      onPress: async () => {
        context.accessibility.cycleVisionMode();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '색상 접근성 모드를 변경했습니다.'));
      },
    });
    vision.position.set(42, 466);

    const largeHud = new UiButton({
      label: `큰 HUD · ${settings.largeHud ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 56,
      tone: settings.largeHud ? 'primary' : 'secondary',
      fontSize: 13,
      onPress: async () => {
        context.accessibility.toggleLargeHud();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '전투 HUD 크기를 변경했습니다.'));
      },
    });
    largeHud.position.set(42, 536);

    const reduceFlash = new UiButton({
      label: `연출 완화 · ${settings.reduceFlash ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 56,
      tone: settings.reduceFlash ? 'primary' : 'secondary',
      fontSize: 13,
      onPress: async () => {
        context.accessibility.toggleReduceFlash();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '카메라 흔들림과 섬광 강도를 변경했습니다.'));
      },
    });
    reduceFlash.position.set(282, 536);

    const haptics = new UiButton({
      label: `진동 피드백 · ${settings.haptics ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 48,
      tone: settings.haptics ? 'primary' : 'secondary',
      fontSize: 12,
      onPress: async () => {
        context.accessibility.toggleHaptics();
        context.haptics.pulse('ui', true);
        await context.scenes.change(() => new SettingsScene(this.returnTo, '전투 진동 피드백을 변경했습니다.'));
      },
    });
    haptics.position.set(42, 604);

    const announcements = new UiButton({
      label: `전투 낭독 · ${settings.combatAnnouncements ? '켜짐' : '꺼짐'}`,
      width: 210,
      height: 48,
      tone: settings.combatAnnouncements ? 'primary' : 'secondary',
      fontSize: 12,
      onPress: async () => {
        const next = context.accessibility.toggleCombatAnnouncements();
        context.liveAnnouncer.announce({ message: '전투 화면 낭독 설정이 변경되었습니다.', priority: 'polite' }, next.combatAnnouncements);
        await context.scenes.change(() => new SettingsScene(this.returnTo, '보스 경고와 핵심 전투 상태 낭독을 변경했습니다.'));
      },
    });
    announcements.position.set(282, 604);

    const artVariant = new UiButton({
      label: `캐릭터 원화 · ${playerArtVariantLabel(context.playerArtVariant.current)}`,
      width: 442,
      height: 44,
      tone: context.playerArtVariant.current === 'detail' ? 'secondary' : 'primary',
      fontSize: 12,
      onPress: async () => {
        context.playerArtVariant.cycle();
        await context.scenes.change(() => new SettingsScene(this.returnTo, '다음 전투부터 플레이어 원화 선택을 적용합니다.'));
      },
    });
    artVariant.position.set(42, 666);
    this.view.addChild(panel, title, vision, largeHud, reduceFlash, haptics, announcements, artVariant);
  }

  private createQaPanel(context: AppContext): void {
    const panel = createRasterPanel(24, 740, 492, 134, 'panel_gold');
    const title = createTitle('실기기 QA 세션', 42, 752);
    const analysis = analyzeDeviceQaSession(context.deviceQaSession.snapshot());
    const helper = new Text({
      text: context.deviceQaSession.isRunning
        ? '기록 중 · 전투 후 종료하세요. FPS·1% Low·긴 프레임·품질·뷰포트를 3초 간격으로 누적합니다.'
        : analysis
          ? `${analysis.verdict} · 점수 ${analysis.score} · 신뢰 ${analysis.confidence.toUpperCase()} · 표본 ${analysis.visibleSamples}`
          : '기록 시작 후 실제 기기에서 전투하세요. 배터리는 지원 브라우저에서만 기록하며 온도는 외부 측정값입니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 8, lineHeight: 13, wordWrap: true, wordWrapWidth: 442 }),
    });
    helper.position.set(42, 778);

    const sessionButton = new UiButton({
      label: context.deviceQaSession.isRunning ? 'QA 기록 종료' : 'QA 기록 시작',
      width: 210,
      height: 46,
      tone: context.deviceQaSession.isRunning ? 'danger' : 'secondary',
      fontSize: 13,
      onPress: async () => {
        if (context.deviceQaSession.isRunning) {
          await context.deviceQaSession.stop(deviceQaSample(context));
          await context.scenes.change(() => new SettingsScene(this.returnTo, '실기기 QA 세션을 종료했습니다.'));
        } else {
          await context.deviceQaSession.start(deviceQaSample(context));
          await context.scenes.change(() => new SettingsScene(this.returnTo, '실기기 QA 세션 기록을 시작했습니다.'));
        }
      },
    });
    sessionButton.position.set(42, 816);

    const exportButton = new UiButton({
      label: 'QA JSON 저장',
      icon: 'download',
      width: 210,
      height: 46,
      fontSize: 13,
      onPress: () => {
        const report = buildDeviceQaReport({
          adaptive: context.adaptivePerformance.snapshot(),
          viewport: context.mobileViewport.metrics(),
          accessibility: context.accessibility.current,
          graphicsPreference: context.graphicsQuality.mode,
          graphicsEffective: context.graphicsQuality.effectiveMode,
          fpsMode: context.frameRate.currentMode,
          targetFps: context.frameRate.targetFps,
          session: context.deviceQaSession.snapshot(),
        });
        downloadJson(`LUMERIFT_DEVICE_QA_${deviceDateKey()}.json`, report);
      },
    });
    exportButton.position.set(282, 816);

    const message = new Text({
      text: this.message || `LIVE ${BRAND.version} · App Check 비활성화 유지`,
      style: new TextStyle({ fill: this.message ? 0xf2d58a : 0x7f9693, fontSize: 10, align: 'center' }),
    });
    message.anchor.set(0.5, 0);
    message.position.set(270, 866);
    this.view.addChild(panel, title, helper, sessionButton, exportButton, message);
  }
}

function diagnosticsSummaryCompact(context: AppContext): string {
  const adaptive = context.adaptivePerformance.snapshot();
  return `${context.performance.fps} FPS · ${performanceLevelLabel(adaptive.level)} · ${context.graphicsQuality.effectiveMode} · CALIBRATION ${adaptive.calibration.label} · STICK ${joystickCalibrationLabel(context.joystickCalibration.current)} · TARGET ${context.combatAssist.current.autoTarget ? 'ON' : 'OFF'} · AUTO ${context.combatAssist.current.autoBattle ? 'ON' : 'OFF'}`;
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
  const title = new Text({ text: value, style: new TextStyle({ fill: 0xf4dca0, fontSize: 17, fontWeight: '700' }) });
  title.position.set(x, y);
  return title;
}

function deviceDateKey(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
