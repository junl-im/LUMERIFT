import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { UiButton } from '../ui/UiButton';
import { openEmailAuthOverlay, type EmailAuthMode } from '../ui/EmailAuthOverlay';
import { LobbyScene } from './LobbyScene';

export class LoginScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private transitioning = false;
  private readonly message = new Text({
    text: '익명·Google·이메일 계정을 사용할 수 있습니다.',
    style: new TextStyle({ fill: COLORS.muted, fontSize: 13, align: 'center', wordWrap: true, wordWrapWidth: 410 }),
  });

  public enter(context: AppContext): void {
    this.context = context;
    if (context.auth.currentSession) {
      this.transitioning = true;
      void context.scenes.change(() => new LobbyScene());
      return;
    }

    this.view.addChild(createBackground(BRAND.koreanTitle, `${BRAND.subtitle} · Firebase Cloud Save`));
    this.view.addChild(createPanel(45, 208, 450, 586));

    const emblem = new Text({ text: '✦', style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 78 }) });
    emblem.anchor.set(0.5);
    emblem.position.set(DESIGN_WIDTH / 2, 292);

    const title = new Text({
      text: '계승자 인증',
      style: new TextStyle({ fill: COLORS.text, fontSize: 25, fontWeight: '700' }),
    });
    title.anchor.set(0.5);
    title.position.set(DESIGN_WIDTH / 2, 374);

    const guest = new UiButton({ label: '익명 계정으로 시작', width: 360, onPress: async () => this.signInGuest() });
    guest.position.set(90, 422);

    const google = new UiButton({
      label: 'Google 계정 연결', width: 360, tone: 'secondary', onPress: async () => this.signInGoogle(),
    });
    google.position.set(90, 504);

    const emailLogin = new UiButton({
      label: '이메일 로그인', width: 174, tone: 'secondary', fontSize: 14,
      onPress: async () => this.signInEmail('login'),
    });
    emailLogin.position.set(90, 586);

    const emailRegister = new UiButton({
      label: '이메일 가입', width: 174, tone: 'secondary', fontSize: 14,
      onPress: async () => this.signInEmail('register'),
    });
    emailRegister.position.set(276, 586);

    const guide = new Text({
      text: '익명으로 플레이한 뒤 Google 또는 이메일을 연결하면\n같은 UID와 저장 데이터를 유지합니다.',
      style: new TextStyle({ fill: 0xaeb9ca, fontSize: 12, lineHeight: 19, align: 'center' }),
    });
    guide.anchor.set(0.5, 0);
    guide.position.set(DESIGN_WIDTH / 2, 668);

    this.message.anchor.set(0.5, 0);
    this.message.position.set(DESIGN_WIDTH / 2, 731);
    this.view.addChild(emblem, title, guest, google, emailLogin, emailRegister, guide, this.message);
  }

  public exit(): void {}
  public update(): void {}

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

  private async perform(action: () => Promise<unknown> | undefined): Promise<void> {
    if (!this.context || this.transitioning) return;
    this.message.text = '계정과 Cloud Save를 확인하고 있습니다.';
    try {
      const result = await action();
      if (!result) throw new Error('인증 서비스를 사용할 수 없습니다.');
      this.transitioning = true;
      await this.context.scenes.change(() => new LobbyScene());
    } catch (error: unknown) {
      this.message.text = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.';
    }
  }
}
