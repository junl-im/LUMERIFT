import { Container, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, WARDROBE_UI_BUNDLE } from '../core/assets/AssetCatalog';
import {
  simulateCharacterAppearanceMerge,
  type CharacterAppearanceMergePlan,
} from '../core/presentation/CharacterAppearanceConflictResolver';
import type { CharacterWardrobeSlotId } from '../core/presentation/CharacterWardrobeController';
import type { Scene } from '../core/scenes/Scene';
import { ensureStarterInventory } from '../game/items/inventoryLogic';
import { CharacterAppearanceSnapshotCard } from '../game/presentation/CharacterAppearanceSnapshotCard';
import { createDefaultProfile } from '../repositories/PlayerRepository';
import { applyCharacterAppearanceConflictMerge } from '../services/cloud/CharacterAppearanceMergeCoordinator';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';
import { CharacterAppearanceCloudScene } from './CharacterAppearanceCloudScene';

export class CharacterAppearanceConflictPreviewScene implements Scene {
  public readonly view = new Container();
  private readonly cards: CharacterAppearanceSnapshotCard[] = [];
  private context?: AppContext;
  private bundleLoaded = false;
  private elapsed = 0;

  public constructor(
    private readonly plan: CharacterAppearanceMergePlan,
    private readonly slot: CharacterWardrobeSlotId = 1,
    private readonly message = '',
  ) {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const cloud = context.characterAppearanceCloud.state(session.uid);
    const remote = cloud.remoteCandidate ?? cloud.conflict?.remote;

    this.view.addChild(createBackground(
      '외형 병합 결과 시뮬레이션',
      '로컬·Cloud·최종 결과를 실제 캐릭터 본체와 장비 레이어로 나란히 비교합니다.',
    ));
    this.view.addChild(createPanel(18, 158, 504, 770));

    if (!remote) {
      const feedback = createInlineFeedback('비교할 Cloud 후보가 없습니다. 안전 동기화 검사부터 실행하세요.', 'warning', 468);
      feedback.position.set(36, 176);
      const back = new UiButton({
        label: 'Cloud Save로 복귀', width: 468, height: 56, tone: 'primary', fontSize: 13,
        onPress: async () => context.scenes.change(() => new CharacterAppearanceCloudScene()),
      });
      back.position.set(36, 842);
      this.view.addChild(feedback, back);
      return;
    }

    await context.assets.loadBundle(WARDROBE_UI_BUNDLE);
    this.bundleLoaded = true;
    const profile = ensureStarterInventory(
      await context.playerRepository.load(session.uid) ?? createDefaultProfile(session.uid, session.displayName),
      context.gameData,
    );
    const playerSheet = context.assets.get<Spritesheet>(ASSET_PATHS.playerAtlas);
    const attackSheet = context.assets.get<Spritesheet>(ASSET_PATHS.weaponAttackBodyAtlas);
    const local = context.characterWardrobe.exportPresetArchive();
    const simulation = simulateCharacterAppearanceMerge(local, remote.archive, this.plan);
    const slotResult = simulation.slots.find((entry) => entry.slot === this.slot);
    const changedFields = simulation.preview.slotDifferences.find((entry) => entry.slot === this.slot)?.changedFields ?? [];

    const feedback = createInlineFeedback(
      this.message || `SLOT ${this.slot}의 실제 외형과 최종 선택 결과입니다. 아직 로컬·Cloud에는 적용되지 않았습니다.`,
      this.message ? 'warning' : 'neutral',
      468,
    );
    feedback.position.set(36, 174);
    this.view.addChild(feedback);

    const slotBadge = createBadge(`SLOT ${this.slot}`, 'primary');
    slotBadge.position.set(36, 226);
    const sourceBadge = createBadge(`RESULT ${effectiveSourceLabel(slotResult?.effectiveSource)}`, 'warning');
    sourceBadge.position.set(148, 226);
    const diffBadge = createBadge(`FIELDS ${changedFields.length}`, changedFields.length ? 'warning' : 'success');
    diffBadge.position.set(318, 226);
    this.view.addChild(slotBadge, sourceBadge, diffBadge);

    const cardInputs = [
      { title: 'LOCAL', source: 'local' as const, preset: local.slots[this.slot], locked: local.lockedSlots[this.slot] },
      { title: 'CLOUD', source: 'remote' as const, preset: remote.archive.slots[this.slot], locked: remote.archive.lockedSlots[this.slot] },
      { title: 'RESULT', source: 'result' as const, preset: simulation.archive.slots[this.slot], locked: simulation.archive.lockedSlots[this.slot] },
    ];
    cardInputs.forEach((input, index) => {
      const card = new CharacterAppearanceSnapshotCard({
        ...input,
        profile,
        registry: context.gameData,
        sheet: playerSheet,
        attackSheet,
        changedFields,
        width: 148,
        height: 424,
      });
      card.view.position.set(28 + index * 168, 270);
      this.cards.push(card);
      this.view.addChild(card.view);
    });

    const previous = new UiButton({
      label: '← 이전 슬롯', width: 148, height: 48, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictPreviewScene(this.plan, previousSlot(this.slot))),
    });
    previous.position.set(28, 710);
    const current = new UiButton({
      label: `SLOT ${this.slot} · ${slotResult?.protectedByLocalLock ? 'LOCK 보호' : effectiveSourceLabel(slotResult?.effectiveSource)}`,
      width: 148, height: 48, tone: slotResult?.protectedByLocalLock ? 'primary' : 'secondary', fontSize: 9,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictPreviewScene(this.plan, this.slot)),
    });
    current.position.set(196, 710);
    const next = new UiButton({
      label: '다음 슬롯 →', width: 148, height: 48, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceConflictPreviewScene(this.plan, nextSlot(this.slot))),
    });
    next.position.set(364, 710);

    const summary = new Text({
      text: [
        ...simulation.resultSummary,
        `S${this.slot} 선택 · ${slotResult ? effectiveSourceLabel(slotResult.effectiveSource) : 'EMPTY'}${slotResult?.protectedByLocalLock ? ' · 로컬 고정 보호' : ''}`,
        `변경 강조 · ${changedFields.length ? changedFields.map(fieldLabel).join(' · ') : '차이 없음'}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, lineHeight: 16, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    summary.position.set(36, 774);

    const back = new UiButton({
      label: '선택 화면으로 복귀', width: 226, height: 54, tone: 'secondary', fontSize: 11,
      onPress: async () => {
        const module = await import('./CharacterAppearanceConflictScene');
        await context.scenes.change(() => new module.CharacterAppearanceConflictScene(this.plan));
      },
    });
    back.position.set(36, 856);
    const apply = new UiButton({
      label: '이 결과로 병합 적용', subtitle: '30분 내 1회 즉시 실행 취소', width: 226, height: 54, tone: 'primary', fontSize: 11, subtitleFontSize: 7,
      onPress: async () => {
        try {
          const result = await applyCharacterAppearanceConflictMerge(context, session.uid, remote, this.plan);
          await context.scenes.change(() => new CharacterAppearanceCloudScene(
            `${result.replacedEntries}개 외형 항목을 병합했습니다. 30분 동안 즉시 실행 취소할 수 있습니다. ${result.message}`,
          ));
        } catch (error: unknown) {
          await context.scenes.change(() => new CharacterAppearanceConflictPreviewScene(this.plan, this.slot, errorMessage(error)));
        }
      },
    });
    apply.position.set(278, 856);

    this.view.addChild(previous, current, next, summary, back, apply);
  }

  public async exit(): Promise<void> {
    this.cards.forEach((card) => card.destroy());
    this.cards.length = 0;
    if (this.bundleLoaded) {
      await this.context?.assets.releaseBundle(WARDROBE_UI_BUNDLE.id);
      this.bundleLoaded = false;
    }
  }

  public update(deltaSeconds: number): void {
    this.elapsed += deltaSeconds;
    this.cards.forEach((card, index) => card.update(this.elapsed + index * 0.35));
  }
}

function previousSlot(slot: CharacterWardrobeSlotId): CharacterWardrobeSlotId {
  return slot === 1 ? 3 : slot === 2 ? 1 : 2;
}

function nextSlot(slot: CharacterWardrobeSlotId): CharacterWardrobeSlotId {
  return slot === 1 ? 2 : slot === 2 ? 3 : 1;
}

function effectiveSourceLabel(source: 'local' | 'remote' | 'empty' | undefined): string {
  if (source === 'remote') return 'CLOUD';
  if (source === 'empty') return 'EMPTY';
  return 'LOCAL';
}

function fieldLabel(value: string): string {
  const labels: Readonly<Record<string, string>> = {
    name: '이름', favorite: '즐겨찾기', dye: '염색', pose: '포즈', direction: '방향', costume: '세트', channels: '채널', preset: '프리셋',
  };
  return labels[value] ?? value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '외형 병합 시뮬레이션 처리 중 오류가 발생했습니다.';
}
