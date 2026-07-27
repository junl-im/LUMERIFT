import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { BRAND } from '../app/brand';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

export class LoginScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private readonly message = new Text({
    text: 'Firebase 미설정 시 로컬 게스트 모드로 시작합니다.',
    style: new TextStyle({ fill: COLORS.muted, fontSize: 15, align: 'center', wordWrap: true, wordWrapWidth: 400 }),
  });

  public enter(context: AppContext): void {
    this.context = context;
    this.view.addChild(createBackground(BRAND.koreanTitle, `${BRAND.subtitle} · 모바일 웹 액션 RPG`));
    this.view.addChild(createPanel(45, 260, 450, 470));

    const emblem = new Text({
      text: '✦',
      style: new TextStyle({ fill: COLORS.primaryBright, fontSize: 94 }),
    });
    emblem.anchor.set(0.5);
    emblem.position.set(DESIGN_WIDTH / 2, 355);

    const guest = new UiButton({
      label: '게스트로 시작',
      width: 360,
      onPress: async () => this.signIn('guest'),
    });
    guest.position.set(90, 480);

    const google = new UiButton({
      label: 'Google 로그인',
      width: 360,
      tone: 'secondary',
      onPress: async () => this.signIn('google'),
    });
    google.position.set(90, 570);

    this.message.anchor.set(0.5, 0);
    this.message.position.set(DESIGN_WIDTH / 2, 665);

    this.view.addChild(emblem, guest, google, this.message);
  }

  public exit(): void {}
  public update(): void {}

  private async signIn(provider: 'guest' | 'google'): Promise<void> {
    if (!this.context) return;

    this.message.text = '계정 정보를 확인하고 있습니다.';

    try {
      const session = provider === 'guest'
        ? await this.context.auth.signInGuest()
        : await this.context.auth.signInGoogle();
      this.message.text = `${session.displayName}님, 루메리프트에 오신 것을 환영합니다.`;
      await this.context.scenes.change(() => new LobbyScene());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '로그인 중 알 수 없는 오류가 발생했습니다.';
      this.message.text = message;
    }
  }
}
