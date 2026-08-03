import { STORAGE_KEYS } from '../../app/brand';
import type { CharacterWardrobeArchive } from '../../core/presentation/CharacterWardrobeController';

export type CharacterAppearanceRecoveryReason =
  | 'manual'
  | 'pre-cloud-upload'
  | 'pre-cloud-download'
  | 'pre-conflict-merge'
  | 'pre-recovery-restore'
  | 'pre-merge-undo';

export interface CharacterAppearanceRecoveryPoint {
  readonly schema: 'lumerift-character-appearance-recovery-point-v2';
  readonly id: string;
  readonly ownerUid: string;
  readonly reason: CharacterAppearanceRecoveryReason;
  readonly createdAt: number;
  readonly name: string;
  readonly pinned: boolean;
  readonly archive: CharacterWardrobeArchive;
}

export interface CharacterAppearanceRecoveryArchive {
  readonly schema: 'lumerift-character-appearance-recovery-archive-v2';
  readonly ownerUid: string;
  readonly exportedAt: number;
  readonly points: readonly CharacterAppearanceRecoveryPoint[];
}

export type CharacterAppearanceRecoveryPinResult = 'pinned' | 'unpinned' | 'limit' | 'missing';

export const CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT = 5;
export const CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT = 3;
export const CHARACTER_APPEARANCE_RECOVERY_TOTAL_LIMIT = CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT
  + CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT;

interface CharacterAppearanceRecoveryState {
  readonly schema: 'lumerift-character-appearance-recovery-store-v2';
  readonly owners: Readonly<Record<string, readonly CharacterAppearanceRecoveryPoint[]>>;
}

interface LegacyRecoveryPointV1 {
  readonly schema: 'lumerift-character-appearance-recovery-point-v1';
  readonly id: string;
  readonly ownerUid: string;
  readonly reason: CharacterAppearanceRecoveryReason;
  readonly createdAt: number;
  readonly archive: CharacterWardrobeArchive;
}

export class CharacterAppearanceRecoveryStore {
  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {}

  public list(uid: string): readonly CharacterAppearanceRecoveryPoint[] {
    const ownerUid = normalizeUid(uid);
    const points = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceRecovery)).owners[ownerUid] ?? [];
    return points.map(clonePoint);
  }

  public search(uid: string, query: string): readonly CharacterAppearanceRecoveryPoint[] {
    const normalized = normalizeQuery(query);
    if (!normalized) return this.list(uid);
    return this.list(uid).filter((point) => [
      point.name,
      characterAppearanceRecoveryReasonLabel(point.reason),
      new Date(point.createdAt).toLocaleDateString('ko-KR'),
      archiveRevisionKey(point.archive),
    ].join(' ').toLocaleLowerCase('ko-KR').includes(normalized));
  }

  public create(
    uid: string,
    archive: CharacterWardrobeArchive,
    reason: CharacterAppearanceRecoveryReason,
    now = Date.now(),
    name?: string,
  ): CharacterAppearanceRecoveryPoint {
    const ownerUid = normalizeUid(uid);
    const createdAt = Math.max(1, Math.floor(now));
    const point: CharacterAppearanceRecoveryPoint = {
      schema: 'lumerift-character-appearance-recovery-point-v2',
      id: `appearance-recovery-${createdAt.toString(36)}-${archiveRevisionKey(archive)}`,
      ownerUid,
      reason,
      createdAt,
      name: normalizeName(name, defaultRecoveryName(reason, createdAt)),
      pinned: false,
      archive: cloneArchive(archive),
    };
    const points = normalizePointLimit([point, ...this.list(ownerUid).filter((entry) => entry.id !== point.id)]);
    this.commit(ownerUid, points);
    return clonePoint(point);
  }

  public find(uid: string, id: string): CharacterAppearanceRecoveryPoint | undefined {
    const point = this.list(uid).find((entry) => entry.id === id);
    return point ? clonePoint(point) : undefined;
  }

  public rename(uid: string, id: string, name: string): CharacterAppearanceRecoveryPoint | undefined {
    const ownerUid = normalizeUid(uid);
    const current = this.list(ownerUid);
    const target = current.find((entry) => entry.id === id);
    if (!target) return undefined;
    const renamed: CharacterAppearanceRecoveryPoint = {
      ...target,
      name: normalizeName(name, target.name),
    };
    this.commit(ownerUid, normalizePointLimit(current.map((entry) => entry.id === id ? renamed : entry)));
    return clonePoint(renamed);
  }

  public togglePin(uid: string, id: string): CharacterAppearanceRecoveryPinResult {
    const ownerUid = normalizeUid(uid);
    const current = this.list(ownerUid);
    const target = current.find((entry) => entry.id === id);
    if (!target) return 'missing';
    if (!target.pinned && current.filter((entry) => entry.pinned).length >= CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT) return 'limit';
    const pinned = !target.pinned;
    const next = current.map((entry) => entry.id === id ? { ...entry, pinned } : entry);
    this.commit(ownerUid, normalizePointLimit(next));
    return pinned ? 'pinned' : 'unpinned';
  }

  public remove(uid: string, id: string): boolean {
    const ownerUid = normalizeUid(uid);
    const current = this.list(ownerUid);
    const next = current.filter((entry) => entry.id !== id);
    if (next.length === current.length) return false;
    this.commit(ownerUid, normalizePointLimit(next));
    return true;
  }

  public export(uid: string, now = Date.now()): CharacterAppearanceRecoveryArchive {
    const ownerUid = normalizeUid(uid);
    return {
      schema: 'lumerift-character-appearance-recovery-archive-v2',
      ownerUid,
      exportedAt: Math.max(1, Math.floor(now)),
      points: this.list(ownerUid).map(clonePoint),
    };
  }

  public import(uid: string, value: unknown): number {
    const ownerUid = normalizeUid(uid);
    const incoming = parseRecoveryArchive(value, ownerUid);
    if (!incoming) return 0;
    const byId = new Map(this.list(ownerUid).map((point) => [point.id, point]));
    for (const point of incoming.points) byId.set(point.id, point);
    this.commit(ownerUid, normalizePointLimit([...byId.values()]));
    return incoming.points.length;
  }

  private commit(uid: string, points: readonly CharacterAppearanceRecoveryPoint[]): void {
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceRecovery));
    const next: CharacterAppearanceRecoveryState = {
      schema: 'lumerift-character-appearance-recovery-store-v2',
      owners: { ...state.owners, [uid]: normalizePointLimit(points).map(clonePoint) },
    };
    this.storage?.setItem(STORAGE_KEYS.characterAppearanceRecovery, JSON.stringify(next));
  }
}

