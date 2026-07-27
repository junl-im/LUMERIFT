import { Container, Sprite, Text, TextStyle, type Spritesheet, type Texture } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS, DESIGN_WIDTH } from '../app/constants';
import { ASSET_PATHS, OPERATIONS_UI_BUNDLE } from '../core/assets/AssetCatalog';
import type { Scene } from '../core/scenes/Scene';
import { ATTENDANCE_REWARDS, COUPONS, MAILS, NOTICES } from '../game/operations/operationsData';
import {
  attendanceDay,
  claimAllMail,
  claimAttendance,
  claimMail,
  markNoticeRead,
  redeemCoupon,
} from '../game/operations/operationsLogic';
import type { NoticeDefinition, OperationReward } from '../game/operations/operationsTypes';
import { createDefaultProfile, type PlayerProfile } from '../repositories/PlayerRepository';
import { createBadge, createProgressBar } from '../ui/PremiumUi';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { UiButton } from '../ui/UiButton';
import { LobbyScene } from './LobbyScene';

export type OperationsSection = 'notice' | 'attendance' | 'mail' | 'coupon';

const SECTION_META: Record<OperationsSection, { readonly label: string; readonly icon: string; readonly subtitle: string }> = {
  notice: { label: '공지', icon: 'notice_bell', subtitle: '업데이트와 균열 경보를 확인합니다.' },
  attendance: { label: '출석', icon: 'attendance_calendar', subtitle: '주간 출석 보상을 수령합니다.' },
  mail: { label: '우편', icon: 'mail_envelope', subtitle: '도착한 보급품을 확인합니다.' },
  coupon: { label: '쿠폰', icon: 'coupon_seal', subtitle: '프로모션 코드를 등록합니다.' },
};

export class OperationsScene implements Scene {
  public readonly view = new Container();
  private context?: AppContext;
  private profile?: PlayerProfile;
  private sheet?: Spritesheet;
  private bundleLoaded = false;
  private notices: readonly NoticeDefinition[] = NOTICES;

  public constructor(
    private readonly section: OperationsSection = 'notice',
    private readonly message = '',
  ) {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');

    this.notices = await context.operationsContent.loadNotices();
    this.profile = await context.playerRepository.load(session.uid)
      ?? createDefaultProfile(session.uid, session.displayName);
    await context.playerRepository.save(this.profile);

    await context.assets.loadBundle(OPERATIONS_UI_BUNDLE);
    this.bundleLoaded = true;
    this.sheet = context.assets.get<Spritesheet>(ASSET_PATHS.operationsAtlas);

    const meta = SECTION_META[this.section];
    this.view.addChild(createBackground('거점 운영실', meta.subtitle));
    this.createStatusHeader();
    this.createTabs(context);
    this.view.addChild(createRasterPanel(20, 282, 500, 570, 'panel_strong'));

    if (this.section === 'notice') this.createNotices(context);
    if (this.section === 'attendance') this.createAttendance(context);
    if (this.section === 'mail') this.createMail(context);
    if (this.section === 'coupon') this.createCoupons(context);

    if (this.message) this.createToast(this.message);

    const back = new UiButton({
      label: '거점으로 돌아가기',
      width: 484,
      height: 58,
      tone: 'secondary',
      onPress: async () => context.scenes.change(() => new LobbyScene()),
    });
    back.position.set(28, 878);
    this.view.addChild(back);
  }

  public async exit(): Promise<void> {
    if (this.bundleLoaded) {
      await this.context?.assets.releaseBundle(OPERATIONS_UI_BUNDLE.id);
      this.bundleLoaded = false;
    }
  }

  public update(): void {}

  private createStatusHeader(): void {
    const profile = this.profile;
    if (!profile) return;
    const header = createRasterPanel(20, 142, 500, 58, 'resource_chip');
    const title = new Text({
      text: 'RIFT OPERATIONS',
      style: new TextStyle({ fill: 0xf3d895, fontSize: 13, fontWeight: '700', letterSpacing: 1.1 }),
    });
    title.position.set(40, 157);
    const gold = new Text({
      text: `${profile.gold.toLocaleString()} GOLD`,
      style: new TextStyle({ fill: 0xf6e4ad, fontSize: 18, fontWeight: '700' }),
    });
    gold.anchor.set(1, 0);
    gold.position.set(498, 153);
    this.view.addChild(header, title, gold);
  }

  private createTabs(context: AppContext): void {
    (Object.keys(SECTION_META) as OperationsSection[]).forEach((section, index) => {
      const active = section === this.section;
      const x = 24 + index * 126;
      const tab = createRasterPanel(x, 212, 114, 58, active ? 'tab_active' : 'tab_inactive');
      tab.eventMode = 'static';
      tab.cursor = 'pointer';
      tab.on('pointertap', () => { void context.scenes.change(() => new OperationsScene(section)); });
      const icon = this.createIcon(SECTION_META[section].icon, 34);
      icon.position.set(x + 12, 224);
      const label = new Text({
        text: SECTION_META[section].label,
        style: new TextStyle({ fill: active ? 0xf6dda2 : COLORS.muted, fontSize: 14, fontWeight: '700' }),
      });
      label.position.set(x + 52, 232);
      this.view.addChild(tab, icon, label);
    });
  }

