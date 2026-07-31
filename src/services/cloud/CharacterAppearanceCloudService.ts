import { STORAGE_KEYS } from '../../app/brand';
import {
  characterAppearanceArchiveRevision,
  compareCharacterAppearanceRevisions,
  createCharacterAppearanceCloudEnvelope,
  parseCharacterAppearanceCloudEnvelope,
  type CharacterAppearanceCloudEnvelope,
} from '../../core/presentation/CharacterAppearanceCloudSync';
import type { CharacterWardrobeArchive } from '../../core/presentation/CharacterWardrobeController';
import type { CharacterAppearanceCloudRepository } from '../../repositories/CharacterAppearanceCloudRepository';
import {
  CharacterAppearanceRecoveryStore,
  type CharacterAppearanceRecoveryArchive,
  type CharacterAppearanceRecoveryPoint,
  type CharacterAppearanceRecoveryReason,
} from './CharacterAppearanceRecoveryStore';

export type CharacterAppearanceCloudSyncStatus =
  | 'unavailable'
  | 'opt-in-required'
  | 'current'
  | 'uploaded'
  | 'remote-ready'
  | 'conflict'
  | 'queued';

export interface CharacterAppearanceCloudConflict {
  readonly detectedAt: number;
  readonly localRevision: string;
  readonly remote: CharacterAppearanceCloudEnvelope;
}

export interface CharacterAppearanceCloudLocalState {
  readonly schema: 'lumerift-character-appearance-cloud-state-v1';
  readonly ownerUid: string;
  readonly optIn: boolean;
  readonly lastSyncedRevision?: string;
  readonly lastSyncedAt?: number;
  readonly pendingEnvelope?: CharacterAppearanceCloudEnvelope;
  readonly remoteCandidate?: CharacterAppearanceCloudEnvelope;
  readonly conflict?: CharacterAppearanceCloudConflict;
  readonly lastError?: string;
}

export interface CharacterAppearanceCloudSyncResult {
  readonly status: CharacterAppearanceCloudSyncStatus;
  readonly localRevision: string;
  readonly remote?: CharacterAppearanceCloudEnvelope;
  readonly message: string;
}

const EMPTY_STATE = (ownerUid: string): CharacterAppearanceCloudLocalState => ({
  schema: 'lumerift-character-appearance-cloud-state-v1',
  ownerUid,
  optIn: false,
});

export class CharacterAppearanceCloudService {
  private readonly recoveryStore: CharacterAppearanceRecoveryStore;

  public constructor(
    private readonly repository: CharacterAppearanceCloudRepository,
    private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage(),
  ) {
    this.recoveryStore = new CharacterAppearanceRecoveryStore(storage);
  }

  public get available(): boolean {
    return this.repository.available;
  }