export function characterAppearanceRecoveryReasonLabel(reason: CharacterAppearanceRecoveryReason): string {
  if (reason === 'pre-cloud-upload') return 'Cloud 업로드 전';
  if (reason === 'pre-cloud-download') return 'Cloud 가져오기 전';
  if (reason === 'pre-conflict-merge') return '충돌 병합 전';
  if (reason === 'pre-recovery-restore') return '복구 적용 전';
  if (reason === 'pre-merge-undo') return '병합 실행 취소 전';
  return '수동 백업';
}

function parseRecoveryArchive(value: unknown, uid: string): CharacterAppearanceRecoveryArchive | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as { readonly schema?: unknown; readonly ownerUid?: unknown; readonly exportedAt?: unknown; readonly points?: unknown };
  if (record.ownerUid !== uid || !Array.isArray(record.points)) return undefined;
  if (record.schema !== 'lumerift-character-appearance-recovery-archive-v2'
    && record.schema !== 'lumerift-character-appearance-recovery-archive-v1') return undefined;
  const points = record.points
    .map((point) => parsePoint(point, uid))
    .filter((point): point is CharacterAppearanceRecoveryPoint => Boolean(point));
  return {
    schema: 'lumerift-character-appearance-recovery-archive-v2',
    ownerUid: uid,
    exportedAt: finitePositive(record.exportedAt) ?? Date.now(),
    points: normalizePointLimit(points),
  };
}

function loadState(raw: string | null | undefined): CharacterAppearanceRecoveryState {
  const empty: CharacterAppearanceRecoveryState = { schema: 'lumerift-character-appearance-recovery-store-v2', owners: {} };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return stateFromLegacyArray(parsed);
    if (!parsed || typeof parsed !== 'object') return empty;
    const record = parsed as { readonly schema?: unknown; readonly owners?: unknown };
    if ((record.schema !== 'lumerift-character-appearance-recovery-store-v2'
      && record.schema !== 'lumerift-character-appearance-recovery-store-v1')
      || !record.owners || typeof record.owners !== 'object') return empty;
    const owners: Record<string, CharacterAppearanceRecoveryPoint[]> = {};
    for (const [ownerUid, values] of Object.entries(record.owners)) {
      if (!Array.isArray(values)) continue;
      const points = values
        .map((value) => parsePoint(value, ownerUid))
        .filter((point): point is CharacterAppearanceRecoveryPoint => Boolean(point));
      if (points.length) owners[ownerUid] = [...normalizePointLimit(points)];
    }
    return { schema: 'lumerift-character-appearance-recovery-store-v2', owners };
  } catch {
    return empty;
  }
}

