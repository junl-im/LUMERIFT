import { Container, Text, TextStyle } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import {
  DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN,
  characterAppearanceLockMergeLabel,
  characterAppearanceMergeSourceLabel,
  characterAppearancePresetMergeLabel,
  cycleCharacterAppearanceLockMerge,
  cycleCharacterAppearanceMergeSource,
  cycleCharacterAppearancePresetMerge,
  previewCharacterAppearanceConflict,
  type CharacterAppearanceMergePlan,
} from '../core/presentation/CharacterAppearanceConflictResolver';
import type { CharacterWardrobeSlotId } from '../core/presentation/CharacterWardrobeController';
import type { Scene } from '../core/scenes/Scene';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { applyCharacterAppearanceConflictMerge } from '../services/cloud/CharacterAppearanceMergeCoordinator';
import { CharacterAppearanceCloudScene } from './CharacterAppearanceCloudScene';
import { CharacterAppearanceConflictPreviewScene } from './CharacterAppearanceConflictPreviewScene';

export class CharacterAppearanceConflictScene implements Scene {
  public readonly view = new Container();

  public constructor(
    private readonly plan: CharacterAppearanceMergePlan = DEFAULT_CHARACTER_APPEARANCE_MERGE_PLAN,
    private readonly message = '',
  ) {}

