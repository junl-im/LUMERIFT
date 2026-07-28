import type { PlayerProfile } from '../../repositories/PlayerRepository';

export type SaveRecoveryReason =
  | 'manual'
  | 'pre-cloud-download'
  | 'pre-cloud-upload'
  | 'pre-auto-merge'
  | 'pre-logout'
  | 'pre-json-import';

export interface SaveRecoveryPoint {
  readonly id: string;
  readonly uid: string;
  readonly reason: SaveRecoveryReason;
  readonly createdAt: number;
  readonly profile: PlayerProfile;
}

export interface RecoveryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class SaveRecoveryStore {
  public constructor(
    private readonly storage: RecoveryStorage,
    private readonly maxPoints = 5,
  ) {}

  public list(uid: string): readonly SaveRecoveryPoint[] {
    const raw = this.storage.getItem(key(uid));
    if (!raw) return [];
    try {
      const value = JSON.parse(raw) as unknown;
      if (!Array.isArray(value)) return [];
      return value
        .filter((entry): entry is SaveRecoveryPoint => isRecoveryPoint(entry, uid))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, this.maxPoints)
        .map(clonePoint);
    } catch {
      this.storage.removeItem(key(uid));
      return [];
    }
  }

  public capture(
    profile: PlayerProfile,
    reason: SaveRecoveryReason,
    createdAt = Date.now(),
  ): SaveRecoveryPoint {
    const points = [...this.list(profile.uid)];
    const latest = points[0];
    if (latest && latest.profile.updatedAt === profile.updatedAt && latest.reason === reason) {
      return latest;
    }

    const point: SaveRecoveryPoint = {
      id: `${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
      uid: profile.uid,
      reason,
      createdAt,
      profile: cloneProfile(profile),
    };
    const next = [point, ...points]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, Math.max(1, this.maxPoints));
    this.storage.setItem(key(profile.uid), JSON.stringify(next));
    return clonePoint(point);
  }


  public merge(uid: string, incoming: readonly SaveRecoveryPoint[]): number {
    const current = this.list(uid);
    const byId = new Map<string, SaveRecoveryPoint>();
    for (const point of [...incoming, ...current]) {
      if (!isRecoveryPoint(point, uid)) continue;
      const existing = byId.get(point.id);
      if (!existing || point.createdAt > existing.createdAt) byId.set(point.id, clonePoint(point));
    }
    const next = [...byId.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, Math.max(1, this.maxPoints));
    if (next.length === 0) {
      this.storage.removeItem(key(uid));
      return 0;
    }
    this.storage.setItem(key(uid), JSON.stringify(next));
    return next.length;
  }

  public find(uid: string, pointId: string): SaveRecoveryPoint | null {
    return this.list(uid).find((point) => point.id === pointId) ?? null;
  }

  public remove(uid: string, pointId: string): void {
    const next = this.list(uid).filter((point) => point.id !== pointId);
    if (next.length === 0) {
      this.storage.removeItem(key(uid));
      return;
    }
    this.storage.setItem(key(uid), JSON.stringify(next));
  }
}

export function recoveryReasonLabel(reason: SaveRecoveryReason): string {
  const labels: Readonly<Record<SaveRecoveryReason, string>> = {
    manual: '수동 백업',
    'pre-cloud-download': '클라우드 다운로드 전',
    'pre-cloud-upload': '클라우드 업로드 전',
    'pre-auto-merge': '자동 병합 전',
    'pre-logout': '로그아웃 전',
    'pre-json-import': 'JSON 가져오기 전',
  };
  return labels[reason];
}

function key(uid: string): string {
  return `lumerift.cloud.recovery.v1.${uid}`;
}

function isRecoveryPoint(value: unknown, uid: string): value is SaveRecoveryPoint {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  const profile = entry.profile;
  return typeof entry.id === 'string'
    && entry.uid === uid
    && isReason(entry.reason)
    && typeof entry.createdAt === 'number'
    && Number.isFinite(entry.createdAt)
    && Boolean(profile && typeof profile === 'object' && !Array.isArray(profile) && (profile as Record<string, unknown>).uid === uid);
}

function isReason(value: unknown): value is SaveRecoveryReason {
  return value === 'manual'
    || value === 'pre-cloud-download'
    || value === 'pre-cloud-upload'
    || value === 'pre-auto-merge'
    || value === 'pre-logout'
    || value === 'pre-json-import';
}

function cloneProfile(profile: PlayerProfile): PlayerProfile {
  return JSON.parse(JSON.stringify(profile)) as PlayerProfile;
}

function clonePoint(point: SaveRecoveryPoint): SaveRecoveryPoint {
  return { ...point, profile: cloneProfile(point.profile) };
}
