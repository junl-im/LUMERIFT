import { STORAGE_KEYS } from '../../app/brand';

export type CharacterAppearanceAuditAction =
  | 'recovery-created'
  | 'recovery-renamed'
  | 'recovery-pinned'
  | 'recovery-unpinned'
  | 'recovery-deleted'
  | 'recovery-imported'
  | 'recovery-restored'
  | 'recovery-diff-exported'
  | 'cloud-sync-checked'
  | 'cloud-uploaded'
  | 'cloud-upload-queued'
  | 'conflict-merge-applied'
  | 'merge-undo-applied';

export interface CharacterAppearanceAuditRecord {
  readonly schema: 'lumerift-character-appearance-audit-record-v1';
  readonly id: string;
  readonly ownerUid: string;
  readonly action: CharacterAppearanceAuditAction;
  readonly createdAt: number;
  readonly title: string;
  readonly recoveryPointIds: readonly string[];
  readonly revisions: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean>>;
}

export interface CharacterAppearanceAuditArchive {
  readonly schema: 'lumerift-character-appearance-audit-archive-v1';
  readonly ownerUid: string;
  readonly exportedAt: number;
  readonly records: readonly CharacterAppearanceAuditRecord[];
}

interface CharacterAppearanceAuditState {
  readonly schema: 'lumerift-character-appearance-audit-store-v1';
  readonly owners: Readonly<Record<string, readonly CharacterAppearanceAuditRecord[]>>;
}

export interface CharacterAppearanceAuditInput {
  readonly action: CharacterAppearanceAuditAction;
  readonly title: string;
  readonly recoveryPointIds?: readonly string[];
  readonly revisions?: readonly string[];
  readonly details?: Readonly<Record<string, string | number | boolean>>;
}

export const CHARACTER_APPEARANCE_AUDIT_LIMIT = 100;
const AUDIT_ACTIONS = new Set<CharacterAppearanceAuditAction>([
  'recovery-created', 'recovery-renamed', 'recovery-pinned', 'recovery-unpinned',
  'recovery-deleted', 'recovery-imported', 'recovery-restored', 'recovery-diff-exported',
  'cloud-sync-checked', 'cloud-uploaded', 'cloud-upload-queued',
  'conflict-merge-applied', 'merge-undo-applied',
]);
const EMPTY_STATE: CharacterAppearanceAuditState = { schema: 'lumerift-character-appearance-audit-store-v1', owners: {} };

export class CharacterAppearanceAuditStore {
  public constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | undefined = getStorage()) {}

  public list(uid: string): readonly CharacterAppearanceAuditRecord[] {
    const ownerUid = normalizeUid(uid);
    const records = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceAudit)).owners[ownerUid] ?? [];
    return records.map(cloneRecord);
  }

  public record(uid: string, input: CharacterAppearanceAuditInput, now = Date.now()): CharacterAppearanceAuditRecord {
    const ownerUid = normalizeUid(uid);
    const createdAt = Math.max(1, Math.floor(now));
    const record: CharacterAppearanceAuditRecord = {
      schema: 'lumerift-character-appearance-audit-record-v1',
      id: `appearance-audit-${createdAt.toString(36)}-${input.action}-${auditFingerprint(input)}`,
      ownerUid,
      action: input.action,
      createdAt,
      title: normalizeText(input.title, '외형 변경 기록', 80),
      recoveryPointIds: normalizeValues(input.recoveryPointIds, 12, 120),
      revisions: normalizeValues(input.revisions, 8, 120),
      details: normalizeDetails(input.details),
    };
    const next = [record, ...this.list(ownerUid).filter((entry) => entry.id !== record.id)]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, CHARACTER_APPEARANCE_AUDIT_LIMIT);
    this.commit(ownerUid, next);
    return cloneRecord(record);
  }

  public export(uid: string, recoveryPointIds: readonly string[] = [], now = Date.now()): CharacterAppearanceAuditArchive {
    const ownerUid = normalizeUid(uid);
    const selected = new Set(normalizeValues(recoveryPointIds, 20, 120));
    const records = this.list(ownerUid).filter((record) => !selected.size
      || record.recoveryPointIds.some((id) => selected.has(id)));
    return {
      schema: 'lumerift-character-appearance-audit-archive-v1',
      ownerUid,
      exportedAt: Math.max(1, Math.floor(now)),
      records,
    };
  }

  private commit(uid: string, records: readonly CharacterAppearanceAuditRecord[]): void {
    const state = loadState(this.storage?.getItem(STORAGE_KEYS.characterAppearanceAudit));
    const next: CharacterAppearanceAuditState = {
      schema: 'lumerift-character-appearance-audit-store-v1',
      owners: { ...state.owners, [uid]: records.slice(0, CHARACTER_APPEARANCE_AUDIT_LIMIT).map(cloneRecord) },
    };
    this.storage?.setItem(STORAGE_KEYS.characterAppearanceAudit, JSON.stringify(next));
  }
}

