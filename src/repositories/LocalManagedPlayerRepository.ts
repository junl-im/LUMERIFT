import type { PlayerProfile, PlayerRepository } from './PlayerRepository';
import { SaveRecoveryStore, type SaveRecoveryPoint, type SaveRecoveryReason } from '../services/cloud/SaveRecoveryStore';
import type {
  CloudSaveInspection,
  CloudSyncListener,
  CloudSyncSnapshot,
  ManagedPlayerRepository,
} from '../services/cloud/CloudSaveTypes';

export class LocalManagedPlayerRepository implements ManagedPlayerRepository {
  private readonly recovery = new SaveRecoveryStore(localStorage);
  public constructor(private readonly local: PlayerRepository) {}

  public get syncSnapshot(): CloudSyncSnapshot {
    return {
      state: navigator.onLine ? 'idle' : 'offline',
      pendingCount: 0,
      recoveryCount: this.recoveryCount(),
    };
  }

  public load(uid: string): Promise<PlayerProfile | null> { return this.local.load(uid); }
  public save(profile: PlayerProfile): Promise<void> { return this.local.save({ ...profile, updatedAt: Date.now() }); }

  public async inspect(uid: string): Promise<CloudSaveInspection> {
    const local = await this.local.load(uid);
    return { local, cloud: null, newest: local ? 'local' : 'none', conflict: false, comparedAt: Date.now() };
  }

  public uploadLocal(uid: string): Promise<PlayerProfile | null> { return this.local.load(uid); }
  public downloadCloud(): Promise<null> { return Promise.resolve(null); }
  public applyLocal(profile: PlayerProfile): Promise<void> { return this.local.save(profile); }
  public applyCloud(profile: PlayerProfile): Promise<void> { return this.local.save(profile); }
  public flushPending(): Promise<void> { return Promise.resolve(); }
  public listRecoveryPoints(uid: string): readonly SaveRecoveryPoint[] { return this.recovery.list(uid); }
  public async createRecoveryPoint(uid: string, reason: SaveRecoveryReason = 'manual'): Promise<SaveRecoveryPoint | null> {
    const profile = await this.local.load(uid);
    return profile ? this.recovery.capture(profile, reason) : null;
  }
  public async restoreRecoveryPoint(uid: string, pointId: string): Promise<PlayerProfile | null> {
    const point = this.recovery.find(uid, pointId);
    if (!point) return null;
    const profile: PlayerProfile = { ...point.profile, updatedAt: Date.now() };
    await this.local.save(profile);
    return profile;
  }
  public removeRecoveryPoint(uid: string, pointId: string): void { this.recovery.remove(uid, pointId); }
  public importRecoveryPoints(uid: string, points: readonly SaveRecoveryPoint[]): number { return this.recovery.merge(uid, points); }

  private recoveryCount(): number {
    const uid = this.currentUid();
    return uid ? this.recovery.list(uid).length : 0;
  }

  private currentUid(): string | undefined {
    const keys = Object.keys(localStorage).filter((entry) => entry.startsWith('lumerift.player.'));
    return keys[0]?.slice('lumerift.player.'.length);
  }

  public subscribe(listener: CloudSyncListener): () => void {
    listener(this.syncSnapshot);
    return () => undefined;
  }
}
