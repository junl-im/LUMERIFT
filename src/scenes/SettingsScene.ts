import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { downloadJson } from '../core/files/JsonFileTransfer';
import { buildDeviceQaReport } from '../core/performance/DeviceQaReport';
import { performanceLevelLabel, pressureLabel } from '../core/performance/AdaptivePerformanceController';
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
    this.diagnosticsText.text = diagnosticsSummary(this.context);
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

    const diagnosticsText = new Text({
      text: diagnosticsSummary(context),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, lineHeight: 18, wordWrap: true, wordWrapWidth: 442 }),
    });
    diagnosticsText.position.set(42, 288);
    this.diagnosticsText = diagnosticsText;
    this.view.addChild(panel, title, badge, fps, graphics, diagnosticsText);
  }

  private createAccessibilityPanel(context: AppContext): void {
    const panel = createRasterPanel(24, 406, 492, 232, 'panel');
    const title = createTitle('전투 HUD 접근성', 42, 424);
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
    largeHud.position.set(42, 550);

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
    reduceFlash.position.set(282, 550);
    this.view.addChild(panel, title, vision, largeHud, reduceFlash);
  }

  private createQaPanel(context: AppContext): void {
    const panel = createRasterPanel(24, 656, 492, 194, 'panel_gold');
    const title = createTitle('실기기 QA 로그', 42, 674);
    const helper = new Text({
      text: 'Android·iOS 실제 기기에서 1분 이상 플레이한 뒤 저장하면 FPS, 1% Low, 긴 프레임 비율, Safe Area, 기기 보정 등급과 렌더 설정이 JSON으로 기록됩니다. 온도는 센서값이 아닌 프레임 추세 추정치입니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, lineHeight: 16, wordWrap: true, wordWrapWidth: 442 }),
    });
    helper.position.set(42, 708);

    const exportButton = new UiButton({
      label: '기기 QA JSON 저장',
      icon: 'download',
      width: 442,
      height: 54,
      fontSize: 15,
      onPress: () => {
        const report = buildDeviceQaReport({
          adaptive: context.adaptivePerformance.snapshot(),
          viewport: context.mobileViewport.metrics(),
          accessibility: context.accessibility.current,
          graphicsPreference: context.graphicsQuality.mode,
          graphicsEffective: context.graphicsQuality.effectiveMode,
          fpsMode: context.frameRate.currentMode,
          targetFps: context.frameRate.targetFps,
        });
        downloadJson(`LUMERIFT_DEVICE_QA_${deviceDateKey()}.json`, report);
      },
    });
    exportButton.position.set(42, 780);

    const message = new Text({
      text: this.message || `LIVE ${BRAND.version} · App Check 비활성화 유지`,
      style: new TextStyle({ fill: this.message ? 0xf2d58a : 0x7f9693, fontSize: 10, align: 'center' }),
    });
    message.anchor.set(0.5, 0);
    message.position.set(270, 842);
    this.view.addChild(panel, title, helper, exportButton, message);
  }
}

function diagnosticsSummary(context: AppContext): string {
  const adaptive = context.adaptivePerformance.snapshot();
  const performance = adaptive.performance;
  return [
    `${performance.fps} FPS · 1% Low ${performance.onePercentLow} · 긴 프레임 ${(performance.longFrameRatio * 100).toFixed(1)}%`,
    `${performanceLevelLabel(adaptive.level)} · ${pressureLabel(adaptive.estimatedPressure)} · Canvas ${adaptive.resolution.toFixed(2)}x`,
    `CALIBRATION · ${adaptive.calibration.label} · Render x${adaptive.calibration.thresholds.combatRenderBias.toFixed(2)}`,
    `선호 ${context.graphicsQuality.mode} / 적용 ${context.graphicsQuality.effectiveMode} · 목표 ${context.frameRate.targetFps} FPS`,
    'ENGINE · PixiJS 8 · pooled VFX · adaptive combat render budget',
  ].join('\n');
}

function createTitle(value: string, x: number, y: number): Text {
  const title = new Text({ text: value, style: new TextStyle({ fill: 0xf4dca0, fontSize: 17, fontWeight: '700' }) });
  title.position.set(x, y);
  return title;
}

function deviceDateKey(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
