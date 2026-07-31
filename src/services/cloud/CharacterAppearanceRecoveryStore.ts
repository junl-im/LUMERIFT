import { STORAGE_KEYS } from '../../app/brand';
import type { CharacterWardrobeArchive } from '../../core/presentation/CharacterWardrobeController';

export type CharacterAppearanceRecoveryReason =
  | 'manual'
  | 'pre-cloud-upload'
  | 'pre-cloud-download'
  | 'pre-conflict-merge'
  | 'pre-recovery-restore';

export interface CharacterAppearanceRecoveryPoint {
  readonly schema: 'lumerift-character-appearance-recovery-point-v1';
  readonly id: string;
  readonly ownerUid: string;
  readonly reason: CharacterAppearanceRecoveryReason;
  readonly createdAt: number;
  readonly archive: CharacterWardrobeArchive;
}

export interface CharacterAppearanceRecoveryArchive {
  readonly schema: 'lumerift-character-appearance-recovery-archive-v1';
  readonly ownerUid: string;
  readonly exportedAt: number;
  readonly points: readonly CharacterAppearanceRecoveryPoint[];
}

const MAX_POINTS = 5;

interface CharacterAppearanceRecoveryState {
  readonly schema: 'lumerift-character-appearance-recovery-store-v1';
  readonly owners: Readonly<Record<string, readonly CharacterAppearanceRecoveryPoint[]>>;
}

export class CharacterAppearanceRecoveryStore {
  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {}

  public list(uid: string): readonly CharacterAppearanceRecoveryPoint[] {
    const ownerUid = normalizeUid(uid);
    return loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceRecovery)).owners[ownerUid] ?? [];
  }

  public create(
    uid: string,
    archive: CharacterWardrobeArchive,
    reason: CharacterAppearanceRecoveryReason,
    now = Date.now(),
  ): CharacterAppearanceRecoveryPoint {
    const ownerUid = normalizeUid(uid);
    const createdAt = Math.max(1, Math.floor(now));
    const point: CharacterAppearanceRecoveryPoint = {
      schema: 'lumerift-character-appearance-recovery-point-v1',
      id: `appearance-recovery-${createdAt.toString(36)}-${archiveRevisionKey(archive)}`,
      ownerUid,
      reason,
      createdAt,
      archive: cloneArchive(archive),
    };
    const points = [point, ...this.list(ownerUid).filter((entry) => entry.id !== point.id)].slice(0, MAX_POINTS);
    this.commit(ownerUid, points);
    return point;
  }

  public find(uid: string, id: string): CharacterAppearanceRecoveryPoint | undefined {
    const point = this.list(uid).find((entry) => entry.id === id);
    return point ? clonePoint(point) : undefined;
  }

  public remove(uid: string, id: string): boolean {
    const current = this.list(uid);
    const next = current.filter((entry) => entry.id !== id);
    if (next.length === current.length) return false;
    this.commit(normalizeUid(uid), next);
    return true;
  }

  public export(uid: string, now = Date.now()): CharacterAppearanceRecoveryArchive {
    const ownerUid = normalizeUid(uid);
    return {
      schema: 'lumerift-character-appearance-recovery-archive-v1',
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
    const points = [...byId.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_POINTS);
    this.commit(ownerUid, points);
    return incoming.points.length;
  }

  private commit(uid: string, points: readonly CharacterAppearanceRecoveryPoint[]): void {
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceRecovery));
    const next: CharacterAppearanceRecoveryState = {
      schema: 'lumerift-character-appearance-recovery-store-v1',
      owners: { ...state.owners, [uid]: points.map(clonePoint) },
    };
    this.storage?.setItem(STORAGE_KEYS.characterAppearanceRecovery, JSON.stringify(next));
  }
}

export function characterAppearanceRecoveryReasonLabel(reason: CharacterAppearanceRecoveryReason): string {
  if (reason === 'pre-cloud-upload') return 'Cloud 업로드 전';
  if (reason === 'pre-cloud-download') return 'Cloud 가져오기 전';
  if (reason === 'pre-conflict-merge') return '충돌 병합 전';
  if (reason === 'pre-recovery-restore') return '복구 적용 전';
  return '수동 백업';
}

function parseRecoveryArchive(value: unknown, uid: string): CharacterAppearanceRecoveryArchive | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceRecoveryArchive>;
  if (record.schema !== 'lumerift-character-appearance-recovery-archive-v1' || record.ownerUid !== uid || !Array.isArray(record.points)) return undefined;
  const points = record.points.map((point) => parsePoint(point, uid)).filter((point): point is CharacterAppearanceRecoveryPoint => Boolean(point));
  return {
    schema: 'lumerift-character-appearance-recovery-archive-v1',
    ownerUid: uid,
    exportedAt: finitePositive(record.exportedAt) ?? Date.now(),
    points: points.slice(0, MAX_POINTS),
  };
}

function loadState(raw: string | null | undefined): CharacterAppearanceRecoveryState {
  if (!raw) return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: {} };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const owners: Record<string, CharacterAppearanceRecoveryPoint[]> = {};
      for (const value of parsed) {
        if (!value || typeof value !== 'object') continue;
        const ownerUid = (value as Partial<CharacterAppearanceRecoveryPoint>).ownerUid;
        if (typeof ownerUid !== 'string') continue;
        const point = parsePoint(value, ownerUid);
        if (point) (owners[ownerUid] ??= []).push(point);
      }
      return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: normalizeOwners(owners) };
    }
    if (!parsed || typeof parsed !== 'object') return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: {} };
    const record = parsed as Partial<CharacterAppearanceRecoveryState>;
    if (record.schema !== 'lumerift-character-appearance-recovery-store-v1' || !record.owners || typeof record.owners !== 'object') {
      return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: {} };
    }
    const owners: Record<string, CharacterAppearanceRecoveryPoint[]> = {};
    for (const [ownerUid, values] of Object.entries(record.owners)) {
      if (!Array.isArray(values)) continue;
      const points = values.map((value) => parsePoint(value, ownerUid)).filter((point): point is CharacterAppearanceRecoveryPoint => Boolean(point));
      if (points.length) owners[ownerUid] = points;
    }
    return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: normalizeOwners(owners) };
  } catch {
    return { schema: 'lumerift-character-appearance-recovery-store-v1', owners: {} };
  }
}

function normalizeOwners(owners: Readonly<Record<string, readonly CharacterAppearanceRecoveryPoint[]>>): Readonly<Record<string, readonly CharacterAppearanceRecoveryPoint[]>> {
  return Object.fromEntries(Object.entries(owners).map(([uid, points]) => [
    uid,
    points.map(clonePoint).sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_POINTS),
  ]));
}

function parsePoint(value: unknown, uid: string): CharacterAppearanceRecoveryPoint | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceRecoveryPoint>;
  if (record.schema !== 'lumerift-character-appearance-recovery-point-v1'
    || record.ownerUid !== uid
    || typeof record.id !== 'string'
    || !isReason(record.reason)
    || !isArchive(record.archive)) return undefined;
  const createdAt = finitePositive(record.createdAt);
  if (!createdAt) return undefined;
  return {
    schema: 'lumerift-character-appearance-recovery-point-v1',
    id: record.id.slice(0, 160),
    ownerUid: uid,
    reason: record.reason,
    createdAt,
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

function isReason(value: unknown): value is CharacterAppearanceRecoveryReason {
  return value === 'manual'
    || value === 'pre-cloud-upload'
    || value === 'pre-cloud-download'
    || value === 'pre-conflict-merge'
    || value === 'pre-recovery-restore';
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
