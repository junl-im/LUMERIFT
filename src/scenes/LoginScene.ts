import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_HEIGHT, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createRasterPanel, getTitleBackgroundTexture } from '../ui/UiSkin';
import { UiButton } from '../ui/UiButton';
import { openEmailAuthOverlay, type EmailAuthMode } from '../ui/EmailAuthOverlay';
import { LobbyScene } from './LobbyScene';
import { openEmailPromptOverlay } from '../ui/EmailPromptOverlay';
import { SettingsScene } from './SettingsScene';

export class LoginScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private transitioning = false;
  private providerOverlay?: Container;
  private readonly message = new Text({
    text: '',
    style: new TextStyle({ fill: 0xdce9e6, fontSize: 11, align: 'center', wordWrap: true, wordWrapWidth: 430, dropShadow: { color: 0x000000, alpha: 0.8, blur: 4, distance: 1 } }),
  });

  public enter(context: AppContext): void {
    this.context = context;
    const texture = getTitleBackgroundTexture();
    if (texture) {
      const background = new Sprite(texture);
      background.width = DESIGN_WIDTH;
      background.height = DESIGN_HEIGHT;
      this.view.addChild(background);
    } else {
      this.view.addChild(new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill(COLORS.background));
    }

    const session = context.auth.currentSession;
    if (session) {
      const connected = createRasterPanel(352, 20, 170, 40, 'resource_chip');
      const state = new Text({
        text: `${session.provider.toUpperCase()} · 연결됨`,
        style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 10, fontWeight: '700' }),
      });
      state.anchor.set(0.5);
      state.position.set(437, 40);
      this.view.addChild(connected, state);
    }

    this.addHotspot(92, 566, 356, 74, async () => this.continueGame(), 22);
    this.addHotspot(102, 658, 336, 56, async () => this.openProviderMenu(), 18);
    this.addHotspot(102, 724, 336, 56, async () => this.signInGuest(), 18);
    this.addHotspot(122, 806, 84, 66, async () => this.showInfo('공지사항은 로그인 후 거점 운영실에서 확인할 수 있습니다.'), 16);
    this.addHotspot(228, 806, 84, 66, async () => {
      await context.scenes.change(() => new SettingsScene('login'));
    }, 16);
    this.addHotspot(334, 806, 84, 66, async () => this.showInfo('서비스 이용약관과 개인정보 처리방침은 정식 출시 전에 연결됩니다.'), 16);

    this.message.anchor.set(0.5, 0);
    this.message.position.set(DESIGN_WIDTH / 2, 888);
    this.message.text = session
      ? `${session.displayName} 계정으로 계속할 수 있습니다.`
      : '익명·Google·이메일 계정을 사용할 수 있습니다.';
    this.view.addChild(this.message);

    const version = new Text({
      text: `LIVE ${BRAND.version}`,
      style: new TextStyle({ fill: 0xa7b8b5, fontSize: 9, letterSpacing: 1.4 }),
    });
    version.anchor.set(0.5);
    version.position.set(DESIGN_WIDTH / 2, 933);
    this.view.addChild(version);
  }

  public exit(): void {}
  public update(): void {}

  private addHotspot(x: number, y: number, width: number, height: number, onPress: () => void | Promise<void>, radius: number): void {
    const hotspot = new Graphics()
      .roundRect(x, y, width, height, radius)
      .fill({ color: COLORS.primaryBright, alpha: 0.001 })
      .stroke({ color: COLORS.primaryBright, alpha: 0, width: 3 });
    hotspot.eventMode = 'static';
    hotspot.cursor = 'pointer';
    hotspot.hitArea = { contains: (px: number, py: number) => px >= x && py >= y && px <= x + width && py <= y + height };
    hotspot.on('pointerover', () => { hotspot.alpha = 0.78; hotspot.clear().roundRect(x, y, width, height, radius).fill({ color: COLORS.primaryBright, alpha: 0.04 }).stroke({ color: COLORS.primaryBright, alpha: 0.65, width: 2 }); });
    hotspot.on('pointerout', () => { hotspot.clear().roundRect(x, y, width, height, radius).fill({ color: COLORS.primaryBright, alpha: 0.001 }).stroke({ color: COLORS.primaryBright, alpha: 0, width: 2 }); });
    hotspot.on('pointerdown', () => { hotspot.alpha = 0.55; });
    hotspot.on('pointerup', () => { hotspot.alpha = 1; void onPress(); });
    this.view.addChild(hotspot);
  }

  private async continueGame(): Promise<void> {
    if (!this.context || this.transitioning) return;
    if (this.context.auth.currentSession) {
      this.transitioning = true;
      await this.context.scenes.change(() => new LobbyScene());
      return;
    }
    await this.signInGuest();
  }

  private openProviderMenu(): void {
    if (!this.context || this.providerOverlay) return;
    const overlay = new Container();
    const blocker = new Graphics().rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT).fill({ color: COLORS.dark, alpha: 0.84 });
    blocker.eventMode = 'static';
    const panel = createRasterPanel(48, 270, 444, 414, 'panel_gold');
    const kicker = new Text({ text: 'ACCOUNT LINK', style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 11, fontWeight: '700', letterSpacing: 2 }) });
    kicker.anchor.set(0.5); kicker.position.set(270, 302);
    const title = new Text({ text: '계정 연동', style: new TextStyle({ fill: 0xf4dca0, fontSize: 28, fontWeight: '700' }) });
    title.anchor.set(0.5); title.position.set(270, 341);
    const detail = new Text({ text: 'Google 또는 이메일 계정으로 로그인합니다.\n익명 진행은 계정 화면에서 같은 UID로 연결할 수 있습니다.', style: new TextStyle({ fill: COLORS.muted, fontSize: 12, align: 'center', lineHeight: 19 }) });
    detail.anchor.set(0.5, 0); detail.position.set(270, 374);
    const google = new UiButton({ label: 'Google 계정으로 로그인', icon: 'account', width: 344, height: 62, fontSize: 16, align: 'left', onPress: async () => this.signInGoogle() });
    google.position.set(98, 438);
    const emailLogin = new UiButton({ label: '이메일 로그인', icon: 'mail', width: 166, height: 58, tone: 'secondary', fontSize: 14, align: 'left', onPress: async () => this.signInEmail('login') });
    emailLogin.position.set(98, 516);
    const emailRegister = new UiButton({ label: '이메일 가입', icon: 'guest', width: 166, height: 58, tone: 'secondary', fontSize: 14, align: 'left', onPress: async () => this.signInEmail('register') });
    emailRegister.position.set(276, 516);
    const resetPassword = new UiButton({ label: '비밀번호 재설정', width: 218, height: 42, tone: 'secondary', fontSize: 12, onPress: async () => this.resetPassword() });
    resetPassword.position.set(98, 592);
    const close = new UiButton({ label: '닫기', width: 114, height: 42, tone: 'secondary', fontSize: 12, onPress: () => this.closeProviderMenu() });
    close.position.set(328, 592);
    overlay.addChild(blocker, panel, kicker, title, detail, google, emailLogin, emailRegister, resetPassword, close);
    this.providerOverlay = overlay;
    this.view.addChild(overlay);
  }

  private closeProviderMenu(): void {
    if (!this.providerOverlay) return;
    this.providerOverlay.parent?.removeChild(this.providerOverlay);
    this.providerOverlay.destroy({ children: true });
    this.providerOverlay = undefined;
  }

  private async signInGuest(): Promise<void> {
    await this.perform(async () => this.context?.auth.signInGuest());
  }

  private async signInGoogle(): Promise<void> {
    await this.perform(async () => this.context?.auth.signInGoogle());
  }

  private async signInEmail(mode: EmailAuthMode): Promise<void> {
    const input = await openEmailAuthOverlay(mode);
    if (!input) return;
    await this.perform(async () => mode === 'login'
      ? this.context?.auth.signInEmail(input.email, input.password)
      : this.context?.auth.registerEmail(input.email, input.password));
  }

  private async resetPassword(): Promise<void> {
    const email = await openEmailPromptOverlay();
    if (!email || !this.context) return;
    this.showInfo('재설정 메일을 보내고 있습니다.');
    try {
      await this.context.auth.sendPasswordReset(email);
      this.showInfo('비밀번호 재설정 메일을 보냈습니다.');
    } catch (error: unknown) {
      this.showInfo(error instanceof Error ? error.message : '메일 발송에 실패했습니다.');
    }
  }

  private showInfo(text: string): void {
    this.message.text = text;
  }

  private async perform(action: () => Promise<unknown> | undefined): Promise<void> {
    if (!this.context || this.transitioning) return;
    this.showInfo('계정과 Cloud Save를 확인하고 있습니다.');
    try {
      const result = await action();
      if (!result) throw new Error('인증 서비스를 사용할 수 없습니다.');
      this.transitioning = true;
      await this.context.scenes.change(() => new LobbyScene());
    } catch (error: unknown) {
      this.showInfo(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
    }
  }
}