function stateFromLegacyArray(values: readonly unknown[]): CharacterAppearanceRecoveryState {
  const owners: Record<string, CharacterAppearanceRecoveryPoint[]> = {};
  for (const value of values) {
    if (!value || typeof value !== 'object') continue;
    const ownerUid = (value as Partial<LegacyRecoveryPointV1>).ownerUid;
    if (typeof ownerUid !== 'string') continue;
    const point = parsePoint(value, ownerUid);
    if (point) (owners[ownerUid] ??= []).push(point);
  }
  return {
    schema: 'lumerift-character-appearance-recovery-store-v2',
    owners: Object.fromEntries(Object.entries(owners).map(([uid, points]) => [uid, normalizePointLimit(points)])),
  };
}

function parsePoint(value: unknown, uid: string): CharacterAppearanceRecoveryPoint | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as {
    readonly schema?: unknown;
    readonly id?: unknown;
    readonly ownerUid?: unknown;
    readonly reason?: unknown;
    readonly createdAt?: unknown;
    readonly name?: unknown;
    readonly pinned?: unknown;
    readonly archive?: unknown;
  };
  const legacy = record.schema === 'lumerift-character-appearance-recovery-point-v1';
  if ((!legacy && record.schema !== 'lumerift-character-appearance-recovery-point-v2')
    || record.ownerUid !== uid
    || typeof record.id !== 'string'
    || !isReason(record.reason)
    || !isArchive(record.archive)) return undefined;
  const createdAt = finitePositive(record.createdAt);
  if (!createdAt) return undefined;
  return {
    schema: 'lumerift-character-appearance-recovery-point-v2',
    id: record.id.slice(0, 160),
    ownerUid: uid,
    reason: record.reason,
    createdAt,
    name: normalizeName(legacy ? undefined : record.name, defaultRecoveryName(record.reason, createdAt)),
    pinned: legacy ? false : record.pinned === true,
    archive: cloneArchive(record.archive),
  };
}

function normalizePointLimit(points: readonly CharacterAppearanceRecoveryPoint[]): readonly CharacterAppearanceRecoveryPoint[] {
  const byId = new Map<string, CharacterAppearanceRecoveryPoint>();
  for (const point of points) {
    const current = byId.get(point.id);
    if (!current || point.createdAt >= current.createdAt) byId.set(point.id, clonePoint(point));
  }
  const unique = [...byId.values()];
  const pinned = unique.filter((point) => point.pinned)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, CHARACTER_APPEARANCE_RECOVERY_PIN_LIMIT);
  const unpinned = unique.filter((point) => !point.pinned)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, CHARACTER_APPEARANCE_RECOVERY_RECENT_LIMIT);
  return [...pinned, ...unpinned].map(clonePoint);
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

function isReason(value: unknown): value is CharacterAppearanceRecoveryReason {
  return value === 'manual'
    || value === 'pre-cloud-upload'
    || value === 'pre-cloud-download'
    || value === 'pre-conflict-merge'
    || value === 'pre-recovery-restore'
    || value === 'pre-merge-undo';
}

function clonePoint(point: CharacterAppearanceRecoveryPoint): CharacterAppearanceRecoveryPoint {
  return { ...point, archive: cloneArchive(point.archive) };
}

function cloneArchive(archive: CharacterWardrobeArchive): CharacterWardrobeArchive {
  return JSON.parse(JSON.stringify(archive)) as CharacterWardrobeArchive;
}

function archiveRevisionKey(archive: CharacterWardrobeArchive): string {
  let hash = 0;
  const value = JSON.stringify(archive);
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

function defaultRecoveryName(reason: CharacterAppearanceRecoveryReason, createdAt: number): string {
  const date = new Date(createdAt);
  const stamp = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${characterAppearanceRecoveryReasonLabel(reason)} · ${stamp}`;
}

function normalizeName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(/\s+/g, ' ').slice(0, 36);
  return normalized || fallback;
}

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, 36).toLocaleLowerCase('ko-KR');
}

function normalizeUid(value: string): string {
  const uid = value.trim();
  if (!uid || uid.length > 128 || uid.includes('/')) throw new Error('외형 복구 지점 UID 형식이 올바르지 않습니다.');
  return uid;
}

function finitePositive(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
