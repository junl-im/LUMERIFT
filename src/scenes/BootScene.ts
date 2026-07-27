import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { ASSET_PATHS } from '../core/assets/AssetCatalog';
import { initializeUiSkin } from '../ui/UiSkin';
import { LoginScene } from './LoginScene';

export class BootScene implements Scene {
  public readonly view = new Container();
  private elapsed = 0;
  private completed = false;
  private assetsReady = false;
  private context?: AppContext;
  private readonly progress = new Graphics();
  private readonly status = new Text({
    text: '루멘 코어 동기화 중',
    style: new TextStyle({ fill: COLORS.muted, fontSize: 17 }),
  });

  public enter(context: AppContext): void {
    this.context = context;

    const background = new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background);
    const mark = new Graphics()
      .circle(DESIGN_WIDTH / 2, 320, 104)
      .fill({ color: COLORS.primary, alpha: 0.13 })
      .circle(DESIGN_WIDTH / 2, 320, 64)
      .fill({ color: COLORS.primary, alpha: 0.9 })
      .circle(DESIGN_WIDTH / 2, 320, 25)
      .fill(COLORS.accent);

    const title = new Text({
      text: BRAND.title,
      style: new TextStyle({ fill: COLORS.text, fontSize: 46, fontWeight: '700', letterSpacing: 5 }),
    });
    title.anchor.set(0.5);
    title.position.set(DESIGN_WIDTH / 2, 455);

    const subtitle = new Text({
      text: BRAND.subtitle,
      style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 18, letterSpacing: 2 }),
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(DESIGN_WIDTH / 2, 505);

    this.status.anchor.set(0.5);
    this.status.position.set(DESIGN_WIDTH / 2, 555);

    const track = new Graphics()
      .roundRect(70, 620, 400, 15, 8)
      .fill({ color: COLORS.panelStrong, alpha: 1 });

    const version = new Text({
      text: `Runtime Assets v${BRAND.version}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13 }),
    });
    version.anchor.set(0.5);
    version.position.set(DESIGN_WIDTH / 2, 680);

    this.view.addChild(background, mark, title, subtitle, this.status, track, this.progress, version);
    void this.loadCoreAssets(context);
  }

  public exit(): void {}

  public update(deltaSeconds: number): void {
    if (this.completed) return;

    this.elapsed += deltaSeconds;
    const timeRatio = Math.min(this.elapsed / 1.15, 1);
    const ratio = this.assetsReady ? timeRatio : Math.min(timeRatio, 0.88);
    this.progress.clear().roundRect(70, 620, 400 * ratio, 15, 8).fill(COLORS.accent);

    if (!this.assetsReady) {
      this.status.text = timeRatio > 0.55 ? 'WebP UI Atlas 준비 중' : '렌더러와 입력 시스템 준비 중';
      return;
    }

    this.status.text = timeRatio > 0.7 ? '전투 데이터와 저장소 확인 완료' : '공통 리소스 준비 완료';
    if (timeRatio >= 1 && this.context) {
      this.completed = true;
      void this.context.scenes.change(() => new LoginScene());
    }
  }

  private async loadCoreAssets(context: AppContext): Promise<void> {
    try {
      await initializeUiSkin(context.assets);
      context.audio.preload(ASSET_PATHS.uiClick, 'ui');
      this.assetsReady = true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '공통 리소스 로딩 실패';
      this.status.text = message;
      console.error(error);
    }
  }
}