  public state(uid: string): CharacterAppearanceCloudLocalState {
    return loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceCloud), uid);
  }

  public recoveryPoints(uid: string): readonly CharacterAppearanceRecoveryPoint[] {
    return this.recoveryStore.list(uid);
  }

  public createRecoveryPoint(
    uid: string,
    archive: CharacterWardrobeArchive,
    reason: CharacterAppearanceRecoveryReason = 'manual',
    now = Date.now(),
  ): CharacterAppearanceRecoveryPoint {
    return this.recoveryStore.create(uid, archive, reason, now);
  }

  public findRecoveryPoint(uid: string, id: string): CharacterAppearanceRecoveryPoint | undefined {
    return this.recoveryStore.find(uid, id);
  }

  public deleteRecoveryPoint(uid: string, id: string): boolean {
    return this.recoveryStore.remove(uid, id);
  }

  public exportRecoveryArchive(uid: string, now = Date.now()): CharacterAppearanceRecoveryArchive {
    return this.recoveryStore.export(uid, now);
  }

  public importRecoveryArchive(uid: string, value: unknown): number {
    return this.recoveryStore.import(uid, value);
  }

  public setOptIn(uid: string, enabled: boolean): CharacterAppearanceCloudLocalState {
    const current = this.state(uid);
    const next: CharacterAppearanceCloudLocalState = enabled
      ? { ...current, optIn: true, lastError: undefined }
      : {
        ...current,
        optIn: false,
        pendingEnvelope: undefined,
        remoteCandidate: undefined,
        conflict: undefined,
        lastError: undefined,
      };
    this.commit(next);
    return next;
  }

  public async sync(uid: string, archive: CharacterWardrobeArchive, now = Date.now()): Promise<CharacterAppearanceCloudSyncResult> {
    const localRevision = characterAppearanceArchiveRevision(archive);
    const state = this.state(uid);
    if (!this.available) {
      return { status: 'unavailable', localRevision, message: 'Firestore가 준비되지 않아 Cloud Save를 사용할 수 없습니다.' };
    }
    if (!state.optIn) {
      return { status: 'opt-in-required', localRevision, message: 'Cloud Save 사용 동의가 필요합니다.' };
    }

    if (state.pendingEnvelope) {
      const retried = await this.trySave(state.pendingEnvelope, state);
      if (!retried) {
        return {
          status: 'queued',
          localRevision,
          message: '이전 업로드가 로컬 재시도 큐에 남아 있습니다. 네트워크 연결 후 다시 시도하세요.',
        };
      }
    }

    const currentState = this.state(uid);
    const remote = await this.repository.load(uid);
    if (!remote) return this.upload(uid, archive, now, '첫 Cloud Save를 업로드했습니다.');

    const comparison = compareCharacterAppearanceRevisions(
      localRevision,
      remote.revision,
      currentState.lastSyncedRevision,
    );
    if (comparison === 'identical') {
      this.commit({
        ...currentState,
        lastSyncedRevision: remote.revision,
        lastSyncedAt: now,
        remoteCandidate: undefined,
        conflict: undefined,
        lastError: undefined,
      });
      return { status: 'current', localRevision, remote, message: '로컬과 Cloud 외형 프리셋이 동일합니다.' };
    }
    if (comparison === 'local-only-change') {
      return this.upload(uid, archive, now, '로컬 변경 내용을 Cloud에 업로드했습니다.');
    }
    if (comparison === 'remote-only-change') {
      this.commit({
        ...currentState,
        remoteCandidate: remote,
        conflict: undefined,
        lastError: undefined,
      });
      return {
        status: 'remote-ready',
        localRevision,
        remote,
        message: 'Cloud에만 새로운 변경이 있습니다. 확인 후 가져오세요.',
      };
    }

    const conflict: CharacterAppearanceCloudConflict = {
      detectedAt: now,
      localRevision,
      remote,
    };
    this.commit({ ...currentState, remoteCandidate: remote, conflict, lastError: undefined });
    return {
      status: 'conflict',
      localRevision,
      remote,
      message: comparison === 'first-sync-conflict'
        ? '첫 동기화에서 로컬과 Cloud 내용이 달라 수동 선택이 필요합니다.'
        : '로컬과 Cloud가 각각 변경되어 충돌했습니다. 사용할 쪽을 선택하세요.',
    };
  }

  public async upload(
    uid: string,
    archive: CharacterWardrobeArchive,
    now = Date.now(),
    successMessage = '로컬 외형 프리셋을 Cloud에 업로드했습니다.',
  ): Promise<CharacterAppearanceCloudSyncResult> {
    const state = this.requireOptIn(uid);
    this.recoveryStore.create(uid, archive, 'pre-cloud-upload', now);
    const envelope = createCharacterAppearanceCloudEnvelope(uid, archive, now);
    const queuedState: CharacterAppearanceCloudLocalState = {
      ...state,
      pendingEnvelope: envelope,
      remoteCandidate: undefined,
      conflict: undefined,
      lastError: undefined,
    };
    this.commit(queuedState);
    const saved = await this.trySave(envelope, queuedState);
    if (!saved) {
      return {
        status: 'queued',
        localRevision: envelope.revision,
        message: '업로드하지 못해 로컬 재시도 큐에 안전하게 보관했습니다.',
      };
    }
    return {
      status: 'uploaded',
      localRevision: envelope.revision,
      remote: envelope,
      message: successMessage,
    };
  }

  public async applyRemoteAndConsolidate(
    uid: string,
    remote: CharacterAppearanceCloudEnvelope,
    mergedArchive: CharacterWardrobeArchive,
    now = Date.now(),
  ): Promise<CharacterAppearanceCloudSyncResult> {
    if (remote.ownerUid !== uid.trim()) throw new Error('다른 사용자의 외형 프리셋은 적용할 수 없습니다.');
    return this.upload(uid, mergedArchive, now, 'Cloud 내용을 로컬 고정 슬롯과 병합하고 통합본을 다시 업로드했습니다.');
  }

  public clearConflict(uid: string): void {
    const state = this.state(uid);
    this.commit({ ...state, remoteCandidate: undefined, conflict: undefined, lastError: undefined });
  }

  private requireOptIn(uid: string): CharacterAppearanceCloudLocalState {
    if (!this.available) throw new Error('Firestore가 준비되지 않아 외형 프리셋 Cloud Save를 사용할 수 없습니다.');
    const state = this.state(uid);
    if (!state.optIn) throw new Error('외형 프리셋 Cloud Save 사용 동의가 필요합니다.');
    return state;
  }

  private async trySave(
    envelope: CharacterAppearanceCloudEnvelope,
    state: CharacterAppearanceCloudLocalState,
  ): Promise<boolean> {
    try {
      await this.repository.save(envelope);
      this.commit({
        ...state,
        pendingEnvelope: undefined,
        remoteCandidate: undefined,
        conflict: undefined,
        lastSyncedRevision: envelope.revision,
        lastSyncedAt: envelope.updatedAt,
        lastError: undefined,
      });
      return true;
    } catch (error: unknown) {
      this.commit({
        ...state,
        pendingEnvelope: envelope,
        lastError: error instanceof Error ? error.message : 'Cloud Save 업로드에 실패했습니다.',
      });
      return false;
    }
  }

  private commit(state: CharacterAppearanceCloudLocalState): void {
    this.storage?.setItem(STORAGE_KEYS.characterAppearanceCloud, JSON.stringify(state));
  }
}

