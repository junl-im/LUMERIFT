import type { AppContext } from '../../app/AppContext';
import { characterAppearanceArchiveRevision, type CharacterAppearanceCloudEnvelope } from '../../core/presentation/CharacterAppearanceCloudSync';
import {
  mergeCharacterAppearanceArchives,
  type CharacterAppearanceMergePlan,
} from '../../core/presentation/CharacterAppearanceConflictResolver';

export interface CharacterAppearanceMergeApplyResult {
  readonly replacedEntries: number;
  readonly mergedRevision: string;
  readonly message: string;
}

export async function applyCharacterAppearanceConflictMerge(
  context: AppContext,
  uid: string,
  remote: CharacterAppearanceCloudEnvelope,
  plan: CharacterAppearanceMergePlan,
  now = Date.now(),
): Promise<CharacterAppearanceMergeApplyResult> {
  const local = context.characterWardrobe.exportPresetArchive(now);
  const merged = mergeCharacterAppearanceArchives(local, remote.archive, plan, now);
  const mergedRevision = characterAppearanceArchiveRevision(merged);
  const recovery = context.characterAppearanceCloud.createRecoveryPoint(uid, local, 'pre-conflict-merge', now);
  context.characterAppearanceCloud.createMergeUndo(uid, local, mergedRevision, now);
  const replacedEntries = context.characterWardrobe.replacePresetArchive(merged);
  const result = await context.characterAppearanceCloud.applyRemoteAndConsolidate(uid, remote, merged, now);
  context.characterAppearanceCloud.recordAudit(uid, {
    action: 'conflict-merge-applied',
    title: '외형 충돌 선택 병합 적용',
    recoveryPointIds: [recovery.id],
    revisions: [characterAppearanceArchiveRevision(local), remote.revision, mergedRevision],
    details: {
      replacedEntries,
      slot1: plan.slots[1],
      slot2: plan.slots[2],
      slot3: plan.slots[3],
      slotOrder: plan.slotOrder,
      lockedSlots: plan.lockedSlots,
      presets: plan.presets,
    },
  }, now);
  return {
    replacedEntries,
    mergedRevision,
    message: result.message,
  };
}
