import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { downloadJson, openJsonFile } from '../core/files/JsonFileTransfer';
import { characterAppearanceArchiveRevision } from '../core/presentation/CharacterAppearanceCloudSync';
import type { Scene } from '../core/scenes/Scene';
import { characterAppearanceRecoveryReasonLabel } from '../services/cloud/CharacterAppearanceRecoveryStore';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { CharacterAppearanceCloudScene } from './CharacterAppearanceCloudScene';

export class CharacterAppearanceRecoveryScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly selectedIndex = 0, private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const uid = session.uid;
    const points = context.characterAppearanceCloud.recoveryPoints(uid);
    const safeIndex = points.length ? Math.max(0, Math.min(points.length - 1, this.selectedIndex)) : 0;
    const selected = points[safeIndex];

    this.view.addChild(createBackground(
      '외형 프리셋 수동 복구',
      'Cloud 작업 전 자동 백업과 수동 백업을 계정별로 최대 5개까지 보관합니다.',
    ));
    this.view.addChild(createPanel(18, 160, 504, 724));

    const feedback = createInlineFeedback(
      this.message || (selected ? '복구 지점을 선택한 뒤 적용·내보내기·삭제할 수 있습니다.' : '아직 저장된 외형 복구 지점이 없습니다.'),
      this.message ? 'success' : selected ? 'neutral' : 'warning',
      468,
    );
    feedback.position.set(36, 176);
    this.view.addChild(feedback);

    const countBadge = createBadge(`RECOVERY ${points.length}/5`, points.length ? 'primary' : 'warning');
    countBadge.position.set(36, 232);
    const ownerBadge = createBadge('UID ISOLATED', 'success');
    ownerBadge.position.set(196, 232);
    this.view.addChild(countBadge, ownerBadge);

    const detail = new Text({
      text: selected ? [
        `선택 · ${safeIndex + 1}/${points.length}`,
        `사유 · ${characterAppearanceRecoveryReasonLabel(selected.reason)}`,
        `생성 · ${new Date(selected.createdAt).toLocaleString('ko-KR')}`,
        `revision · ${shortRevision(characterAppearanceArchiveRevision(selected.archive))}`,
        `슬롯 · ${[1, 2, 3].filter((slot) => selected.archive.slots[slot as 1 | 2 | 3]).length}/3 · 최근 프리셋 ${selected.archive.presets.length}/5`,
        `고정 · ${[1, 2, 3].filter((slot) => selected.archive.lockedSlots[slot as 1 | 2 | 3]).join(', ') || '없음'}`,
      ].join('\n') : '자동 복구는 Cloud 업로드·가져오기·충돌 병합 직전에 생성됩니다.\n수동 백업 버튼으로 현재 외형 상태를 즉시 보관할 수도 있습니다.',
      style: new TextStyle({ fill: COLORS.muted, fontSize: 11, lineHeight: 22, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    detail.position.set(36, 282);
    this.view.addChild(detail);

    const previous = new UiButton({
      label: '이전 복구 지점', width: 226, height: 52, tone: 'secondary', fontSize: 11,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene(points.length ? (safeIndex - 1 + points.length) % points.length : 0)),
    });
    previous.position.set(36, 444);
    const next = new UiButton({
      label: '다음 복구 지점', width: 226, height: 52, tone: 'secondary', fontSize: 11,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene(points.length ? (safeIndex + 1) % points.length : 0)),
    });
    next.position.set(278, 444);

    const manual = new UiButton({
      label: '현재 상태 수동 백업', subtitle: '가장 오래된 항목부터 자동 정리', width: 226, height: 58, tone: 'primary', fontSize: 11, subtitleFontSize: 8,
      onPress: async () => {
        context.characterAppearanceCloud.createRecoveryPoint(uid, context.characterWardrobe.exportPresetArchive(), 'manual');
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, '현재 외형 상태를 새 복구 지점으로 저장했습니다.'));
      },
    });
    manual.position.set(36, 510);

    const restore = new UiButton({
      label: '선택 지점 복구', subtitle: selected ? '현재 상태도 먼저 자동 백업' : '복구 지점 필요', width: 226, height: 58, tone: selected ? 'primary' : 'secondary', fontSize: 11, subtitleFontSize: 8,
      onPress: async () => {
        if (!selected) return;
        context.characterAppearanceCloud.createRecoveryPoint(uid, context.characterWardrobe.exportPresetArchive(), 'pre-recovery-restore');
        const restored = context.characterWardrobe.replacePresetArchive(selected.archive);
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, `${restored}개 외형 항목을 복구했습니다. Cloud에는 자동 업로드하지 않았습니다.`));
      },
    });
    restore.position.set(278, 510);

    const exportButton = new UiButton({
      label: '복구 묶음 내보내기', width: 226, height: 52, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        downloadJson(`LUMERIFT_APPEARANCE_RECOVERY_${dateKey()}.json`, context.characterAppearanceCloud.exportRecoveryArchive(uid));
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, '외형 복구 묶음 JSON을 저장했습니다.'));
      },
    });
    exportButton.position.set(36, 582);

    const importButton = new UiButton({
      label: '복구 묶음 가져오기', width: 226, height: 52, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        try {
          const value = await openJsonFile();
          if (value === null) return;
          const imported = context.characterAppearanceCloud.importRecoveryArchive(uid, value);
          await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, imported ? `${imported}개 복구 지점을 가져왔습니다.` : '현재 계정의 올바른 외형 복구 JSON이 아닙니다.'));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, errorMessage(error)));
        }
      },
    });
    importButton.position.set(278, 582);

    const remove = new UiButton({
      label: '선택 지점 삭제', width: 226, height: 52, tone: 'secondary', fontSize: 10,
      onPress: async () => {
        if (!selected) return;
        const deleted = context.characterAppearanceCloud.deleteRecoveryPoint(uid, selected.id);
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, deleted ? '선택한 복구 지점을 삭제했습니다.' : '삭제할 복구 지점이 없습니다.'));
      },
    });
    remove.position.set(36, 648);

    const cloud = new UiButton({
      label: 'Cloud Save로 복귀', width: 226, height: 52, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
    });
    cloud.position.set(278, 648);

    const policy = new Text({
      text: '복구 정책 · 계정 UID 일치 필수 · 복구 적용 전 현재 상태 재백업 · 복구 후 Cloud 자동 업로드 금지',
      style: new TextStyle({ fill: COLORS.text, fontSize: 9, lineHeight: 15, fontWeight: '800', wordWrap: true, wordWrapWidth: 468 }),
    });
    policy.position.set(36, 720);

    this.view.addChild(previous, next, manual, restore, exportButton, importButton, remove, cloud, policy);
  }

  public async exit(): Promise<void> {}

  public update(): void {}
}

function shortRevision(value: string): string {
  return value.replace('appearance-', '#').toUpperCase();
}

function dateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '외형 복구 처리 중 오류가 발생했습니다.';
}
