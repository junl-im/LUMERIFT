import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import type { CloudSaveInspection, CloudSyncSnapshot } from '../services/cloud/CloudSaveTypes';
import type { PlayerProfile } from '../repositories/PlayerRepository';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { createBadge } from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { openEmailAuthOverlay } from '../ui/EmailAuthOverlay';
import { openEmailPromptOverlay } from '../ui/EmailPromptOverlay';
import { LoginScene } from './LoginScene';
import { LobbyScene } from './LobbyScene';
import { RankingScene } from './RankingScene';
import { RecoveryScene } from './RecoveryScene';

export class AccountScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private inspection?: CloudSaveInspection;
  private statusText?: Text;
  private unsubscribe?: () => void;

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) {
      await context.scenes.change(() => new LoginScene());
      return;
    }
    this.inspection = await context.playerRepository.inspect(session.uid);
    this.view.addChild(createBackground('계정 및 Cloud Save', '계정 연결·저장 충돌·동기화 상태를 관리합니다.'));
    this.createAccountPanel(context);
    this.createCloudPanel(context);
    this.createActions(context);
    this.statusText = new Text({
      text: this.message || syncMessage(context.playerRepository.syncSnapshot),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12, align: 'center', wordWrap: true, wordWrapWidth: 470 }),
    });
    this.statusText.anchor.set(0.5, 0);
    this.statusText.position.set(270, 842);
    this.view.addChild(this.statusText);
    this.unsubscribe = context.playerRepository.subscribe((snapshot) => {
      if (this.statusText && !this.message) this.statusText.text = syncMessage(snapshot);
    });

    const back = new UiButton({
      label: '거점으로 돌아가기', width: 484, height: 54, tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(28, 884);
    this.view.addChild(back);
  }

  public exit(): void { this.unsubscribe?.(); }
  public update(): void {}

  private createAccountPanel(context: AppContext): void {
    const session = context.auth.currentSession;
    if (!session) return;
    const panel = createRasterPanel(24, 150, 492, 212, 'panel_strong');
    const badge = createBadge(providerLabel(session.provider), session.anonymous ? 'warning' : 'success');
    badge.position.set(42, 172);
    const name = text(session.displayName, 42, 220, 25, COLORS.text, true);
    const email = text(session.email ?? '이메일 미연결', 42, 258, 13, COLORS.muted);
    const uid = text(`UID  ${shortUid(session.uid)}`, 42, 287, 11, 0x82939f);
    const verify = text(
      session.email ? (session.emailVerified ? '이메일 인증 완료' : '이메일 인증 필요') : '게스트 진행은 계정 연결을 권장합니다.',
      42, 320, 12, session.emailVerified ? 0x72d6b1 : 0xf0c96d,
    );
    this.view.addChild(panel, badge, name, email, uid, verify);
  }

  private createCloudPanel(context: AppContext): void {
    const inspection = this.inspection;
    const panel = createRasterPanel(24, 380, 492, 278, inspection?.conflict ? 'panel_gold' : 'panel_strong');
    const title = text(inspection?.conflict ? '저장 데이터 충돌 감지' : 'Cloud Save 상태', 42, 400, 18, inspection?.conflict ? 0xf2d58a : COLORS.text, true);
    const helper = text(
      inspection?.conflict
        ? '로컬과 클라우드의 저장 시각이 다릅니다. 아래 정보를 비교해 선택하세요.'
        : '자동 저장은 로컬에 먼저 기록한 뒤 Firestore와 동기화됩니다.',
      42, 433, 11, COLORS.muted,
    );
    const uid = context.auth.currentSession?.uid;
    const recoveryCount = uid ? context.playerRepository.listRecoveryPoints(uid).length : 0;
    const recovery = new UiButton({
      label: `복구 지점 ${recoveryCount}`, width: 128, height: 34, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new RecoveryScene()),
    });
    recovery.position.set(370, 393);
    this.view.addChild(panel, title, helper, recovery);
    this.createSaveCard('로컬', inspection?.local ?? null, 42, 472, inspection?.newest === 'local');
    this.createSaveCard('클라우드', inspection?.cloud ?? null, 282, 472, inspection?.newest === 'cloud');

    const upload = new UiButton({
      label: '로컬 → 클라우드', width: 214, height: 44, tone: 'secondary', fontSize: 12,
      onPress: async () => this.perform('로컬 저장을 클라우드에 업로드했습니다.', async () => {
        const uid = context.auth.currentSession?.uid;
        if (uid) await context.playerRepository.uploadLocal(uid);
      }),
    });
    upload.position.set(42, 596);
    const download = new UiButton({
      label: '클라우드 → 로컬', width: 214, height: 44, tone: 'secondary', fontSize: 12,
      onPress: async () => this.perform('클라우드 저장을 로컬에 적용했습니다.', async () => {
        const uid = context.auth.currentSession?.uid;
        if (uid) await context.playerRepository.downloadCloud(uid);
      }),
    });
    download.position.set(282, 596);
    this.view.addChild(upload, download);
  }

  private createSaveCard(label: string, profile: PlayerProfile | null, x: number, y: number, newest: boolean): void {
    const panel = createRasterPanel(x, y, 214, 108, newest ? 'slot_selected' : 'slot');
    const title = text(`${label}${newest ? ' · 최신' : ''}`, x + 15, y + 13, 12, newest ? 0xf3d58b : COLORS.muted, true);
    const summary = profile
      ? `Lv.${profile.level}  ·  Stage ${profile.highestStage}\nGold ${profile.gold.toLocaleString()}\n${formatDate(profile.updatedAt)}`
      : '저장 데이터 없음';
    const value = text(summary, x + 15, y + 38, 11, profile ? COLORS.text : COLORS.muted);
    value.style.lineHeight = 18;
    this.view.addChild(panel, title, value);
  }

  private createActions(context: AppContext): void {
    const session = context.auth.currentSession;
    if (!session) return;
    const panel = createRasterPanel(24, 678, 492, 144, 'panel');
    this.view.addChild(panel);
    const actions: UiButton[] = [];

    if (session.anonymous) {
      actions.push(new UiButton({
        label: 'Google 계정 연결', width: 214, height: 48, fontSize: 12,
        onPress: async () => this.perform('Google 계정 연결이 완료됐습니다.', async () => context.auth.signInGoogle()),
      }));
      actions.push(new UiButton({
        label: '이메일 계정 연결', width: 214, height: 48, tone: 'secondary', fontSize: 12,
        onPress: async () => {
          const input = await openEmailAuthOverlay('register');
          if (input) await this.perform('이메일 계정 연결이 완료됐습니다.', async () => context.auth.registerEmail(input.email, input.password));
        },
      }));
    } else {
      actions.push(new UiButton({
        label: session.emailVerified ? '인증 상태 새로고침' : '인증 메일 보내기', width: 214, height: 48, fontSize: 12,
        onPress: async () => this.perform(
          session.emailVerified ? '계정 상태를 새로고침했습니다.' : '인증 메일을 보냈습니다.',
          async () => session.emailVerified ? context.auth.refreshSession() : context.auth.sendVerification(),
        ),
      }));
      actions.push(new UiButton({
        label: '비밀번호 재설정', width: 214, height: 48, tone: 'secondary', fontSize: 12,
        onPress: async () => {
          const email = session.email ?? await openEmailPromptOverlay();
          if (email) await this.perform('비밀번호 재설정 메일을 보냈습니다.', async () => context.auth.sendPasswordReset(email));
        },
      }));
    }
    actions[0]?.position.set(42, 696);
    actions[1]?.position.set(282, 696);

    const ranking = new UiButton({
      label: '전체·주간 랭킹', width: 214, height: 48, tone: 'secondary', fontSize: 12,
      onPress: async () => context.scenes.change(() => new RankingScene()),
    });
    ranking.position.set(42, 754);
    const logout = new UiButton({
      label: '로그아웃', width: 214, height: 48, tone: 'danger', fontSize: 12,
      onPress: async () => {
        const uid = context.auth.currentSession?.uid;
        if (uid) await context.playerRepository.createRecoveryPoint(uid, 'pre-logout');
        await context.auth.signOutCurrent();
        await context.scenes.change(() => new LoginScene());
      },
    });
    logout.position.set(282, 754);
    this.view.addChild(...actions, ranking, logout);
  }

  private async perform(success: string, action: () => Promise<unknown>): Promise<void> {
    if (this.statusText) this.statusText.text = '처리 중입니다.';
    try {
      await action();
      if (this.context) await this.context.scenes.change(() => new AccountScene(success));
    } catch (error: unknown) {
      if (this.statusText) this.statusText.text = error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.';
    }
  }
}

