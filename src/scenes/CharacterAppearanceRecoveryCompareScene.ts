import { Container, Text, TextStyle, type Spritesheet } from 'pixi.js';
import type { AppContext } from '../app/AppContext';
import { COLORS } from '../app/constants';
import { ASSET_PATHS, WARDROBE_UI_BUNDLE } from '../core/assets/AssetCatalog';
import { downloadJson } from '../core/files/JsonFileTransfer';
import {
  characterAppearanceDifferenceFieldLabel,
  compareCharacterAppearanceArchives,
} from '../core/presentation/CharacterAppearanceArchiveDiff';
import type { CharacterWardrobeSlotId } from '../core/presentation/CharacterWardrobeController';
import type { Scene } from '../core/scenes/Scene';
import { ensureStarterInventory } from '../game/items/inventoryLogic';
import { CharacterAppearanceSnapshotCard } from '../game/presentation/CharacterAppearanceSnapshotCard';
import { createDefaultProfile } from '../repositories/PlayerRepository';
import { createBadge } from '../ui/PremiumUi';
import { createBackground, createPanel } from '../ui/SceneChrome';
import { createInlineFeedback } from '../ui/UxFeedback';
import { UiButton } from '../ui/UiButton';

export class CharacterAppearanceRecoveryCompareScene implements Scene {
  public readonly view = new Container();
  private readonly cards: CharacterAppearanceSnapshotCard[] = [];
  private context?: AppContext;
  private bundleLoaded = false;
  private elapsed = 0;

  public constructor(
    private readonly leftId: string,
    private readonly rightId: string,
    private readonly slot: CharacterWardrobeSlotId = 1,
    private readonly message = '',
  ) {}

