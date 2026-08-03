import { STORAGE_KEYS } from '../../app/brand';
import type { CharacterWardrobeArchive } from '../../core/presentation/CharacterWardrobeController';

export interface CharacterAppearanceMergeUndoPoint {
  readonly schema: 'lumerift-character-appearance-merge-undo-v1';
  readonly ownerUid: string;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly mergedRevision: string;
  readonly archive: CharacterWardrobeArchive;
}

interface CharacterAppearanceMergeUndoState {
  readonly schema: 'lumerift-character-appearance-merge-undo-store-v1';
  readonly owners: Readonly<Record<string, CharacterAppearanceMergeUndoPoint>>;
}

const UNDO_TTL_MS = 30 * 60 * 1000;

export class CharacterAppearanceUndoStore {
  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {}

  public create(
    uid: string,
    archive: CharacterWardrobeArchive,
    mergedRevision: string,
    now = Date.now(),
  ): CharacterAppearanceMergeUndoPoint {
    const ownerUid = normalizeUid(uid);
    if (!/^appearance-[0-9a-f]{8}$/.test(mergedRevision)) throw new Error('병합 실행 취소 revision 형식이 올바르지 않습니다.');
    const createdAt = Math.max(1, Math.floor(now));
    const point: CharacterAppearanceMergeUndoPoint = {
      schema: 'lumerift-character-appearance-merge-undo-v1',
      ownerUid,
      createdAt,
      expiresAt: createdAt + UNDO_TTL_MS,
      mergedRevision,
      archive: cloneArchive(archive),
    };
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceMergeUndo));
    this.commit({ ...state.owners, [ownerUid]: point });
    return clonePoint(point);
  }

  public peek(uid: string, now = Date.now()): CharacterAppearanceMergeUndoPoint | undefined {
    const ownerUid = normalizeUid(uid);
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceMergeUndo));
    const point = state.owners[ownerUid];
    if (!point) return undefined;
    if (point.expiresAt <= now) {
      this.clear(ownerUid);
      return undefined;
    }
    return clonePoint(point);
  }

  public consume(uid: string, now = Date.now()): CharacterAppearanceMergeUndoPoint | undefined {
    const point = this.peek(uid, now);
    if (!point) return undefined;
    this.clear(uid);
    return point;
  }

  public clear(uid: string): void {
    const ownerUid = normalizeUid(uid);
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceMergeUndo));
    if (!state.owners[ownerUid]) return;
    const owners = { ...state.owners };
    delete owners[ownerUid];
    this.commit(owners);
  }

  private commit(owners: Readonly<Record<string, CharacterAppearanceMergeUndoPoint>>): void {
    const state: CharacterAppearanceMergeUndoState = {
      schema: 'lumerift-character-appearance-merge-undo-store-v1',
      owners: Object.fromEntries(Object.entries(owners).map(([uid, point]) => [uid, clonePoint(point)])),
    };
    this.storage?.setItem(STORAGE_KEYS.characterAppearanceMergeUndo, JSON.stringify(state));
  }
}

function loadState(raw: string | null | undefined): CharacterAppearanceMergeUndoState {
  const empty: CharacterAppearanceMergeUndoState = {
    schema: 'lumerift-character-appearance-merge-undo-store-v1',
    owners: {},
  };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== 'object') return empty;
    const record = value as Partial<CharacterAppearanceMergeUndoState>;
    if (record.schema !== 'lumerift-character-appearance-merge-undo-store-v1' || !record.owners || typeof record.owners !== 'object') return empty;
    const owners: Record<string, CharacterAppearanceMergeUndoPoint> = {};
    for (const [uid, entry] of Object.entries(record.owners)) {
      const point = parsePoint(entry, uid);
      if (point) owners[uid] = point;
    }
    return { schema: 'lumerift-character-appearance-merge-undo-store-v1', owners };
  } catch {
    return empty;
  }
}

function parsePoint(value: unknown, uid: string): CharacterAppearanceMergeUndoPoint | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceMergeUndoPoint>;
  if (record.schema !== 'lumerift-character-appearance-merge-undo-v1'
    || record.ownerUid !== uid
    || !finitePositive(record.createdAt)
    || !finitePositive(record.expiresAt)
    || typeof record.mergedRevision !== 'string'
    || !/^appearance-[0-9a-f]{8}$/.test(record.mergedRevision)
    || !isArchive(record.archive)) return undefined;
  return {
    schema: 'lumerift-character-appearance-merge-undo-v1',
    ownerUid: uid,
    createdAt: Math.floor(record.createdAt),
    expiresAt: Math.floor(record.expiresAt),
    mergedRevision: record.mergedRevision,
    archive: cloneArchive(record.archive),
  };
}

function isArchive(value: unknown): value is CharacterWardrobeArchive {
  if (!value || typeof value !== 'object') return false;
  const archive = value as Partial<CharacterWardrobeArchive>;
  return archive.schemaVersion === 3
    && archive.game === 'LUMERIFT'
    && archive.kind === 'character-appearance-presets'
    && Array.isArray(archive.slotOrder)
    && archive.slotOrder.length === 3
    && Boolean(archive.lockedSlots)
    && Boolean(archive.slots)
    && Array.isArray(archive.presets);
}

function clonePoint(point: CharacterAppearanceMergeUndoPoint): CharacterAppearanceMergeUndoPoint {
  return { ...point, archive: cloneArchive(point.archive) };
}

function cloneArchive(archive: CharacterWardrobeArchive): CharacterWardrobeArchive {
  return JSON.parse(JSON.stringify(archive)) as CharacterWardrobeArchive;
}

function normalizeUid(value: string): string {
  const uid = value.trim();
  if (!uid || uid.length > 128 || uid.includes('/')) throw new Error('외형 실행 취소 UID 형식이 올바르지 않습니다.');
  return uid;
}

function finitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