function text(value: string, x: number, y: number, fontSize: number, fill: number, bold = false): Text {
  const node = new Text({ text: value, style: new TextStyle({ fill, fontSize, fontWeight: bold ? '700' : '400' }) });
  node.position.set(x, y);
  return node;
}

function shortUid(uid: string): string {
  return uid.length <= 18 ? uid : `${uid.slice(0, 8)}…${uid.slice(-7)}`;
}

function formatDate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '시각 정보 없음';
  return new Date(value).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function providerLabel(provider: string): string {
  const labels: Record<string, string> = { guest: '익명 계정', google: 'Google', email: '이메일', 'local-dev': '로컬 개발' };
  return labels[provider] ?? provider;
}

function syncMessage(snapshot: CloudSyncSnapshot): string {
  const labels: Record<CloudSyncSnapshot['state'], string> = {
    idle: 'Cloud Save 대기', syncing: 'Cloud Save 동기화 중', synced: 'Cloud Save 동기화 완료',
    offline: '오프라인 · 로컬 저장 유지', error: 'Cloud Save 오류 · 재시도 대기',
  };
  const time = snapshot.lastSyncedAt ? ` · ${formatDate(snapshot.lastSyncedAt)}` : '';
  const pending = snapshot.pendingCount > 0 ? ` · 대기 ${snapshot.pendingCount}건` : '';
  const recovery = snapshot.recoveryCount > 0 ? ` · 복구 ${snapshot.recoveryCount}개` : '';
  return `${labels[snapshot.state]}${time}${pending}${recovery}${snapshot.lastError ? `\n${snapshot.lastError}` : ''}`;
}
