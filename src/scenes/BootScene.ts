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
  private readonly rune = new Graphics();
  private readonly status = new Text({
    text: '루멘 코어 동기화 중',
    style: new TextStyle({ fill: COLORS.muted, fontSize: 14, letterSpacing: 0.5 }),
  });

  public enter(context: AppContext): void {
    this.context = context;

    const background = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .fill(COLORS.background)
      .circle(DESIGN_WIDTH / 2, 320, 280)
      .fill({ color: 0x0d5353, alpha: 0.13 })
      .circle(DESIGN_WIDTH / 2, 320, 170)
      .fill({ color: 0x2fc2ae, alpha: 0.08 });
    const vignette = new Graphics()
      .rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT)
      .stroke({ color: 0xcdaa5c, alpha: 0.18, width: 2 });

    this.rune.position.set(DESIGN_WIDTH / 2, 320);
    this.drawRune(0);

    const title = new Text({
      text: BRAND.title,
      style: new TextStyle({
        fill: 0xf1f6f4,
        fontSize: 54,
        fontWeight: '700',
        letterSpacing: 7,
        dropShadow: { color: 0x4ce3d1, alpha: 0.35, blur: 10, distance: 0 },
      }),
    });
    title.anchor.set(0.5);
    title.position.set(DESIGN_WIDTH / 2, 455);

    const subtitle = new Text({
      text: `${BRAND.subtitle}  ·  빛의 균열을 건너는 모험`,
      style: new TextStyle({ fill: 0xd9b968, fontSize: 14, letterSpacing: 1.3 }),
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(DESIGN_WIDTH / 2, 515);

    this.status.anchor.set(0.5);
    this.status.position.set(DESIGN_WIDTH / 2, 603);

    const track = new Graphics()
      .roundRect(88, 650, 364, 9, 5)
      .fill({ color: 0x02070b, alpha: 0.9 })
      .stroke({ color: 0xd5b45f, alpha: 0.35, width: 1 });

    const version = new Text({
      text: `UI SYSTEM v${BRAND.version}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, letterSpacing: 1.5 }),
    });
    version.anchor.set(0.5);
    version.position.set(DESIGN_WIDTH / 2, 698);

    this.view.addChild(background, vignette, this.rune, title, subtitle, this.status, track, this.progress, version);
    void this.loadCoreAssets(context);
  }

  public exit(): void {}

  public update(deltaSeconds: number): void {
    if (this.completed) return;

    this.elapsed += deltaSeconds;
    this.rune.rotation += deltaSeconds * 0.18;
    this.rune.alpha = 0.72 + Math.sin(this.elapsed * 2.4) * 0.14;
    const timeRatio = Math.min(this.elapsed / 1.05, 1);
    const ratio = this.assetsReady ? timeRatio : Math.min(timeRatio, 0.88);
    this.progress.clear()
      .roundRect(90, 652, 360 * ratio, 5, 3)
      .fill({ color: COLORS.primaryBright, alpha: 0.95 });

    if (!this.assetsReady) {
      this.status.text = timeRatio > 0.55 ? 'Luminous UI Atlas 준비 중' : '렌더러와 입력 시스템 준비 중';
      return;
    }

    this.status.text = timeRatio > 0.72 ? '계승자 기록 확인 완료' : '공통 리소스 준비 완료';
    if (timeRatio >= 1 && this.context) {
      this.completed = true;
      void this.context.scenes.change(() => new LoginScene());
    }
  }

  private drawRune(rotation: number): void {
    this.rune.clear();
    for (let index = 0; index < 3; index += 1) {
      const radius = 54 + index * 28;
      this.rune.circle(0, 0, radius).stroke({ color: index === 1 ? 0xcdaa5c : COLORS.primaryBright, alpha: 0.28 - index * 0.035, width: 2 });
    }
    for (let index = 0; index < 8; index += 1) {
      const angle = rotation + index * Math.PI / 4;
      this.rune.moveTo(Math.cos(angle) * 40, Math.sin(angle) * 40)
        .lineTo(Math.cos(angle) * 126, Math.sin(angle) * 126)
        .stroke({ color: index % 2 ? 0xcdaa5c : COLORS.primaryBright, alpha: 0.22, width: 1 });
    }
    this.rune.poly([0, -24, 18, 0, 0, 24, -18, 0]).fill({ color: COLORS.primaryBright, alpha: 0.5 });
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
