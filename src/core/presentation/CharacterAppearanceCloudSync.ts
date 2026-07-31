import type { CharacterWardrobeArchive } from './CharacterWardrobeController';

export interface CharacterAppearanceCloudEnvelope {
  readonly schema: 'lumerift-character-appearance-cloud-v2';
  readonly ownerUid: string;
  readonly updatedAt: number;
  readonly revision: string;
  readonly syncMode: 'manual-opt-in';
  readonly archive: CharacterWardrobeArchive;
}

export type CharacterAppearanceCloudComparison =
  | 'identical'
  | 'local-only-change'
  | 'remote-only-change'
  | 'diverged'
  | 'first-sync-conflict';

export function createCharacterAppearanceCloudEnvelope(
  ownerUid: string,
  archive: CharacterWardrobeArchive,
  now = Date.now(),
): CharacterAppearanceCloudEnvelope {
  const uid = normalizeUid(ownerUid);
  return {
    schema: 'lumerift-character-appearance-cloud-v2',
    ownerUid: uid,
    updatedAt: Math.max(1, Math.floor(now)),
    revision: characterAppearanceArchiveRevision(archive),
    syncMode: 'manual-opt-in',
    archive,
  };
}

export function parseCharacterAppearanceCloudEnvelope(
  value: unknown,
  expectedUid: string,
): CharacterAppearanceCloudEnvelope | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceCloudEnvelope> & { readonly schema?: string };
  if (record.schema !== 'lumerift-character-appearance-cloud-v2') return undefined;
  if (record.syncMode !== 'manual-opt-in') return undefined;
  if (typeof record.ownerUid !== 'string' || record.ownerUid !== normalizeUid(expectedUid)) return undefined;
  if (typeof record.updatedAt !== 'number' || !Number.isFinite(record.updatedAt) || record.updatedAt <= 0) return undefined;
  if (typeof record.revision !== 'string' || !/^appearance-[0-9a-f]{8}$/.test(record.revision)) return undefined;
  if (!isWardrobeArchive(record.archive)) return undefined;
  if (record.revision !== characterAppearanceArchiveRevision(record.archive)) return undefined;
  return {
    schema: 'lumerift-character-appearance-cloud-v2',
    ownerUid: record.ownerUid,
    updatedAt: Math.floor(record.updatedAt),
    revision: record.revision,
    syncMode: 'manual-opt-in',
    archive: record.archive,
  };
}

export function characterAppearanceCloudPath(uid: string): string {
  const [, owner, , documentId] = characterAppearanceCloudPathSegments(uid);
  return `users/${owner}/settings/${documentId}`;
}

export function characterAppearanceCloudPathSegments(uid: string): readonly ['users', string, 'settings', 'characterAppearance'] {
  return ['users', normalizeUid(uid), 'settings', 'characterAppearance'];
}

export function characterAppearanceArchiveRevision(archive: CharacterWardrobeArchive): string {
  const canonical = canonicalArchive(archive);
  let hash = 0x811c9dc5;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `appearance-${hash.toString(16).padStart(8, '0')}`;
}

export function compareCharacterAppearanceRevisions(
  localRevision: string,
  remoteRevision: string,
  lastSyncedRevision?: string,
): CharacterAppearanceCloudComparison {
  if (localRevision === remoteRevision) return 'identical';
  if (!lastSyncedRevision) return 'first-sync-conflict';
  const localChanged = localRevision !== lastSyncedRevision;
  const remoteChanged = remoteRevision !== lastSyncedRevision;
  if (localChanged && remoteChanged) return 'diverged';
  if (localChanged) return 'local-only-change';
  return 'remote-only-change';
}

function normalizeUid(value: string): string {
  const uid = value.trim();
  if (!uid) throw new Error('외형 프리셋 Cloud Save 소유자 UID가 필요합니다.');
  if (uid.length > 128 || uid.includes('/')) throw new Error('외형 프리셋 Cloud Save UID 형식이 올바르지 않습니다.');
  return uid;
}

function canonicalArchive(archive: CharacterWardrobeArchive): string {
  return JSON.stringify({
    schemaVersion: archive.schemaVersion,
    game: archive.game,
    kind: archive.kind,
    slotOrder: archive.slotOrder,
    lockedSlots: archive.lockedSlots,
    slots: archive.slots,
    presets: archive.presets,
  });
}

function isWardrobeArchive(value: unknown): value is CharacterWardrobeArchive {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<CharacterWardrobeArchive>;
  return record.schemaVersion === 3
    && record.game === 'LUMERIFT'
    && record.kind === 'character-appearance-presets'
    && typeof record.exportedAt === 'number'
    && Array.isArray(record.slotOrder)
    && record.slotOrder.length === 3
    && Boolean(record.lockedSlots)
    && Boolean(record.slots)
    && Array.isArray(record.presets);
}
