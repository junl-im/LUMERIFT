import type { PlayerProfile, PlayerRepository } from './PlayerRepository';
import type {
  CloudSaveInspection,
  CloudSyncListener,
  CloudSyncSnapshot,
  CloudSyncState,
  ManagedPlayerRepository,
} from '../services/cloud/CloudSaveTypes';
import { chooseNewest, compareProfiles } from '../services/cloud/cloudSaveLogic';
import { SaveRecoveryStore, type SaveRecoveryPoint, type SaveRecoveryReason } from '../services/cloud/SaveRecoveryStore';

interface PendingSaveRecord {
  readonly profile: PlayerProfile;
  readonly queuedAt: number;
}

export class ResilientPlayerRepository implements ManagedPlayerRepository {
  private state: CloudSyncState = navigator.onLine ? 'idle' : 'offline';
  private lastSyncedAt?: number;
  private lastError?: string;
  private readonly listeners = new Set<CloudSyncListener>();
  private readonly recovery = new SaveRecoveryStore(localStorage);

  public constructor(
    private readonly local: PlayerRepository,
    private readonly cloud: PlayerRepository,
  ) {
    window.addEventListener('online', () => {
      this.setState('idle');
      void this.flushPending();
    });
    window.addEventListener('offline', () => this.setState('offline'));
  }

  public get syncSnapshot(): CloudSyncSnapshot {
    return {
      state: this.state,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      pendingCount: this.pendingCount(),
      recoveryCount: this.recoveryCount(),
    };
  }

  public subscribe(listener: CloudSyncListener): () => void {
    this.listeners.add(listener);
    listener(this.syncSnapshot);
    return () => this.listeners.delete(listener);
  }

  public async inspect(uid: string): Promise<CloudSaveInspection> {
    const [localResult, cloudResult] = await Promise.allSettled([
      this.local.load(uid),
      this.cloud.load(uid),
    ]);
    const localProfile = localResult.status === 'fulfilled' ? localResult.value : null;
    const cloudProfile = cloudResult.status === 'fulfilled' ? cloudResult.value : null;
    const newest = compareProfiles(localProfile, cloudProfile);
    const conflict = Boolean(
      localProfile
      && cloudProfile
      && Math.abs(localProfile.updatedAt - cloudProfile.updatedAt) > CONFLICT_TOLERANCE_MS,
    );
    return { local: localProfile, cloud: cloudProfile, newest, conflict, comparedAt: Date.now() };
  }

  public async load(uid: string): Promise<PlayerProfile | null> {
    await this.flushPending(uid);
    const inspection = await this.inspect(uid);
    const selected = chooseNewest(inspection.local, inspection.cloud);
    if (!selected) return null;

    if (inspection.local && selected === inspection.cloud && selected.updatedAt > inspection.local.updatedAt) {
      this.recovery.capture(inspection.local, 'pre-auto-merge');
    }
    await this.local.save(selected);
    if (!inspection.cloud || selected.updatedAt > inspection.cloud.updatedAt) {
      await this.tryCloudSave(selected);
    } else {
      this.markSynced();
    }
    return selected;
  }

  public async save(profile: PlayerProfile): Promise<void> {
    const stamped: PlayerProfile = { ...profile, updatedAt: Date.now() };
    await this.local.save(stamped);
    await this.tryCloudSave(stamped);
  }

  public async uploadLocal(uid: string): Promise<PlayerProfile | null> {
    const profile = await this.local.load(uid);
    if (!profile) return null;
    this.recovery.capture(profile, 'pre-cloud-upload');
    this.setState('syncing');
    try {
      await this.cloud.save(profile);
      localStorage.removeItem(pendingKey(uid));
      this.markSynced();
      return profile;
    } catch (error: unknown) {
      this.queue(profile);
      this.setError(error);
      throw error;
    }
  }

  public async downloadCloud(uid: string): Promise<PlayerProfile | null> {
    this.setState('syncing');
    try {
      const profile = await this.cloud.load(uid);
      if (!profile) {
        this.setState('idle');
        return null;
      }
      const currentLocal = await this.local.load(uid);
      if (currentLocal) this.recovery.capture(currentLocal, 'pre-cloud-download');
      await this.local.save(profile);
      this.markSynced();
      return profile;
    } catch (error: unknown) {
      this.setError(error);
      throw error;
    }
  }

