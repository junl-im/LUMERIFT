import type { PlayerProfile, PlayerRepository } from '../../repositories/PlayerRepository';
import type { SaveRecoveryPoint, SaveRecoveryReason } from './SaveRecoveryStore';

export type CloudSyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface CloudSaveInspection {
  readonly local: PlayerProfile | null;
  readonly cloud: PlayerProfile | null;
  readonly newest: 'local' | 'cloud' | 'same' | 'none';
  readonly conflict: boolean;
  readonly comparedAt: number;
}

export interface CloudSyncSnapshot {
  readonly state: CloudSyncState;
  readonly lastSyncedAt?: number;
  readonly lastError?: string;
  readonly pendingCount: number;
  readonly recoveryCount: number;
}

export type CloudSyncListener = (snapshot: CloudSyncSnapshot) => void;

export interface ManagedPlayerRepository extends PlayerRepository {
  readonly syncSnapshot: CloudSyncSnapshot;
  inspect(uid: string): Promise<CloudSaveInspection>;
  uploadLocal(uid: string): Promise<PlayerProfile | null>;
  downloadCloud(uid: string): Promise<PlayerProfile | null>;
  applyLocal(profile: PlayerProfile): Promise<void>;
  applyCloud(profile: PlayerProfile): Promise<void>;
  flushPending(uid?: string): Promise<void>;
  listRecoveryPoints(uid: string): readonly SaveRecoveryPoint[];
  createRecoveryPoint(uid: string, reason?: SaveRecoveryReason): Promise<SaveRecoveryPoint | null>;
  restoreRecoveryPoint(uid: string, pointId: string): Promise<PlayerProfile | null>;
  removeRecoveryPoint(uid: string, pointId: string): void;
  subscribe(listener: CloudSyncListener): () => void;
}
