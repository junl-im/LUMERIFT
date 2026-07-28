import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import type { Scene } from '../core/scenes/Scene';
import type { SaveRecoveryPoint } from '../services/cloud/SaveRecoveryStore';
import { recoveryReasonLabel } from '../services/cloud/SaveRecoveryStore';
import { createBackground } from '../ui/SceneChrome';
import { createRasterPanel } from '../ui/UiSkin';
import { createBadge } from '../ui/PremiumUi';
import { UiButton } from '../ui/UiButton';
import { AccountScene } from './AccountScene';
import { LoginScene } from './LoginScene';

export class RecoveryScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) {
      await context.scenes.change(() => new LoginScene());
      return;
    }

    const points = context.playerRepository.listRecoveryPoints(session.uid);
    this.view.addChild(createBackground('저장 복구 지점', 'Cloud Save 덮어쓰기 전 상태를 최대 5개까지 보관합니다.'));

    const summaryPanel = createRasterPanel(24, 150, 492, 92, 'panel_strong');
    const badge = createBadge(`${points.length} / 5`, points.length >= 5 ? 'warning' : 'success');
    badge.position.set(42, 170);
    const helper = new Text({
      text: '복원하면 해당 저장이 최신 로컬 상태가 되고 Cloud Save 동기화를 다시 시도합니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, wordWrap: true, wordWrapWidth: 285 }),
    });
    helper.position.set(42, 205);
    const create = new UiButton({
      label: '현재 상태 백업', width: 158, height: 48, fontSize: 12,
      onPress: async () => {
        const point = await context.playerRepository.createRecoveryPoint(session.uid, 'manual');
        const result = point ? '현재 로컬 저장을 복구 지점으로 보관했습니다.' : '백업할 로컬 저장이 없습니다.';
        await context.scenes.change(() => new RecoveryScene(result));
      },
    });
    create.position.set(340, 172);
    this.view.addChild(summaryPanel, badge, helper, create);

    if (points.length === 0) {
      const emptyPanel = createRasterPanel(24, 262, 492, 430, 'panel');
      const empty = new Text({
        text: '아직 복구 지점이 없습니다.\n클라우드 다운로드·자동 병합·로그아웃 전에 자동으로 생성됩니다.',
        style: new TextStyle({ fill: COLORS.muted, fontSize: 15, align: 'center', lineHeight: 25 }),
      });
      empty.anchor.set(0.5);
      empty.position.set(270, 470);
      this.view.addChild(emptyPanel, empty);
    } else {
      points.slice(0, 5).forEach((point, index) => this.createRecoveryRow(context, point, index));
    }

    if (this.message) {
      const status = new Text({
        text: this.message,
        style: new TextStyle({ fill: 0xf2d58a, fontSize: 12, align: 'center', wordWrap: true, wordWrapWidth: 470 }),
      });
      status.anchor.set(0.5, 0);
      status.position.set(270, 830);
      this.view.addChild(status);
    }

    const back = new UiButton({
      label: '계정 관리로 돌아가기', width: 484, height: 54, tone: 'secondary',
      onPress: async () => context.scenes.change(() => new AccountScene()),
    });
    back.position.set(28, 884);
    this.view.addChild(back);
  }

  public exit(): void {}
  public update(): void {}

  private createRecoveryRow(context: AppContext, point: SaveRecoveryPoint, index: number): void {
    const y = 258 + index * 108;
    const panel = createRasterPanel(24, y, 492, 96, index === 0 ? 'slot_selected' : 'slot');
    const reason = new Text({
      text: recoveryReasonLabel(point.reason),
      style: new TextStyle({ fill: index === 0 ? 0xf3d58b : COLORS.text, fontSize: 13, fontWeight: '700' }),
    });
    reason.position.set(42, y + 14);
    const summary = new Text({
      text: `Lv.${point.profile.level} · Stage ${point.profile.highestStage} · Gold ${point.profile.gold.toLocaleString()}\n${formatDate(point.createdAt)} · 저장 ${formatDate(point.profile.updatedAt)}`,
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, lineHeight: 17 }),
    });
    summary.position.set(42, y + 39);

    const restore = new UiButton({
      label: '복원', width: 92, height: 38, fontSize: 11,
      onPress: async () => {
        const restored = await context.playerRepository.restoreRecoveryPoint(point.uid, point.id);
        await context.scenes.change(() => new AccountScene(restored
          ? '복구 지점을 현재 저장으로 복원했습니다.'
          : '복구 지점을 찾지 못했습니다.'));
      },
    });
    restore.position.set(392, y + 12);
    const remove = new UiButton({
      label: '삭제', width: 92, height: 34, tone: 'danger', fontSize: 10,
      onPress: async () => {
        context.playerRepository.removeRecoveryPoint(point.uid, point.id);
        await context.scenes.change(() => new RecoveryScene('선택한 복구 지점을 삭제했습니다.'));
      },
    });
    remove.position.set(392, y + 54);
    this.view.addChild(panel, reason, summary, restore, remove);
  }
}

function formatDate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '시각 정보 없음';
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}
