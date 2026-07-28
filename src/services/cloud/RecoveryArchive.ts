import { BRAND } from '../../app/brand';
import { migratePlayerProfile, type PlayerProfile } from '../../repositories/PlayerRepository';
import { resolveRankingSeason, seasonRangeLabel } from '../ranking/seasonLogic';
import type { SaveRecoveryPoint, SaveRecoveryReason } from './SaveRecoveryStore';

export const RECOVERY_ARCHIVE_SCHEMA = 'lumerift-recovery-archive-v1' as const;

export interface SeasonProgressSnapshot {
  readonly seasonId: string;
  readonly seasonLabel: string;
  readonly seasonRange: string;
  readonly capturedAt: number;
  readonly level: number;
  readonly highestStage: number;
  readonly gold: number;
  readonly stagesCleared: number;
  readonly monstersDefeated: number;
}

export interface RecoveryArchive {
  readonly schema: typeof RECOVERY_ARCHIVE_SCHEMA;
  readonly appVersion: string;
  readonly exportedAt: number;
  readonly uid: string;
  readonly profile: PlayerProfile;
  readonly recoveryPoints: readonly SaveRecoveryPoint[];
  readonly seasonSnapshot: SeasonProgressSnapshot;
}

export interface ParsedRecoveryArchive {
  readonly archive: RecoveryArchive;
  readonly importedRecoveryPoints: readonly SaveRecoveryPoint[];
}

export function createRecoveryArchive(
  profile: PlayerProfile,
  recoveryPoints: readonly SaveRecoveryPoint[],
  capturedAt = Date.now(),
): RecoveryArchive {
  const season = resolveRankingSeason(new Date(capturedAt));
  return {
    schema: RECOVERY_ARCHIVE_SCHEMA,
    appVersion: BRAND.version,
    exportedAt: capturedAt,
    uid: profile.uid,
    profile: cloneProfile(profile),
    recoveryPoints: recoveryPoints
      .filter((point) => point.uid === profile.uid)
      .slice(0, 5)
      .map(clonePoint),
    seasonSnapshot: {
      seasonId: season.id,
      seasonLabel: season.label,
      seasonRange: seasonRangeLabel(season),
      capturedAt,
      level: profile.level,
      highestStage: profile.highestStage,
      gold: profile.gold,
      stagesCleared: profile.statistics.stagesCleared,
      monstersDefeated: profile.statistics.monstersDefeated,
    },
  };
}

export function parseRecoveryArchive(raw: unknown, expectedUid: string): ParsedRecoveryArchive {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('복구 JSON 형식이 올바르지 않습니다.');
  }
  const value = raw as Record<string, unknown>;
  if (value.schema !== RECOVERY_ARCHIVE_SCHEMA) {
    throw new Error('지원하지 않는 복구 JSON 버전입니다.');
  }
  if (value.uid !== expectedUid) {
    throw new Error('현재 로그인 계정과 복구 JSON의 UID가 다릅니다.');
  }
  if (!value.profile || typeof value.profile !== 'object' || Array.isArray(value.profile)) {
    throw new Error('복구 JSON에 현재 저장 데이터가 없습니다.');
  }
  const profileUid = (value.profile as Record<string, unknown>).uid;
  if (profileUid !== expectedUid) {
    throw new Error('복구 JSON의 저장 UID가 현재 계정과 다릅니다.');
  }

  const profile = migratePlayerProfile(value.profile, expectedUid);
  const exportedAt = finiteTimestamp(value.exportedAt, Date.now());
  const recoveryPoints = parsePoints(value.recoveryPoints, expectedUid);
  const archive = createRecoveryArchive(profile, recoveryPoints, exportedAt);
  return { archive, importedRecoveryPoints: recoveryPoints };
}

export function recoveryArchiveFilename(profile: PlayerProfile, capturedAt = Date.now()): string {
  const timestamp = new Date(capturedAt).toISOString().replace(/[:.]/g, '-');
  const nickname = profile.nickname.replace(/[^0-9A-Za-z가-힣_-]+/g, '_').slice(0, 24) || 'player';
  return `LUMERIFT_RECOVERY_${nickname}_${timestamp}.json`;
}

function parsePoints(value: unknown, uid: string): readonly SaveRecoveryPoint[] {
  if (!Array.isArray(value)) return [];
  const points: SaveRecoveryPoint[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const entry = raw as Record<string, unknown>;
    if (entry.uid !== uid || typeof entry.id !== 'string' || !isReason(entry.reason)) continue;
    if (!entry.profile || typeof entry.profile !== 'object' || Array.isArray(entry.profile)) continue;
    if ((entry.profile as Record<string, unknown>).uid !== uid) continue;
    points.push({
      id: entry.id,
      uid,
      reason: entry.reason,
      createdAt: finiteTimestamp(entry.createdAt, Date.now()),
      profile: migratePlayerProfile(entry.profile, uid),
    });
  }
  return points.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5).map(clonePoint);
}

function isReason(value: unknown): value is SaveRecoveryReason {
  return value === 'manual'
    || value === 'pre-cloud-download'
    || value === 'pre-cloud-upload'
    || value === 'pre-auto-merge'
    || value === 'pre-logout'
    || value === 'pre-json-import';
}

function finiteTimestamp(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function cloneProfile(profile: PlayerProfile): PlayerProfile {
  return JSON.parse(JSON.stringify(profile)) as PlayerProfile;
}

function clonePoint(point: SaveRecoveryPoint): SaveRecoveryPoint {
  return { ...point, profile: cloneProfile(point.profile) };
}