  public async enter(context: AppContext): Promise<void> {
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const uid = session.uid;
    const cloud = context.characterAppearanceCloud.state(uid);
    const remote = cloud.remoteCandidate ?? cloud.conflict?.remote;
    const local = context.characterWardrobe.exportPresetArchive();

    this.view.addChild(createBackground(
      '외형 충돌 비교·선택 병합',
      '슬롯과 최근 프리셋을 항목별로 선택하며, 고정된 로컬 슬롯은 항상 보호됩니다.',
    ));
    this.view.addChild(createPanel(18, 158, 504, 780));

    if (!remote) {
      const feedback = createInlineFeedback('비교할 Cloud 후보가 없습니다. 먼저 안전 동기화 검사를 실행하세요.', 'warning', 468);
      feedback.position.set(36, 176);
      const back = new UiButton({
        label: 'Cloud Save로 복귀', width: 468, height: 56, tone: 'primary', fontSize: 13,
        onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
      });
      back.position.set(36, 806);
      this.view.addChild(feedback, back);
      return;
    }

    const preview = previewCharacterAppearanceConflict(local, remote.archive);
    const feedback = createInlineFeedback(
      this.message || `차이 ${preview.totalDifferenceCount}개를 확인했습니다. 아래 선택은 적용 버튼을 누르기 전까지 저장되지 않습니다.`,
      this.message ? 'success' : 'neutral',
      468,
    );
    feedback.position.set(36, 172);
    this.view.addChild(feedback);

    const localBadge = createBadge(`LOCAL ${local.presets.length}`, 'primary');
    localBadge.position.set(36, 228);
    const cloudBadge = createBadge(`CLOUD ${remote.archive.presets.length}`, 'warning');
    cloudBadge.position.set(152, 228);
    const diffBadge = createBadge(`DIFF ${preview.totalDifferenceCount}`, preview.totalDifferenceCount ? 'warning' : 'success');
    diffBadge.position.set(278, 228);
    this.view.addChild(localBadge, cloudBadge, diffBadge);

    const summary = new Text({
      text: [
        ...preview.slotDifferences.map((entry) => slotDifferenceLine(entry.slot, entry.status, entry.changedFields, entry.localLocked)),
        `슬롯 순서 · ${preview.slotOrderChanged ? '다름' : '같음'} / 고정 상태 · ${preview.lockedSlotsChanged ? '다름' : '같음'}`,
        `최근 프리셋 · 공통 ${preview.sharedPresetCount} / 로컬 전용 ${preview.localOnlyPresetCount} / Cloud 전용 ${preview.remoteOnlyPresetCount} / 수정 충돌 ${preview.changedPresetCount}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, lineHeight: 17, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    summary.position.set(36, 270);
    this.view.addChild(summary);

    const slot1 = this.sourceButton('슬롯 1', this.plan.slots[1], 36, 374, async () => this.cycleSlot(context, 1));
    const slot2 = this.sourceButton('슬롯 2', this.plan.slots[2], 278, 374, async () => this.cycleSlot(context, 2));
    const slot3 = this.sourceButton('슬롯 3', this.plan.slots[3], 36, 432, async () => this.cycleSlot(context, 3));
    const order = new UiButton({
      label: `슬롯 순서 · ${this.plan.slotOrder === 'local' ? '로컬' : 'CLOUD'}`,
      subtitle: '표시 순서만 선택', width: 226, height: 50, tone: 'secondary', fontSize: 10, subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene({
        ...this.plan,
        slotOrder: this.plan.slotOrder === 'local' ? 'remote' : 'local',
      })),
    });
    order.position.set(278, 432);

    const locks = new UiButton({
      label: `고정 상태 · ${characterAppearanceLockMergeLabel(this.plan.lockedSlots)}`,
      subtitle: '로컬 고정 슬롯 내용은 항상 보호', width: 226, height: 50, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene({
        ...this.plan,
        lockedSlots: cycleCharacterAppearanceLockMerge(this.plan.lockedSlots),
      })),
    });
    locks.position.set(36, 490);

    const presets = new UiButton({
      label: `최근 프리셋 · ${characterAppearancePresetMergeLabel(this.plan.presets)}`,
      subtitle: '선택 병합은 중복 외형 제거·최신 우선', width: 226, height: 50, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene({
        ...this.plan,
        presets: cycleCharacterAppearancePresetMerge(this.plan.presets),
      })),
    });
    presets.position.set(278, 490);

    const simulate = new UiButton({
      label: '최종 캐릭터 미리보기',
      subtitle: 'LOCAL · CLOUD · RESULT 실제 본체 비교', width: 468, height: 56, tone: 'secondary', fontSize: 12, subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictPreviewScene(this.plan)),
    });
    simulate.position.set(36, 566);

    const apply = new UiButton({
      label: '선택 내용 병합·Cloud 저장',
      subtitle: '복구 지점 + 30분 즉시 실행 취소 생성', width: 468, height: 60, tone: 'primary', fontSize: 12, subtitleFontSize: 8,
      onPress: async () => {
        try {
          const result = await applyCharacterAppearanceConflictMerge(context, uid, remote, this.plan);
          await context.scenes.change(() => new CharacterAppearanceCloudScene(
            `${result.replacedEntries}개 외형 항목을 선택 병합했습니다. 30분 동안 즉시 실행 취소할 수 있습니다. ${result.message}`,
          ));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceConflictScene(this.plan, errorMessage(error)));
        }
      },
    });
    apply.position.set(36, 630);

    const localAll = new UiButton({
      label: '전체 로컬 선택', subtitle: 'Cloud를 현재 로컬로 교체', width: 226, height: 54, tone: 'secondary', fontSize: 10, subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene({
        slots: { 1: 'local', 2: 'local', 3: 'local' }, slotOrder: 'local', lockedSlots: 'local', presets: 'local',
      }, '모든 항목을 로컬로 선택했습니다. 적용 전까지 저장되지 않습니다.')),
    });
    localAll.position.set(36, 704);

    const remoteAll = new UiButton({
      label: '전체 Cloud 선택', subtitle: '로컬 고정 슬롯만 예외 보호', width: 226, height: 54, tone: 'secondary', fontSize: 10, subtitleFontSize: 8,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictScene({
        slots: { 1: 'remote', 2: 'remote', 3: 'remote' }, slotOrder: 'remote', lockedSlots: 'remote', presets: 'remote',
      }, '모든 항목을 Cloud로 선택했습니다. 로컬 고정 슬롯 내용은 계속 보호됩니다.')),
    });
    remoteAll.position.set(278, 704);

    const close = new UiButton({
      label: '후보 닫기', width: 226, height: 52, tone: 'secondary', fontSize: 11,
      onPress: async () => {
        context.characterAppearanceCloud.clearConflict(uid);
        await context.scenes.change(() => new CharacterAppearanceCloudScene('충돌 후보만 닫았습니다. 로컬과 Cloud 데이터는 변경하지 않았습니다.'));
      },
    });
    close.position.set(36, 770);

    const back = new UiButton({
      label: 'Cloud Save로 복귀', width: 226, height: 52, tone: 'secondary', fontSize: 11,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
    });
    back.position.set(278, 770);

    const policy = new Text({
      text: '병합 보호 · 적용 전 자동 복구 · 고정 슬롯 로컬 우선 · UID 격리 · Player Save v4와 분리',
      style: new TextStyle({ fill: COLORS.text, fontSize: 9, lineHeight: 15, fontWeight: '800', wordWrap: true, wordWrapWidth: 468 }),
    });
    policy.position.set(36, 838);

    this.view.addChild(slot1, slot2, slot3, order, locks, presets, simulate, apply, localAll, remoteAll, close, back, policy);
  }

  public async exit(): Promise<void> {}

  public update(): void {}

  private sourceButton(label: string, source: CharacterAppearanceMergePlan['slots'][1], x: number, y: number, onPress: () => Promise<void>): UiButton {
    const button = new UiButton({
      label: `${label} · ${characterAppearanceMergeSourceLabel(source)}`,
      subtitle: source === 'newer' ? 'savedAt 기준, 로컬 고정 우선' : '버튼을 눌러 선택 전환',
      width: 226, height: 50, tone: source === 'newer' ? 'primary' : 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress,
    });
    button.position.set(x, y);
    return button;
  }

  private async cycleSlot(context: AppContext, slot: CharacterWardrobeSlotId): Promise<void> {
    await context.scenes.change(() => new CharacterAppearanceConflictScene({
      ...this.plan,
      slots: { ...this.plan.slots, [slot]: cycleCharacterAppearanceMergeSource(this.plan.slots[slot]) },
    }));
  }
}

function slotDifferenceLine(
  slot: CharacterWardrobeSlotId,
  status: 'identical' | 'local-only' | 'remote-only' | 'different',
  fields: readonly string[],
  localLocked: boolean,
): string {
  const statusLabel = status === 'identical' ? '같음' : status === 'local-only' ? '로컬만' : status === 'remote-only' ? 'Cloud만' : `다름(${fields.map(fieldLabel).join(',')})`;
  return `슬롯 ${slot}${localLocked ? ' 🔒' : ''} · ${statusLabel}`;
}

function fieldLabel(value: string): string {
  const labels: Readonly<Record<string, string>> = {
    name: '이름', favorite: '즐겨찾기', dye: '염색', pose: '포즈', direction: '방향', costume: '세트', channels: '채널', preset: '프리셋',
  };
  return labels[value] ?? value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '외형 충돌 병합 중 오류가 발생했습니다.';
}