  public async applyLocal(profile: PlayerProfile): Promise<void> {
    await this.local.save(profile);
    this.notify();
  }

  public async applyCloud(profile: PlayerProfile): Promise<void> {
    this.setState('syncing');
    try {
      await this.cloud.save(profile);
      await this.local.save(profile);
      localStorage.removeItem(pendingKey(profile.uid));
      this.markSynced();
    } catch (error: unknown) {
      this.queue(profile);
      this.setError(error);
      throw error;
    }
  }

  public listRecoveryPoints(uid: string): readonly SaveRecoveryPoint[] {
    return this.recovery.list(uid);
  }

  public async createRecoveryPoint(
    uid: string,
    reason: SaveRecoveryReason = 'manual',
  ): Promise<SaveRecoveryPoint | null> {
    const profile = await this.local.load(uid);
    if (!profile) return null;
    const point = this.recovery.capture(profile, reason);
    this.notify();
    return point;
  }

  public async restoreRecoveryPoint(uid: string, pointId: string): Promise<PlayerProfile | null> {
    const point = this.recovery.find(uid, pointId);
    if (!point) return null;
    const restored: PlayerProfile = { ...point.profile, updatedAt: Date.now() };
    await this.local.save(restored);
    await this.tryCloudSave(restored);
    this.notify();
    return restored;
  }

  public removeRecoveryPoint(uid: string, pointId: string): void {
    this.recovery.remove(uid, pointId);
    this.notify();
  }

  public importRecoveryPoints(uid: string, points: readonly SaveRecoveryPoint[]): number {
    const count = this.recovery.merge(uid, points);
    this.notify();
    return count;
  }

  public async flushPending(uid?: string): Promise<void> {
    if (!navigator.onLine) {
      this.setState('offline');
      return;
    }

    const keys = Object.keys(localStorage).filter((key) => key.startsWith(PENDING_PREFIX));
    for (const key of keys) {
      if (uid && key !== pendingKey(uid)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const record = JSON.parse(raw) as PendingSaveRecord;
        this.setState('syncing');
        await this.cloud.save(record.profile);
        localStorage.removeItem(key);
        this.markSynced();
      } catch (error: unknown) {
        this.setError(error);
        console.warn('[Cloud Save] 대기 중인 저장 동기화에 실패했습니다.', error);
        return;
      }
    }
  }

  private async tryCloudSave(profile: PlayerProfile): Promise<void> {
    if (!navigator.onLine) {
      this.queue(profile);
      this.setState('offline');
      return;
    }

    this.setState('syncing');
    try {
      await this.cloud.save(profile);
      localStorage.removeItem(pendingKey(profile.uid));
      this.markSynced();
    } catch (error: unknown) {
      this.queue(profile);
      this.setError(error);
      console.warn('[Cloud Save] 저장 실패. 로컬 대기열에 보관합니다.', error);
    }
  }

  private queue(profile: PlayerProfile): void {
    const record: PendingSaveRecord = { profile, queuedAt: Date.now() };
    localStorage.setItem(pendingKey(profile.uid), JSON.stringify(record));
    this.notify();
  }

  private pendingCount(): number {
    return Object.keys(localStorage).filter((key) => key.startsWith(PENDING_PREFIX)).length;
  }

  private recoveryCount(): number {
    const keys = Object.keys(localStorage).filter((entry) => entry.startsWith('lumerift.cloud.recovery.v1.'));
    let count = 0;
    for (const entry of keys) {
      const uid = entry.slice('lumerift.cloud.recovery.v1.'.length);
      count += this.recovery.list(uid).length;
    }
    return count;
  }

  private markSynced(): void {
    this.lastSyncedAt = Date.now();
    this.lastError = undefined;
    this.setState('synced');
  }

  private setError(error: unknown): void {
    this.lastError = error instanceof Error ? error.message : 'Cloud Save 동기화 오류';
    this.setState(navigator.onLine ? 'error' : 'offline');
  }

  private setState(state: CloudSyncState): void {
    this.state = state;
    this.notify();
  }

  private notify(): void {
    const snapshot = this.syncSnapshot;
    for (const listener of this.listeners) listener(snapshot);
  }
}

const PENDING_PREFIX = 'lumerift.cloud.pending.';
const CONFLICT_TOLERANCE_MS = 2_000;

function pendingKey(uid: string): string {
  return `${PENDING_PREFIX}${uid}`;
}