  public async enter(context: AppContext): Promise<void> {
    this.context = context;
    const session = context.auth.currentSession;
    if (!session) throw new Error('로그인 세션이 없습니다.');
    const left = context.characterAppearanceCloud.findRecoveryPoint(session.uid, this.leftId);
    const right = context.characterAppearanceCloud.findRecoveryPoint(session.uid, this.rightId);

    this.view.addChild(createBackground(
      '외형 복구 지점 차이 비교',
      '두 복구 지점의 실제 캐릭터 외형과 Archive 변경 항목을 슬롯별로 비교합니다.',
    ));
    this.view.addChild(createPanel(18, 158, 504, 772));

    if (!left || !right) {
      const feedback = createInlineFeedback('비교할 복구 지점을 찾지 못했습니다. UID 또는 삭제 상태를 확인하세요.', 'warning', 468);
      feedback.position.set(36, 176);
      const back = new UiButton({
        label: '복구 센터로 복귀', width: 468, height: 56, tone: 'primary', fontSize: 12,
        onPress: async () => goRecovery(context),
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
    const diff = compareCharacterAppearanceArchives(left.archive, right.archive);
    const slotDiff = diff.slotDifferences.find((entry) => entry.slot === this.slot);

    const feedback = createInlineFeedback(
      this.message || `SLOT ${this.slot} · ${left.name} ↔ ${right.name}`,
      this.message ? 'success' : diff.summary.totalDifferences ? 'warning' : 'neutral',
      468,
    );
    feedback.position.set(36, 174);
    this.view.addChild(feedback);

    const slotBadge = createBadge(`SLOT ${this.slot}`, 'primary');
    slotBadge.position.set(36, 228);
    const diffBadge = createBadge(`DIFF ${diff.summary.totalDifferences}`, diff.summary.totalDifferences ? 'warning' : 'success');
    diffBadge.position.set(150, 228);
    const auditBadge = createBadge(`AUDIT ${context.characterAppearanceCloud.auditRecords(session.uid).length}`, 'primary');
    auditBadge.position.set(286, 228);
    this.view.addChild(slotBadge, diffBadge, auditBadge);

    const changedFields = slotDiff?.changedFields ?? [];
    const leftCard = new CharacterAppearanceSnapshotCard({
      title: 'POINT A',
      source: 'local',
      preset: left.archive.slots[this.slot],
      locked: left.archive.lockedSlots[this.slot],
      profile,
      registry: context.gameData,
      sheet: playerSheet,
      attackSheet,
      changedFields,
      width: 220,
      height: 424,
    });
    leftCard.view.position.set(36, 270);
    const rightCard = new CharacterAppearanceSnapshotCard({
      title: 'POINT B',
      source: 'remote',
      preset: right.archive.slots[this.slot],
      locked: right.archive.lockedSlots[this.slot],
      profile,
      registry: context.gameData,
      sheet: playerSheet,
      attackSheet,
      changedFields,
      width: 220,
      height: 424,
    });
    rightCard.view.position.set(284, 270);
    this.cards.push(leftCard, rightCard);
    this.view.addChild(leftCard.view, rightCard.view);

    const previous = new UiButton({
      label: '← 이전 슬롯', width: 148, height: 46, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryCompareScene(this.leftId, this.rightId, previousSlot(this.slot))),
    });
    previous.position.set(36, 710);
    const current = new UiButton({
      label: `SLOT ${this.slot} · ${statusLabel(slotDiff?.status)}`, width: 148, height: 46, tone: changedFields.length ? 'primary' : 'secondary', fontSize: 9,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryCompareScene(this.leftId, this.rightId, this.slot)),
    });
    current.position.set(196, 710);
    const next = new UiButton({
      label: '다음 슬롯 →', width: 148, height: 46, tone: 'secondary', fontSize: 10,
      onPress: async () => context.scenes.change(() => new CharacterAppearanceRecoveryCompareScene(this.leftId, this.rightId, nextSlot(this.slot))),
    });
    next.position.set(356, 710);

    const summary = new Text({
      text: [
        `A · ${left.name} · ${formatDate(left.createdAt)}`,
        `B · ${right.name} · ${formatDate(right.createdAt)}`,
        `슬롯 변경 · ${diff.summary.changedSlots}/3 · 고정 변경 ${diff.summary.changedLocks} · 프리셋 변경 ${diff.summary.changedPresets}`,
        `현재 슬롯 · ${changedFields.length ? changedFields.map(characterAppearanceDifferenceFieldLabel).join(' · ') : '차이 없음'}`,
        `순서 · ${diff.slotOrderChanged ? `${diff.leftSlotOrder.join('→')} / ${diff.rightSlotOrder.join('→')}` : '동일'}`,
      ].join('\n'),
      style: new TextStyle({ fill: COLORS.muted, fontSize: 9, lineHeight: 16, fontWeight: '700', wordWrap: true, wordWrapWidth: 468 }),
    });
    summary.position.set(36, 770);

    const exportButton = new UiButton({
      label: '차이·감사 기록 내보내기', subtitle: '두 지점 관련 감사 이력 포함', width: 226, height: 54, tone: 'secondary', fontSize: 10, subtitleFontSize: 7,
      onPress: async () => {
        const audit = context.characterAppearanceCloud.exportAuditArchive(session.uid, [left.id, right.id]);
        const payload = {
          schema: 'lumerift-character-appearance-recovery-comparison-v1',
          ownerUid: session.uid,
          exportedAt: Date.now(),
          points: [
            { id: left.id, name: left.name, createdAt: left.createdAt, reason: left.reason },
            { id: right.id, name: right.name, createdAt: right.createdAt, reason: right.reason },
          ],
          difference: diff,
          audit,
        } as const;
        downloadJson(`LUMERIFT_APPEARANCE_RECOVERY_DIFF_${dateKey()}.json`, payload);
        context.characterAppearanceCloud.recordAudit(session.uid, {
          action: 'recovery-diff-exported',
          title: `${left.name} ↔ ${right.name}`,
          recoveryPointIds: [left.id, right.id],
          revisions: [diff.leftRevision, diff.rightRevision],
          details: { totalDifferences: diff.summary.totalDifferences },
        });
        await context.scenes.change(() => new CharacterAppearanceRecoveryCompareScene(this.leftId, this.rightId, this.slot, '복구 차이와 관련 감사 기록을 JSON으로 저장했습니다.'));
      },
    });
    exportButton.position.set(36, 854);
    const back = new UiButton({
      label: '복구 센터로 복귀', width: 226, height: 54, tone: 'primary', fontSize: 11,
      onPress: async () => goRecovery(context),
    });
    back.position.set(278, 854);

    this.view.addChild(previous, current, next, summary, exportButton, back);
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
    this.cards.forEach((card, index) => card.update(this.elapsed + index * 0.4));
  }
}

async function goRecovery(context: AppContext): Promise<void> {
  const module = await import('./CharacterAppearanceRecoveryScene');
  await context.scenes.change(() => new module.CharacterAppearanceRecoveryScene());
}

function previousSlot(slot: CharacterWardrobeSlotId): CharacterWardrobeSlotId {
  return slot === 1 ? 3 : slot === 2 ? 1 : 2;
}

function nextSlot(slot: CharacterWardrobeSlotId): CharacterWardrobeSlotId {
  return slot === 1 ? 2 : slot === 2 ? 3 : 1;
}

function statusLabel(status: string | undefined): string {
  if (status === 'left-only') return 'A ONLY';
  if (status === 'right-only') return 'B ONLY';
  if (status === 'different') return 'CHANGED';
  return 'SAME';
}

function formatDate(value: number): string {
  return new Date(value).toLocaleString('ko-KR');
}

function dateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}