function loadState(raw: string | null | undefined, uid: string): CharacterAppearanceCloudLocalState {
  const ownerUid = uid.trim();
  if (!raw) return EMPTY_STATE(ownerUid);
  try {
    const parsed = JSON.parse(raw) as Partial<CharacterAppearanceCloudLocalState>;
    if (parsed.schema !== 'lumerift-character-appearance-cloud-state-v1' || parsed.ownerUid !== ownerUid) {
      return EMPTY_STATE(ownerUid);
    }
    return {
      schema: 'lumerift-character-appearance-cloud-state-v1',
      ownerUid,
      optIn: parsed.optIn === true,
      lastSyncedRevision: validRevision(parsed.lastSyncedRevision),
      lastSyncedAt: finitePositive(parsed.lastSyncedAt),
      pendingEnvelope: parseStoredEnvelope(parsed.pendingEnvelope, ownerUid),
      remoteCandidate: parseStoredEnvelope(parsed.remoteCandidate, ownerUid),
      conflict: parseConflict(parsed.conflict, ownerUid),
      lastError: typeof parsed.lastError === 'string' ? parsed.lastError.slice(0, 240) : undefined,
    };
  } catch {
    return EMPTY_STATE(ownerUid);
  }
}

function parseStoredEnvelope(value: unknown, uid: string): CharacterAppearanceCloudEnvelope | undefined {
  try {
    return parseCharacterAppearanceCloudEnvelope(value, uid);
  } catch {
    return undefined;
  }
}

function parseConflict(value: unknown, uid: string): CharacterAppearanceCloudConflict | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceCloudConflict>;
  const remote = parseStoredEnvelope(record.remote, uid);
  const detectedAt = finitePositive(record.detectedAt);
  const localRevision = validRevision(record.localRevision);
  if (!remote || !detectedAt || !localRevision) return undefined;
  return { detectedAt, localRevision, remote };
}

function validRevision(value: unknown): string | undefined {
  return typeof value === 'string' && /^appearance-[0-9a-f]{8}$/.test(value) ? value : undefined;
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