  private createNotices(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;
    this.notices.slice(0, 3).forEach((notice, index) => {
      const y = 302 + index * 158;
      const read = Boolean(profile.operations.noticeReads[notice.id]);
      const panel = createRasterPanel(34, y, 472, 140, notice.important ? 'panel_gold' : 'panel');
      const icon = this.createIcon('notice_bell', 54);
      icon.position.set(46, y + 20);
      const badge = createBadge(notice.important ? '중요' : read ? '확인' : '새 소식', notice.important ? 'warning' : read ? 'secondary' : 'primary');
      badge.position.set(416, y + 16);
      badge.scale.set(0.78);
      const title = new Text({
        text: notice.title,
        style: new TextStyle({ fill: COLORS.text, fontSize: 17, fontWeight: '700' }),
      });
      title.position.set(116, y + 20);
      const date = new Text({ text: notice.publishedAt, style: new TextStyle({ fill: COLORS.muted, fontSize: 10 }) });
      date.position.set(116, y + 46);
      const detail = new Text({
        text: read ? notice.body : notice.summary,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 12, lineHeight: 18, wordWrap: true, wordWrapWidth: 338 }),
      });
      detail.position.set(116, y + 68);
      const action = new UiButton({
        label: read ? '읽음' : '내용 확인', width: 110, height: 36, tone: read ? 'secondary' : 'primary', fontSize: 12,
        onPress: async () => {
          const current = this.profile;
          if (!current) return;
          const result = markNoticeRead(current, notice.id);
          if (result.changed) await context.playerRepository.save(result.profile);
          await context.scenes.change(() => new OperationsScene('notice', result.message));
        },
      });
      action.position.set(380, y + 92);
      action.setEnabled(!read);
      this.view.addChild(panel, icon, badge, title, date, detail, action);
    });
  }

  private createAttendance(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;
    const currentDay = attendanceDay();
    const claims = profile.operations.attendanceClaims;
    const progress = createProgressBar(438, claims.length / 7, claims.length === 7 ? 'success' : 'primary', 10);
    progress.position.set(51, 316);
    const progressText = new Text({
      text: `${claims.length} / 7 수령 완료 · 오늘 DAY ${currentDay}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12 }),
    });
    progressText.position.set(51, 334);
    this.view.addChild(progress, progressText);

    ATTENDANCE_REWARDS.forEach((reward, index) => {
      const row = Math.floor(index / 4);
      const column = index % 4;
      const x = 37 + column * 119;
      const y = 368 + row * 176;
      const claimed = claims.includes(reward.day);
      const current = reward.day === currentDay;
      const panel = createRasterPanel(x, y, 108, 150, current ? 'slot_selected' : claimed ? 'slot_common' : 'slot');
      const icon = this.createIcon(reward.icon, 64);
      icon.position.set(x + 22, y + 18);
      const day = new Text({
        text: `DAY ${reward.day}`,
        style: new TextStyle({ fill: current ? 0xf7df9b : COLORS.text, fontSize: 12, fontWeight: '700' }),
      });
      day.anchor.set(0.5);
      day.position.set(x + 54, y + 96);
      const label = new Text({
        text: reward.label,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 10, align: 'center', wordWrap: true, wordWrapWidth: 94 }),
      });
      label.anchor.set(0.5, 0);
      label.position.set(x + 54, y + 112);
      if (claimed) {
        const check = this.createIcon('status_claimed', 30);
        check.position.set(x + 72, y + 8);
        this.view.addChild(check);
      }
      this.view.addChild(panel, icon, day, label);
    });

    const already = claims.includes(currentDay);
    const claim = new UiButton({
      label: already ? '오늘 보상 수령 완료' : '오늘 출석 보상 수령', width: 438, height: 58,
      tone: already ? 'secondary' : 'primary',
      onPress: async () => {
        const current = this.profile;
        if (!current) return;
        const result = claimAttendance(current);
        if (result.changed) await context.playerRepository.save(result.profile);
        await context.scenes.change(() => new OperationsScene('attendance', result.message));
      },
    });
    claim.position.set(51, 750);
    claim.setEnabled(!already);
    this.view.addChild(claim);
  }

  private createMail(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;
    const pending = MAILS.filter((mail) => !profile.operations.mailClaims[mail.id]).length;
    const summary = new Text({
      text: `보관 우편 ${MAILS.length}개 · 수령 가능 ${pending}개`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 12 }),
    });
    summary.position.set(42, 305);
    const all = new UiButton({
      label: '모두 수령', width: 120, height: 38, tone: pending > 0 ? 'primary' : 'secondary', fontSize: 12,
      onPress: async () => {
        const current = this.profile;
        if (!current) return;
        const result = claimAllMail(current);
        if (result.changed) await context.playerRepository.save(result.profile);
        await context.scenes.change(() => new OperationsScene('mail', result.message));
      },
    });
    all.position.set(378, 296);
    all.setEnabled(pending > 0);
    this.view.addChild(summary, all);

    MAILS.forEach((mail, index) => {
      const y = 352 + index * 152;
      const claimed = Boolean(profile.operations.mailClaims[mail.id]);
      const panel = createRasterPanel(34, y, 472, 136, claimed ? 'panel' : 'panel_gold');
      const icon = this.createIcon(claimed ? 'status_claimed' : 'mail_envelope', 54);
      icon.position.set(48, y + 22);
      const sender = new Text({ text: mail.sender, style: new TextStyle({ fill: 0xf3d895, fontSize: 10, fontWeight: '700' }) });
      sender.position.set(118, y + 16);
      const title = new Text({ text: mail.title, style: new TextStyle({ fill: COLORS.text, fontSize: 16, fontWeight: '700' }) });
      title.position.set(118, y + 35);
      const body = new Text({
        text: `${mail.body}\n${this.rewardLabel(mail.reward)} · 만료 ${mail.expiresAt}`,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 11, lineHeight: 17, wordWrap: true, wordWrapWidth: 270 }),
      });
      body.position.set(118, y + 62);
      const claim = new UiButton({
        label: claimed ? '수령 완료' : '수령', width: 96, height: 40, tone: claimed ? 'secondary' : 'primary', fontSize: 12,
        onPress: async () => {
          const current = this.profile;
          if (!current) return;
          const result = claimMail(current, mail.id);
          if (result.changed) await context.playerRepository.save(result.profile);
          await context.scenes.change(() => new OperationsScene('mail', result.message));
        },
      });
      claim.position.set(394, y + 78);
      claim.setEnabled(!claimed);
      this.view.addChild(panel, icon, sender, title, body, claim);
    });
  }

  private createCoupons(context: AppContext): void {
    const profile = this.profile;
    if (!profile) return;
    const seal = this.createIcon('coupon_seal', 92);
    seal.position.set(52, 318);
    const title = new Text({
      text: '균열 보급 코드',
      style: new TextStyle({ fill: 0xf4dca0, fontSize: 23, fontWeight: '700' }),
    });
    title.position.set(170, 333);
    const body = new Text({
      text: '영문과 숫자로 구성된 쿠폰 코드를 입력하세요.\n코드는 계정당 한 번만 사용할 수 있습니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 13, lineHeight: 21 }),
    });
    body.position.set(170, 372);
    this.view.addChild(seal, title, body);

    COUPONS.forEach((coupon, index) => {
      const y = 448 + index * 126;
      const redeemed = Boolean(profile.operations.redeemedCoupons[coupon.code]);
      const panel = createRasterPanel(42, y, 456, 106, redeemed ? 'panel' : 'panel_gold');
      const code = new Text({
        text: coupon.code,
        style: new TextStyle({ fill: redeemed ? COLORS.muted : 0xf5dda1, fontSize: 18, fontWeight: '700', letterSpacing: 1.2 }),
      });
      code.position.set(62, y + 18);
      const detail = new Text({
        text: `${coupon.title}\n${this.rewardLabel(coupon.reward)} · ${coupon.expiresAt}까지`,
        style: new TextStyle({ fill: COLORS.muted, fontSize: 11, lineHeight: 18 }),
      });
      detail.position.set(62, y + 48);
      const state = createBadge(redeemed ? '사용 완료' : '사용 가능', redeemed ? 'secondary' : 'success');
      state.position.set(396, y + 18);
      state.scale.set(0.76);
      this.view.addChild(panel, code, detail, state);
    });

    const input = new UiButton({
      label: '쿠폰 코드 입력', width: 438, height: 58,
      onPress: async () => {
        const current = this.profile;
        if (!current) return;
        const code = window.prompt('쿠폰 코드를 입력하세요', 'LUMERIFT13') ?? '';
        const result = redeemCoupon(current, code);
        if (result.changed) await context.playerRepository.save(result.profile);
        await context.scenes.change(() => new OperationsScene('coupon', result.message));
      },
    });
    input.position.set(51, 734);
    this.view.addChild(input);
  }

  private createToast(message: string): void {
    const panel = createRasterPanel(78, 812, 384, 48, 'toast');
    const text = new Text({
      text: message,
      style: new TextStyle({ fill: COLORS.text, fontSize: 12, fontWeight: '600', align: 'center', wordWrap: true, wordWrapWidth: 350 }),
    });
    text.anchor.set(0.5);
    text.position.set(DESIGN_WIDTH / 2, 836);
    this.view.addChild(panel, text);
  }

  private createIcon(name: string, size: number): Sprite {
    const texture: Texture | undefined = this.sheet?.textures[name];
    const sprite = texture ? new Sprite(texture) : new Sprite();
    sprite.width = size;
    sprite.height = size;
    return sprite;
  }

  private rewardLabel(reward: OperationReward): string {
    const parts: string[] = [];
    if (reward.gold > 0) parts.push(`${reward.gold.toLocaleString()} Gold`);
    if (reward.itemIds.length > 0) parts.push(`장비 ${reward.itemIds.length}개`);
    return parts.join(' · ') || '보상 없음';
  }
}
