import { Container, Sprite, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, PREMIUM_SUPPORT_UI_BUNDLE } from '../core/assets/AssetCatalog';
import { characterAppearanceArchiveRevision, characterAppearanceCloudPath } from '../core/presentation/CharacterAppearanceCloudSync';
import type { Scene } from '../core/scenes/Scene';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { PREMIUM_SUPPORT_UI_V20_KEYS, premiumSupportUiTextureV20 } from '../ui/PremiumSupportUiV20';
import { AppearancePresetManagerScene } from './AppearancePresetManagerScene';
import { CharacterAppearanceConflictScene } from './CharacterAppearanceConflictScene';
import { CharacterAppearanceRecoveryScene } from './CharacterAppearanceRecoveryScene';

export class CharacterAppearanceCloudScene implements Scene {
  public readonly view = new Container();

  public constructor(private readonly message = '') {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');

    await context.assets.loadBundle(PREMIUM_SUPPORT_UI_BUNDLE);
    const uid = session.uid;
    const cloud = context.characterAppearanceCloud.state(uid);
    const archive = context.characterWardrobe.exportPresetArchive();
    const localRevision = characterAppearanceArchiveRevision(archive);
    const remote = cloud.remoteCandidate ?? cloud.conflict?.remote;
    const available = context.characterAppearanceCloud.available;
    const undo = context.characterAppearanceCloud.mergeUndo(uid);
    const changedSinceMerge = Boolean(undo && undo.mergedRevision !== localRevision);

    this.view.addChild(createBackground(
      '외형 프리셋 Cloud Save',
      '사용자 동의 후에만 UID 전용 문서로 동기화하며 충돌은 자동 덮어쓰지 않습니다.',
    ));
    this.view.addChild(createPanel(18, 164, 504, 710));
    const cloudTexture = premiumSupportUiTextureV20(
      context.assets.get<Spritesheet>(ASSET_PATHS.premiumSupportUiV20Atlas),
      PREMIUM_SUPPORT_UI_V20_KEYS.cloud,
    );
    if (cloudTexture) {
      const icon = new Sprite(cloudTexture);
      icon.anchor.set(0.5);
      icon.position.set(486, 108);
      icon.scale.set(0.34);
      icon.alpha = 0.92;
      this.view.addChild(icon);
    }

    const feedback = createInlineFeedback(
      this.message || cloud.lastError || defaultMessage(available, cloud.optIn, Boolean(cloud.conflict), Boolean(cloud.pendingEnvelope)),
      cloud.lastError || cloud.conflict ? 'warning' : this.message ? 'success' : 'neutral',
      468,
    );
    feedback.position.set(36, 176);
    this.view.addChild(feedback);

    const optBadge = createBadge(cloud.optIn ? 'MANUAL OPT-IN · ON' : 'MANUAL OPT-IN · OFF', cloud.optIn ? 'success' : 'warning');
    optBadge.position.set(36, 232);
    const firestoreBadge = createBadge(available ? 'FIRESTORE READY' : 'FIRESTORE UNAVAILABLE', available ? 'primary' : 'warning');
    firestoreBadge.position.set(222, 232);
    this.view.addChild(optBadge, firestoreBadge);

    const statusText = new Text({
      text: [
        `계정 · ${session.displayName} · ${session.anonymous ? 'GUEST AUTH' : session.provider.toUpperCase()}`,
        `경로 · ${characterAppearanceCloudPath(uid)}`,
        `로컬 · ${shortRevision(localRevision)} · Archive v${archive.schemaVersion}`,
        `마지막 동기화 · ${cloud.lastSyncedRevision ? `${shortRevision(cloud.lastSyncedRevision)} · ${formatDate(cloud.lastSyncedAt)}` : '없음'}`,
        `원격 후보 · ${remote ? `${shortRevision(remote.revision)} · ${formatDate(remote.updatedAt)}` : '없음'}`,
        `재시도 큐 · ${cloud.pendingEnvelope ? shortRevision(cloud.pendingEnvelope.revision) : '비어 있음'}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, lineHeight: 19, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    statusText.position.set(36, 278);
    this.view.addChild(statusText);

    const optIn = new UiButton({
      label: cloud.optIn ? 'Cloud Save 동의 철회' : 'Cloud Save 사용 동의',
      subtitle: cloud.optIn ? '원격 데이터는 삭제하지 않음' : '자동 업로드 없음 · 수동 동기화',
      width: 468,
      height: 58,
      tone: cloud.optIn ? 'secondary' : 'primary',
      fontSize: 12,
      subtitleFontSize: 8,
      onPress: async () => {
        context.characterAppearanceCloud.setOptIn(uid, !cloud.optIn);
        await context.scenes.change(() => new CharacterAppearanceCloudScene(
          cloud.optIn ? 'Cloud Save 동의를 철회했습니다. 원격 문서는 유지됩니다.' : 'Cloud Save 사용에 동의했습니다. 아직 업로드하지 않았습니다.',
        ));
      },
    });
    optIn.position.set(36, 410);

    const sync = new UiButton({
      label: '안전 동기화 검사',
      subtitle: '한쪽만 변경되면 반영 · 양쪽 변경은 충돌 중지',
      width: 226,
      height: 58,
      tone: cloud.optIn && available ? 'primary' : 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => {
        try {
          const result = await context.characterAppearanceCloud.sync(uid, context.characterWardrobe.exportPresetArchive());
          await context.scenes.change(() => new CharacterAppearanceCloudScene(result.message));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceCloudScene(errorMessage(error)));
        }
      },
    });
    sync.position.set(36, 482);

    const upload = new UiButton({
      label: '로컬을 Cloud에 저장',
      subtitle: cloud.conflict ? '충돌에서 로컬 선택' : '현재 로컬 통합본 업로드',
      width: 226,
      height: 58,
      tone: cloud.optIn && available ? 'secondary' : 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => {
        try {
          const result = await context.characterAppearanceCloud.upload(uid, context.characterWardrobe.exportPresetArchive());
          await context.scenes.change(() => new CharacterAppearanceCloudScene(result.message));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceCloudScene(errorMessage(error)));
        }
      },
    });
    upload.position.set(278, 482);

    const conflictCenter = new UiButton({
      label: remote ? '충돌 비교·선택 병합' : 'Cloud 비교 후보 없음',
      subtitle: remote ? '슬롯·순서·고정·프리셋 항목별 선택' : '먼저 안전 동기화 검사',
      width: 226,
      height: 58,
      tone: remote ? 'primary' : 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene()),
    });
    conflictCenter.position.set(36, 554);

    const recovery = new UiButton({
      label: '외형 복구 지점',
      subtitle: `${context.characterAppearanceCloud.recoveryPoints(uid).length}/8 · 이름·고정·검색`,
      width: 226,
      height: 58,
      tone: 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene()),
    });
    recovery.position.set(278, 554);

    const undoButton = new UiButton({
      label: undo ? '방금 병합 즉시 실행 취소' : '실행 취소 가능한 병합 없음',
      subtitle: undo
        ? `${Math.max(1, Math.ceil((undo.expiresAt - Date.now()) / 60_000))}분 남음${changedSinceMerge ? ' · 이후 로컬 변경은 복구 지점에 보관' : ' · 로컬·Cloud 함께 복원'}`
        : '충돌 선택 병합 후 30분 동안 1회 제공',
      width: 468,
      height: 58,
      tone: undo ? 'primary' : 'secondary',
      fontSize: 11,
      subtitleFontSize: 8,
      onPress: async () => {
        const point = context.characterAppearanceCloud.mergeUndo(uid);
        if (!point) {
          await context.scenes.change(() => new CharacterAppearanceCloudScene('실행 취소 가능한 병합이 없거나 30분 유효 시간이 지났습니다.'));
          return;
        }
        try {
          const current = context.characterWardrobe.exportPresetArchive();
          context.characterAppearanceCloud.createRecoveryPoint(uid, current, 'pre-merge-undo');
          const restored = context.characterWardrobe.replacePresetArchive(point.archive);
          let resultMessage = '병합 전 로컬 외형으로 되돌렸습니다. Cloud Save는 현재 사용할 수 없어 로컬만 복원했습니다.';
          if (cloud.optIn && available) {
            const result = await context.characterAppearanceCloud.upload(
              uid,
              point.archive,
              Date.now(),
              '병합 전 외형으로 되돌리고 Cloud 통합본도 갱신했습니다.',
            );
            resultMessage = result.message;
          }
          context.characterAppearanceCloud.consumeMergeUndo(uid);
          context.characterAppearanceCloud.recordAudit(uid, {
            action: 'merge-undo-applied',
            title: '외형 병합 즉시 실행 취소',
            revisions: [point.mergedRevision, characterAppearanceArchiveRevision(point.archive)],
            details: { restoredEntries: restored, cloudUploaded: cloud.optIn && available },
          });
          await context.scenes.change(() => new CharacterAppearanceCloudScene(`${restored}개 외형 항목을 즉시 복원했습니다. ${resultMessage}`));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceCloudScene(errorMessage(error)));
        }
      },
    });
    undoButton.position.set(36, 626);

    const policy = new Text({
      text: '보호 정책 · 병합 전 자동 복구 · 30분 1회 실행 취소 · 고정 슬롯 로컬 우선 · UID 격리 · App Check 비활성',
      style: new TextStyle({ fill: COLORS.text, fontSize: 9, lineHeight: 15, fontWeight: '800', wordWrap: true, wordWrapWidth: 468 }),
    });
    policy.position.set(36, 700);

    const back = new UiButton({
      label: '외형 프리셋 보관소로 복귀',
      width: 468,
      height: 54,
      tone: 'primary',
      fontSize: 13,
      onPress: async () => context.scenes.change(() => new AppearancePresetManagerScene()),
    });
    back.position.set(36, 766);

    this.view.addChild(optIn, sync, upload, conflictCenter, recovery, undoButton, policy, back);
  }

  public async exit(): Promise<void> {}

  public update(): void {}
}

function defaultMessage(available: boolean, optIn: boolean, conflict: boolean, queued: boolean): string {
  if (!available) return '현재 Firestore를 사용할 수 없습니다. 로컬 외형 프리셋은 정상적으로 유지됩니다.';
  if (!optIn) return 'Cloud Save는 기본 OFF입니다. 동의 전에는 원격 읽기·쓰기를 실행하지 않습니다.';
  if (queued) return '네트워크 실패로 업로드가 재시도 큐에 있습니다. 안전 동기화 검사로 다시 시도하세요.';
  if (conflict) return '로컬과 Cloud가 각각 변경되었습니다. 로컬 저장 또는 Cloud 병합 중 하나를 선택하세요.';
  return '동의 상태입니다. 안전 동기화 검사를 눌러 변경 방향을 확인하세요.';
}

function shortRevision(value: string): string {
  return value.replace('appearance-', '#').toUpperCase();
}

function formatDate(value: number | undefined): string {
  return value ? new Date(value).toLocaleString('ko-KR') : '없음';
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud Save 처리 중 오류가 발생했습니다.';
}
