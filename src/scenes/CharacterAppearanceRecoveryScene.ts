import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { downloadJson, openJsonFile } from '../core/files/JsonFileTransfer';
import { characterAppearanceArchiveRevision } from '../core/presentation/CharacterAppearanceCloudSync';
import type { Scene } from '../core/scenes/Scene';
import {
  CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT,
  CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT,
  characterAppearanceRecoveryReasonLabel,
} from '../services/cloud/CharacterAppearanceRecoveryStore';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { promptTextValue } from '../ui/TextPromptOverlay';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { CharacterAppearanceCloudScene } from './CharacterAppearanceCloudScene';
import { CharacterAppearanceRecoveryCompareScene } from './CharacterAppearanceRecoveryCompareScene';

export class CharacterAppearanceRecoveryScene implements Scene {
  public readonly view = new Container();

  public constructor(
    private readonly selectedIndex = 0,
    private readonly message = '',
    private readonly query = '',
  ) {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const uid = session.uid;
    const allPoints = context.characterAppearanceCloud.recoveryPoints(uid);
    const points = context.characterAppearanceCloud.recoveryPoints(uid, this.query);
    const safeIndex = points.length ? Math.max(0, Math.min(points.length - 1, this.selectedIndex)) : 0;
    const selected = points[safeIndex];
    const pinnedCount = allPoints.filter((point) => point.pinned).length;
    const recentCount = allPoints.filter((point) => !point.pinned).length;
    const compareTarget = selected && points.length > 1
      ? points[(safeIndex + 1) % points.length]
      : undefined;
    const auditCount = context.characterAppearanceCloud.auditRecords(uid).length;

    this.view.addChild(createBackground(
      '외형 프리셋 복구 센터',
      '이름·고정·검색을 지원하며, 고정 3개와 최근 자동 복구 5개를 UID별로 분리 보관합니다.',
    ));
    this.view.addChild(createPanel(18, 158, 504, 788));

    const feedback = createInlineFeedback(
      this.message || (selected ? '복구 지점을 선택해 이름 변경·고정·복구·내보내기를 실행할 수 있습니다.' : this.query ? '검색 결과가 없습니다.' : '아직 저장된 외형 복구 지점이 없습니다.'),
      this.message ? 'success' : selected ? 'neutral' : 'warning',
      468,
    );
    feedback.position.set(36, 174);
    this.view.addChild(feedback);

    const countBadge = createBadge(`RECENT ${recentCount}/${CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT}`, recentCount ? 'primary' : 'warning');
    countBadge.position.set(36, 230);
    const pinBadge = createBadge(`PIN ${pinnedCount}/${CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT}`, pinnedCount ? 'success' : 'warning');
    pinBadge.position.set(196, 230);
    const searchBadge = createBadge(this.query ? `SEARCH ${points.length}` : 'SEARCH ALL', this.query ? 'primary' : 'success');
    searchBadge.position.set(322, 230);
    this.view.addChild(countBadge, pinBadge, searchBadge);

    const detail = new Text({
      text: selected ? [
        `선택 · ${safeIndex + 1}/${points.length} · ${selected.pinned ? '★ PINNED' : 'RECENT'}`,
        `이름 · ${selected.name}`,
        `사유 · ${characterAppearanceRecoveryReasonLabel(selected.reason)}`,
        `생성 · ${new Date(selected.createdAt).toLocaleString('ko-KR')}`,
        `revision · ${shortRevision(characterAppearanceArchiveRevision(selected.archive))}`,
        `슬롯 · ${[1, 2, 3].filter((slot) => selected.archive.slots[slot as 1 | 2 | 3]).length}/3 · 최근 프리셋 ${selected.archive.presets.length}/5`,
        `고정 슬롯 · ${[1, 2, 3].filter((slot) => selected.archive.lockedSlots[slot as 1 | 2 | 3]).join(', ') || '없음'}`,
        `감사 기록 · ${auditCount}개 · 비교 대상 ${compareTarget?.name ?? '없음'}`,
      ].join('\n') : [
        '자동 복구는 Cloud 업로드·가져오기·충돌 병합·실행 취소 직전에 생성됩니다.',
        '고정 지점은 최근 5개 자동 정리 대상에서 제외되며 최대 3개까지 유지됩니다.',
        this.query ? `검색어 · ${this.query}` : '검색어 · 전체',
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 10, lineHeight: 19, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    detail.position.set(36, 278);
    this.view.addChild(detail);

    const previous = new UiButton({
      label: '← 이전 지점', width: 226, height: 48, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene(points.length ? (safeIndex - 1 + points.length) % points.length : 0, '', this.query)),
    });
    previous.position.set(36, 442);
    const next = new UiButton({
      label: '다음 지점 →', width: 226, height: 48, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene(points.length ? (safeIndex + 1) % points.length : 0, '', this.query)),
    });
    next.position.set(278, 442);

    const search = new UiButton({
      label: this.query ? `검색 · ${truncate(this.query, 14)}` : '복구 지점 검색',
      subtitle: '이름·사유·날짜·revision', width: 226, height: 52, tone: this.query ? 'primary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        const value = await promptTextValue({
          title: '복구 지점 검색',
          description: '복구 지점 이름, 사유, 날짜 또는 revision 일부를 입력하세요.',
          kicker: 'RECOVERY SEARCH',
          placeholder: '예: 충돌 병합 전',
          initialValue: this.query,
          submitLabel: '검색',
          maxLength: 36,
        });
        if (value === null) return;
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, `“${value}” 검색 결과를 표시합니다.`, value));
      },
    });
    search.position.set(36, 500);

    const rename = new UiButton({
      label: '선택 지점 이름 변경', subtitle: selected?.name ?? '복구 지점 필요', width: 226, height: 52, tone: selected ? 'secondary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        if (!selected) return;
        const value = await promptTextValue({
          title: '복구 지점 이름 변경',
          description: '나중에 찾기 쉬운 이름을 입력하세요.',
          kicker: 'RECOVERY LABEL',
          placeholder: '외형 복구 지점',
          initialValue: selected.name,
          submitLabel: '이름 저장',
          maxLength: 36,
        });
        if (value === null) return;
        const renamed = context.characterAppearanceCloud.renameRecoveryPoint(uid, selected.id, value);
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, renamed ? `복구 지점 이름을 “${renamed.name}”으로 변경했습니다.` : '이름을 변경할 복구 지점을 찾지 못했습니다.', this.query));
      },
    });
    rename.position.set(278, 500);

    const pin = new UiButton({
      label: selected?.pinned ? '선택 고정 해제' : '선택 지점 고정',
      subtitle: selected ? '고정 지점은 최근 자동 정리에서 제외' : '복구 지점 필요', width: 226, height: 52, tone: selected?.pinned ? 'primary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        if (!selected) return;
        const result = context.characterAppearanceCloud.toggleRecoveryPointPin(uid, selected.id);
        const resultMessage = result === 'pinned'
          ? '선택한 복구 지점을 고정했습니다.'
          : result === 'unpinned'
            ? '선택한 복구 지점 고정을 해제했습니다.'
            : result === 'limit'
              ? `고정 지점은 최대 ${CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT}개까지 설정할 수 있습니다.`
              : '고정할 복구 지점을 찾지 못했습니다.';
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, resultMessage, this.query));
      },
    });
    pin.position.set(36, 560);

    const manual = new UiButton({
      label: '현재 상태 수동 백업', subtitle: '최근 목록에 저장 · 고정 가능', width: 226, height: 52, tone: 'primary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        context.characterAppearanceCloud.createRecoveryPoint(uid, context.characterWardrobe.exportPresetArchive(), 'manual');
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, '현재 외형 상태를 새 복구 지점으로 저장했습니다.'));
      },
    });
    manual.position.set(278, 560);

    const compare = new UiButton({
      label: compareTarget ? '선택 지점 차이 비교' : '비교할 복구 지점 없음',
      subtitle: compareTarget ? `다음 지점 · ${truncate(compareTarget.name, 18)}` : '복구 지점 2개 이상 필요', width: 226, height: 52, tone: compareTarget ? 'primary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        if (!selected || !compareTarget) return;
        await context.scenes.change(() => new CharacterAppearanceRecoveryCompareScene(selected.id, compareTarget.id));
      },
    });
    compare.position.set(36, 620);

    const restore = new UiButton({
      label: '선택 지점 복구', subtitle: selected ? '현재 상태도 먼저 자동 백업' : '복구 지점 필요', width: 226, height: 52, tone: selected ? 'primary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        if (!selected) return;
        context.characterAppearanceCloud.createRecoveryPoint(uid, context.characterWardrobe.exportPresetArchive(), 'pre-recovery-restore');
        const restored = context.characterWardrobe.replacePresetArchive(selected.archive);
        context.characterAppearanceCloud.recordAudit(uid, {
          action: 'recovery-restored',
          title: selected.name,
          recoveryPointIds: [selected.id],
          revisions: [characterAppearanceArchiveRevision(selected.archive)],
          details: { restoredEntries: restored, cloudUploaded: false },
        });
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, `${restored}개 외형 항목을 복구했습니다. Cloud에는 자동 업로드하지 않았습니다.`));
      },
    });
    restore.position.set(278, 620);

    const exportButton = new UiButton({
      label: '복구 묶음 내보내기', subtitle: 'v2 · 이름·고정 포함', width: 226, height: 52, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        downloadJson(`LUMERIFT_APPEARANCE_RECOVERY_${dateKey()}.json`, context.characterAppearanceCloud.exportRecoveryArchive(uid));
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, '외형 복구 묶음 v2 JSON을 저장했습니다.', this.query));
      },
    });
    exportButton.position.set(36, 680);

    const importButton = new UiButton({
      label: '복구 묶음 가져오기', subtitle: 'v1 자동 마이그레이션 · UID 검사', width: 226, height: 52, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        try {
          const value = await openJsonFile();
          if (value === null) return;
          const imported = context.characterAppearanceCloud.importRecoveryArchive(uid, value);
          await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, imported ? `${imported}개 복구 지점을 가져왔습니다.` : '현재 계정의 올바른 외형 복구 JSON이 아닙니다.'));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, errorMessage(error), this.query));
        }
      },
    });
    importButton.position.set(278, 680);

    const auditExport = new UiButton({
      label: '외형 감사 기록 내보내기', subtitle: `계정 기록 ${auditCount}개 · UID 격리`, width: 226, height: 52, tone: auditCount ? 'secondary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        downloadJson(`LUMERIFT_APPEARANCE_AUDIT_${dateKey()}.json`, context.characterAppearanceCloud.exportAuditArchive(uid));
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(safeIndex, `${auditCount}개 외형 감사 기록을 저장했습니다.`, this.query));
      },
    });
    auditExport.position.set(36, 740);

    const remove = new UiButton({
      label: '선택 지점 삭제', subtitle: selected?.pinned ? '고정 지점도 명시적으로 삭제 가능' : '선택 항목만 삭제', width: 226, height: 52, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        if (!selected) return;
        const deleted = context.characterAppearanceCloud.deleteRecoveryPoint(uid, selected.id);
        await context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, deleted ? '선택한 복구 지점을 삭제했습니다.' : '삭제할 복구 지점이 없습니다.', this.query));
      },
    });
    remove.position.set(278, 740);

    const clearSearch = new UiButton({
      label: this.query ? '검색 초기화' : '검색 없음', width: 226, height: 48, tone: this.query ? 'primary' : 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryScene(0, this.query ? '전체 복구 지점을 표시합니다.' : '', '')),
    });
    clearSearch.position.set(36, 800);

    const cloud = new UiButton({
      label: 'Cloud Save로 복귀', width: 226, height: 48, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
    });
    cloud.position.set(278, 800);

    const policy = new Text({
      text: '복구 정책 · UID 일치 필수 · 고정 3 + 최근 5 · 복구 전 재백업 · 복구 후 Cloud 자동 업로드 금지',
      style: new TextStyle({ fill: COLORS.text, fontSize: 9, lineHeight: 15, fontWeight: '800', wordWrap: true, wordWrapWidth: 468 }),
    });
    policy.position.set(36, 858);

    this.view.addChild(previous, next, search, rename, pin, manual, compare, restore, exportButton, importButton, auditExport, remove, clearSearch, cloud, policy);
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

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '외형 복구 처리 중 오류가 발생했습니다.';
}
