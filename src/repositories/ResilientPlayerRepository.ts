import type { PlayerProfile, PlayerRepository } from './PlayerRepository';

interface PendingSaveRecord {
  readonly profile: PlayerProfile;
  readonly queuedAt: number;
}

export type CloudSyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export class ResilientPlayerRepository implements PlayerRepository {
  private state: CloudSyncState = navigator.onLine ? 'idle' : 'offline';

  public constructor(
    private readonly local: PlayerRepository,
    private readonly cloud: PlayerRepository,
  ) {
    window.addEventListener('online', () => {
      this.state = 'idle';
      void this.flushPending();
    });
    window.addEventListener('offline', () => { this.state = 'offline'; });
  }

  public get syncState(): CloudSyncState {
    return this.state;
  }

  public async load(uid: string): Promise<PlayerProfile | null> {
    await this.flushPending(uid);
    const [localResult, cloudResult] = await Promise.allSettled([
      this.local.load(uid),
      this.cloud.load(uid),
    ]);

    const localProfile = localResult.status === 'fulfilled' ? localResult.value : null;
    const cloudProfile = cloudResult.status === 'fulfilled' ? cloudResult.value : null;
    const selected = chooseNewest(localProfile, cloudProfile);
    if (!selected) return null;

    await this.local.save(selected);
    if (!cloudProfile || selected.updatedAt > cloudProfile.updatedAt) {
      await this.tryCloudSave(selected);
    } else {
      this.state = 'synced';
    }
    return selected;
  }

  public async save(profile: PlayerProfile): Promise<void> {
    await this.local.save(profile);
    await this.tryCloudSave(profile);
  }

  public async flushPending(uid?: string): Promise<void> {
    if (!navigator.onLine) {
      this.state = 'offline';
      return;
    }

    const keys = Object.keys(localStorage).filter((key) => key.startsWith(PENDING_PREFIX));
    for (const key of keys) {
      if (uid && key !== pendingKey(uid)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const record = JSON.parse(raw) as PendingSaveRecord;
        await this.cloud.save(record.profile);
        localStorage.removeItem(key);
        this.state = 'synced';
      } catch (error: unknown) {
        this.state = navigator.onLine ? 'error' : 'offline';
        console.warn('[Cloud Save] 대기 중인 저장 동기화에 실패했습니다.', error);
        return;
      }
    }
  }

  private async tryCloudSave(profile: PlayerProfile): Promise<void> {
    if (!navigator.onLine) {
      this.queue(profile);
      this.state = 'offline';
      return;
    }

    this.state = 'syncing';
    try {
      await this.cloud.save(profile);
      localStorage.removeItem(pendingKey(profile.uid));
      this.state = 'synced';
    } catch (error: unknown) {
      this.queue(profile);
      this.state = 'error';
      console.warn('[Cloud Save] 저장 실패. 로컬 대기열에 보관합니다.', error);
    }
  }

  private queue(profile: PlayerProfile): void {
    const record: PendingSaveRecord = { profile, queuedAt: Date.now() };
    localStorage.setItem(pendingKey(profile.uid), JSON.stringify(record));
  }
}

const PENDING_PREFIX = 'lumerift.cloud.pending.';

function pendingKey(uid: string): string {
  return `${PENDING_PREFIX}${uid}`;
}

function chooseNewest(
  localProfile: PlayerProfile | null,
  cloudProfile: PlayerProfile | null,
): PlayerProfile | null {
  if (!localProfile) return cloudProfile;
  if (!cloudProfile) return localProfile;
  return localProfile.updatedAt >= cloudProfile.updatedAt ? localProfile : cloudProfile;
}