export function characterAppearanceAuditActionLabel(action: CharacterAppearanceAuditAction): string {
  const labels: Readonly<Record<CharacterAppearanceAuditAction, string>> = {
    'recovery-created': '복구 지점 생성',
    'recovery-renamed': '복구 지점 이름 변경',
    'recovery-pinned': '복구 지점 고정',
    'recovery-unpinned': '복구 지점 고정 해제',
    'recovery-deleted': '복구 지점 삭제',
    'recovery-imported': '복구 묶음 가져오기',
    'recovery-restored': '복구 지점 적용',
    'recovery-diff-exported': '복구 차이 내보내기',
    'cloud-sync-checked': 'Cloud 동기화 검사',
    'cloud-uploaded': 'Cloud 업로드',
    'cloud-upload-queued': 'Cloud 업로드 대기',
    'conflict-merge-applied': '충돌 선택 병합',
    'merge-undo-applied': '병합 실행 취소',
  };
  return labels[action];
}

function loadState(raw: string | null | undefined): CharacterAppearanceAuditState {
  if (!raw) return EMPTY_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<CharacterAppearanceAuditState>;
    if (parsed.schema !== 'lumerift-character-appearance-audit-store-v1'
      || !parsed.owners || typeof parsed.owners !== 'object') return EMPTY_STATE;
    const owners: Record<string, CharacterAppearanceAuditRecord[]> = {};
    for (const [uid, values] of Object.entries(parsed.owners)) {
      if (!Array.isArray(values)) continue;
      const records = values.map((value) => parseRecord(value, uid))
        .filter((value): value is CharacterAppearanceAuditRecord => Boolean(value))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, CHARACTER_APPEARANCE_AUDIT_LIMIT);
      if (records.length) owners[uid] = records;
    }
    return { schema: 'lumerift-character-appearance-audit-store-v1', owners };
  } catch {
    return EMPTY_STATE;
  }
}

function parseRecord(value: unknown, uid: string): CharacterAppearanceAuditRecord | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Partial<CharacterAppearanceAuditRecord>;
  if (record.schema !== 'lumerift-character-appearance-audit-record-v1' || record.ownerUid !== uid) return undefined;
  if (typeof record.id !== 'string' || typeof record.action !== 'string' || typeof record.title !== 'string') return undefined;
  if (!AUDIT_ACTIONS.has(record.action as CharacterAppearanceAuditAction)) return undefined;
  if (!Number.isFinite(record.createdAt) || (record.createdAt ?? 0) <= 0) return undefined;
  return {
    schema: 'lumerift-character-appearance-audit-record-v1',
    id: record.id.slice(0, 160),
    ownerUid: uid,
    action: record.action as CharacterAppearanceAuditAction,
    createdAt: Math.floor(record.createdAt as number),
    title: normalizeText(record.title, '외형 변경 기록', 80),
    recoveryPointIds: normalizeValues(record.recoveryPointIds, 12, 120),
    revisions: normalizeValues(record.revisions, 8, 120),
    details: normalizeDetails(record.details),
  };
}

function auditFingerprint(input: CharacterAppearanceAuditInput): string {
  const source = [input.title, ...(input.recoveryPointIds ?? []), ...(input.revisions ?? [])].join('|');
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}

function normalizeUid(value: string): string {
  const uid = value.trim();
  if (!uid) throw new Error('외형 감사 기록에는 사용자 UID가 필요합니다.');
  return uid;
}

function normalizeValues(values: readonly string[] | undefined, limit: number, maxLength: number): readonly string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map((value) => value.trim().slice(0, maxLength)))].slice(0, limit);
}

function normalizeText(value: string, fallback: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  return (normalized || fallback).slice(0, maxLength);
}

function normalizeDetails(value: Readonly<Record<string, string | number | boolean>> | undefined): Readonly<Record<string, string | number | boolean>> {
  if (!value || typeof value !== 'object') return {};
  const details: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value).slice(0, 20)) {
    if (typeof raw === 'string') details[key.slice(0, 40)] = raw.slice(0, 240);
    else if (typeof raw === 'number' && Number.isFinite(raw)) details[key.slice(0, 40)] = raw;
    else if (typeof raw === 'boolean') details[key.slice(0, 40)] = raw;
  }
  return details;
}

function cloneRecord(record: CharacterAppearanceAuditRecord): CharacterAppearanceAuditRecord {
  return {
    ...record,
    recoveryPointIds: [...record.recoveryPointIds],
    revisions: [...record.revisions],
    details: { ...record.details },
  };
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
